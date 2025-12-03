
const Workflow = require('../models/workflow');
const Log = require('../models/log');
const executorService = require('../services/executor');

/**
 * POST /api/workflows/execute
 * Start a workflow execution
 */
exports.runWorkflow = async (req, res, next) => {
  try {
    const { workflowId } = req.body;
    if (!workflowId) return res.status(400).json({ error: 'workflowId required' });

    // Fetch workflow for logged-in user
    const workflow = await Workflow.findOne({ _id: workflowId, ownerId: req.user._id });
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

    // Execute workflow
    const result = await executorService.runWorkflow(workflow);

    // Save execution log
    const log = new Log({
      workflowId: workflow._id,
      status: result.status,
      details: result.details,
      executedAt: new Date(),
    });
    await log.save();

    res.json({
      success: true,
      message: 'Workflow executed successfully',
      logId: log._id,
      log,
    });
  } catch (err) {
    console.error('Error executing workflow:', err);
    next(err);
  }
};

/**
 * GET /api/workflows/execute/:logId
 * Get details of a specific workflow execution log
 */
exports.getRunLog = async (req, res, next) => {
  try {
    const { logId } = req.params;
    const log = await Log.findOne({ _id: logId });

    if (!log) return res.status(404).json({ error: 'Log not found' });

    res.json(log);
  } catch (err) {
    console.error('Error fetching run log:', err);
    next(err);
  }
};