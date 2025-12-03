const express = require('express');
const router = express.Router();
const Workflow = require('../models/workflow');
const Log = require('../models/Log');
const authMiddleware = require('../utils/authMiddleware');

// Import the correct function from your executor service
const { executeWorkflow, getRunDetails } = require('../services/executor');

/**
 * POST /api/execute/run
 * Start a workflow execution
 */
router.post('/run', authMiddleware, async (req, res) => {
  try {
    const { workflowId } = req.body;

    if (!workflowId) {
      return res.status(400).json({ error: 'Workflow ID is required' });
    }

    console.log('📋 Executing workflow:', workflowId);
    console.log('👤 User:', req.user.email || req.user._id);

    // Fetch the workflow from database
    const workflow = await Workflow.findById(workflowId);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    console.log('✅ Workflow found:', workflow.name);
    console.log('📊 Workflow definition:', {
      nodes: workflow.definition?.nodes?.length || 0,
      edges: workflow.definition?.edges?.length || 0
    });

    // Execute the workflow - pass workflowId and user
    const runId = await executeWorkflow(workflowId, req.user);

    console.log('🎉 Workflow execution completed. Run ID:', runId);

    // Return the run ID immediately
    res.json({
      success: true,
      runId: runId,
      message: 'Workflow execution completed',
      workflowId: workflow._id,
      workflowName: workflow.name
    });

  } catch (error) {
    console.error('❌ Error in execute endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to execute workflow',
      message: error.message 
    });
  }
});

/**
 * GET /api/execute/status/:runId
 * Get execution status and details
 */
router.get('/status/:runId', authMiddleware, async (req, res) => {
  try {
    const { runId } = req.params;

    console.log('🔍 Fetching run details for:', runId);

    const log = await Log.findOne({ runId }).populate('workflowId');

    if (!log) {
      return res.status(404).json({ error: 'Execution log not found' });
    }

    res.json({
      runId: log.runId,
      workflowId: log.workflowId._id,
      workflowName: log.workflowId.name,
      status: log.status,
      timestamp: log.timestamp,
      details: log.details
    });

  } catch (error) {
    console.error('Error fetching execution status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/execute/logs/:workflowId
 * Get all execution logs for a specific workflow
 */
router.get('/logs/:workflowId', authMiddleware, async (req, res) => {
  try {
    const { workflowId } = req.params;

    const logs = await Log.find({ workflowId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(logs);

  } catch (error) {
    console.error('Error fetching execution logs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/execute/logs
 * Get all execution logs (most recent)
 */
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('workflowId', 'name')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);

  } catch (error) {
    console.error('Error fetching execution logs:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;