const mongoose = require('mongoose');

// Schema representing the execution telemetry of a single downstream call step
const StepLogSchema = new mongoose.Schema({
  stepId: { type: String, required: true },
  stepName: { type: String, default: '' },
  url: { type: String, default: '' },
  method: { type: String, default: 'POST' },
  requestHeaders: { type: mongoose.Schema.Types.Mixed, default: {} },
  requestPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
  responseStatus: { type: Number, default: 0 },
  responseBody: { type: mongoose.Schema.Types.Mixed, default: {} },
  durationMs: { type: Number, default: 0 },
  status: { type: String, enum: ['SUCCESS', 'SKIPPED', 'FAILURE'], default: 'SUCCESS' },
  errorMessage: { type: String, default: '' },
  retriesUsed: { type: Number, default: 0 }
});

// Schema representing the main execution log of a dynamic API call
const LogSchema = new mongoose.Schema({
  apiId: { type: mongoose.Schema.Types.ObjectId, ref: 'APIConfig' },
  apiName: { type: String, required: true },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  requestPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
  responseStatus: { type: Number, default: 200 },
  responsePayload: { type: mongoose.Schema.Types.Mixed, default: {} },
  durationMs: { type: Number, default: 0 },
  status: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' },
  steps: [StepLogSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExecutionTrace', LogSchema);
