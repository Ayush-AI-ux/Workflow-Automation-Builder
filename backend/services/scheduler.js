const cron = require('node-cron');
const Workflow = require('../models/workflow');
const { executeWorkflow } = require('./executor');
const Log = require('../models/Log'); // if you have execution logs

class SchedulerService {
  constructor() {
    this.jobs = new Map(); // workflowId → cron job
  }

  async initialize() {
    console.log('⏰ Initializing scheduler...');
    const workflows = await Workflow.find({ 'schedule.enabled': true });
    console.log(`📅 Found ${workflows.length} scheduled workflows`);

    workflows.forEach(workflow => this.scheduleWorkflow(workflow));
    console.log('✅ Scheduler initialized successfully');
  }

  scheduleWorkflow(workflow) {
    if (this.jobs.has(workflow._id.toString())) return;

    const job = cron.schedule(
      workflow.schedule.cron,
      async () => {
        console.log(`⏰ Running scheduled workflow: ${workflow.name} (${workflow._id})`);
        try {
          const result = await executeWorkflow(workflow._id, null); // null = no req.user (scheduled)
          await Workflow.updateOne(
            { _id: workflow._id },
            { 'schedule.lastRunAt': new Date() }
          );

          // Optional: log execution
          if (Log) {
            await Log.create({
              workflowId: workflow._id,
              ownerId: workflow.ownerId,
              trigger: 'schedule',
              status: result.success ? 'success' : 'error',
              runId: result.runId || null,
              executedAt: new Date()
            });
          }
        } catch (err) {
          console.error(`Scheduled workflow ${workflow.name} failed:`, err);
        }
      },
      {
        scheduled: true,
        timezone: workflow.schedule.timezone || 'UTC'
      }
    );

    this.jobs.set(workflow._id.toString(), job);
    job.start();
  }

  unscheduleWorkflow(workflowId) {
    const job = this.jobs.get(workflowId.toString());
    if (job) {
      job.stop();
      this.jobs.delete(workflowId.toString());
    }
  }

  async reloadWorkflow(workflowId) {
    this.unscheduleWorkflow(workflowId);
    const workflow = await Workflow.findById(workflowId);
    if (workflow?.schedule?.enabled) {
      this.scheduleWorkflow(workflow);
    }
  }

  shutdown() {
    console.log('🛑 Stopping all scheduled jobs...');
    this.jobs.forEach(job => job.stop());
    this.jobs.clear();
  }
}

module.exports = new SchedulerService();