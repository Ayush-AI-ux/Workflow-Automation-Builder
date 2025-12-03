// src/models/Log.js
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  runId: { type: String, required: true }, // uuid for the run
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['success','failed','running'], default: 'running' },
  details: { type: mongoose.Schema.Types.Mixed } // store node outputs, errors etc.
});

module.exports = mongoose.models.Log || mongoose.model('Log', LogSchema);