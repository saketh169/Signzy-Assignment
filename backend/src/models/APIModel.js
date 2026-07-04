const mongoose = require('mongoose');

// Schema representing a downstream API request step within the flow
const StepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  url: { type: String, required: true },
  method: { type: String, uppercase: true, default: 'POST' },
  headers: { type: mongoose.Schema.Types.Mixed, default: {} },
  payloadMapping: { type: mongoose.Schema.Types.Mixed, default: {} },
  condition: { type: String, default: '' },
  retryCount: { type: Number, default: 0 },
  retryDelayMs: { type: Number, default: 1000 }
});

// Schema representing a user-created custom dynamic API route
const APISchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  endpoint: { type: String, required: true },
  method: { type: String, uppercase: true, default: 'POST' },
  requiredFields: [{ type: String }],
  steps: [StepSchema],
  outputTemplate: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('APIConfig', APISchema);
