const APIConfig = require('../models/APIModel');
const ExecutionTrace = require('../models/LogModel');

// Get all execution logs (can filter by API ID)
async function getLogs(req, res) {
  try {
    const filter = {};
    if (req.query.apiId) {
      filter.apiId = req.query.apiId;
    }
    const logs = await ExecutionTrace.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Clear all logs
async function clearLogs(req, res) {
  try {
    await ExecutionTrace.deleteMany({});
    return res.status(200).json({ success: true, message: 'Execution logs cleared' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Get dashboard aggregate analytics parameters
async function getStats(req, res) {
  try {
    const totalRuns = await ExecutionTrace.countDocuments();
    const successRuns = await ExecutionTrace.countDocuments({ status: 'SUCCESS' });
    const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 100;
    
    // Calculate average latency
    const traces = await ExecutionTrace.find({}, 'durationMs');
    const totalLatency = traces.reduce((sum, log) => sum + (log.durationMs || 0), 0);
    const avgLatency = traces.length > 0 ? Math.round(totalLatency / traces.length) : 0;
    
    const activeRoutes = await APIConfig.countDocuments();

    return res.status(200).json({
      totalRuns,
      successRate,
      avgLatency,
      activeRoutes
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getLogs,
  clearLogs,
  getStats
};
