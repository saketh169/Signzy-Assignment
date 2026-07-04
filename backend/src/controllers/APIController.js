const axios = require('axios');
const APIConfig = require('../models/APIModel');
const ExecutionTrace = require('../models/LogModel');
const { evaluateTemplate, evaluateCondition } = require('../utils/APIHelper');

// --- CRUD Configurations Controllers ---

// Get all custom APIs
async function getAPIs(req, res) {
  try {
    const apis = await APIConfig.find().sort({ createdAt: -1 });
    return res.status(200).json(apis);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Get single custom API
async function getAPIById(req, res) {
  try {
    const api = await APIConfig.findById(req.params.id);
    if (!api) return res.status(404).json({ success: false, message: 'API not found' });
    return res.status(200).json(api);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Create custom API
async function createAPI(req, res) {
  try {
    const newConfig = new APIConfig(req.body);
    await newConfig.save();
    return res.status(201).json(newConfig);
  } catch (err) {
    return res.status(550).json({ success: false, message: err.message });
  }
}

// Update custom API
async function updateAPI(req, res) {
  try {
    const updated = await APIConfig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'API not found' });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(550).json({ success: false, message: err.message });
  }
}

// Delete custom API
async function deleteAPI(req, res) {
  try {
    const deleted = await APIConfig.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'API not found' });
    return res.status(200).json({ success: true, message: 'API deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// --- Dynamic Gateway Runner Controller ---

// Wildcard endpoint handler that runs dynamic step chains
async function runDynamicAPI(req, res) {
  const startWorkflowTime = Date.now();
  const path = '/' + req.params[0];
  const method = req.method.toUpperCase();

  try {
    // Find registered API configuration
    const config = await APIConfig.findOne({ endpoint: path, method: method });
    if (!config) {
      return res.status(404).json({ success: false, message: `Route [${method}] ${path} not configured.` });
    }

    // Merge query params with body parameters for context referencing (supports GET routes mapping)
    const mergedParams = { ...req.query, ...req.body };
    const context = {
      req: {
        body: mergedParams,
        query: req.query,
        headers: req.headers
      },
      steps: {}
    };

    // Validate required fields
    const missing = [];
    for (const field of config.requiredFields || []) {
      if (mergedParams[field] === undefined || mergedParams[field] === null || mergedParams[field] === '') {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Validation failed. Missing required fields: ${missing.join(', ')}`
      });
    }

    const loggedSteps = [];
    let flowStatus = 'SUCCESS';

    // Execute downstream step calls sequentially
    for (const step of config.steps || []) {
      // Evaluate condition
      const shouldRun = evaluateCondition(step.condition, context);
      if (!shouldRun) {
        loggedSteps.push({
          stepId: step.id,
          stepName: step.name,
          status: 'SKIPPED',
          url: step.url,
          method: step.method
        });
        context.steps[step.id] = { status: 204, response: {}, skipped: true };
        continue;
      }

      // Dynamic header & payload compilation
      const resolvedUrl = evaluateTemplate(step.url, context);
      const resolvedHeaders = typeof step.headers === 'string' ? JSON.parse(step.headers || '{}') : evaluateTemplate(step.headers, context);
      const resolvedPayload = typeof step.payloadMapping === 'string' ? JSON.parse(step.payloadMapping || '{}') : evaluateTemplate(step.payloadMapping, context);

      let stepSuccess = false;
      let lastStatus = 0;
      let lastBody = {};
      let stepError = '';
      let retriesUsed = 0;
      const stepStartTime = Date.now();

      // Retry policy loop execution
      for (let attempt = 0; attempt <= (step.retryCount || 0); attempt++) {
        retriesUsed = attempt;
        try {
          const reqConfig = {
            method: step.method || 'POST',
            url: resolvedUrl,
            headers: { 'Content-Type': 'application/json', ...resolvedHeaders },
            timeout: 5000
          };

          if (reqConfig.method === 'GET') {
            reqConfig.params = resolvedPayload;
          } else {
            reqConfig.data = resolvedPayload;
          }

          const response = await axios(reqConfig);
          lastStatus = response.status;
          lastBody = response.data;
          stepSuccess = true;
          break; // Success! exit retry loop
        } catch (err) {
          lastStatus = err.response ? err.response.status : 500;
          lastBody = err.response ? err.response.data : { error: err.message };
          stepError = err.message;
          
          // Wait before retrying
          if (attempt < step.retryCount) {
            await new Promise(r => setTimeout(r, step.retryDelayMs || 1000));
          }
        }
      }

      const stepDuration = Date.now() - stepStartTime;

      // Log step status
      loggedSteps.push({
        stepId: step.id,
        stepName: step.name,
        url: resolvedUrl,
        method: step.method || 'POST',
        requestHeaders: resolvedHeaders,
        requestPayload: resolvedPayload,
        responseStatus: lastStatus,
        responseBody: lastBody,
        durationMs: stepDuration,
        status: stepSuccess ? 'SUCCESS' : 'FAILURE',
        errorMessage: stepSuccess ? '' : stepError,
        retriesUsed: retriesUsed
      });

      // Update evaluation context
      context.steps[step.id] = {
        status: lastStatus,
        response: lastBody,
        skipped: false
      };

      if (!stepSuccess) {
        flowStatus = 'FAILURE';
        break; // Stop executing downstream chain
      }
    }

    // Format output transformation
    let responsePayload = {};
    if (flowStatus === 'SUCCESS') {
      if (config.outputTemplate) {
        responsePayload = evaluateTemplate(config.outputTemplate, context);
      } else {
        // Standard Mode - return all steps raw data directly
        responsePayload = { success: true, steps: context.steps };
      }
    } else {
      responsePayload = { success: false, message: 'Step execution failed', steps: context.steps };
    }

    const totalDuration = Date.now() - startWorkflowTime;

    // Log trace to telemetry collection
    const trace = new ExecutionTrace({
      apiId: config._id,
      apiName: config.name,
      endpoint: path,
      method: method,
      requestPayload: mergedParams,
      responseStatus: flowStatus === 'SUCCESS' ? 200 : 502,
      responsePayload: responsePayload,
      durationMs: totalDuration,
      status: flowStatus,
      steps: loggedSteps
    });
    await trace.save();

    return res.status(flowStatus === 'SUCCESS' ? 200 : 502).json(responsePayload);
  } catch (err) {
    const totalDuration = Date.now() - startWorkflowTime;
    
    // Log crash trace
    const crashTrace = new ExecutionTrace({
      apiName: 'Gateway Crash Handler',
      endpoint: path,
      method: method,
      requestPayload: req.body,
      responseStatus: 500,
      responsePayload: { success: false, message: err.message },
      durationMs: totalDuration,
      status: 'FAILURE'
    });
    await crashTrace.save();

    return res.status(500).json({ success: false, message: 'Orchestrator execution crashed: ' + err.message });
  }
}

module.exports = {
  getAPIs,
  getAPIById,
  createAPI,
  updateAPI,
  deleteAPI,
  runDynamicAPI
};
