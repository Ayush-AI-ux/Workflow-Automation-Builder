// src/models/Workflow.js
// const mongoose = require('mongoose');

// const WorkflowSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   definition: { type: mongoose.Schema.Types.Mixed, required: true }, // store React Flow JSON
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// WorkflowSchema.pre('save', function(next){
//   this.updatedAt = new Date();
//   next();
// });

// module.exports = mongoose.models.Workflow || mongoose.model('Workflow', WorkflowSchema);

const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  definition: { type: mongoose.Schema.Types.Mixed, required: true },
  
  // ←←← NEW: Scheduling fields ←←←
  schedule: {
    enabled: { type: Boolean, default: false },
    cron: { type: String, default: '0 9 * * *' }, // default: daily at 9 AM
    timezone: { type: String, default: 'UTC' },
    nextRunAt: { type: Date },
    lastRunAt: { type: Date }
  },
  // →→→ End of new fields

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

WorkflowSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isModified('schedule') && this.schedule.enabled) {
    // Optionally recalculate nextRunAt on save
    const cronTime = require('cron-time-generator');
    try {
      this.schedule.nextRunAt = cronTime[this.schedule.cron.replace(' ', '')]();
    } catch (e) { /* ignore invalid cron for now */ }
  }
  next();
});

module.exports = mongoose.models.Workflow || mongoose.model('Workflow', WorkflowSchema);
