// src/routes/executionHistory.js
const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const Workflow = require('../models/workflow');
const authMiddleware = require('../utils/authMiddleware');

/**
 * GET /api/execution-history
 * Get all execution logs for user's workflows
 */
router.get('/api/execution-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get filter parameters
    const status = req.query.status; // 'success', 'failed', 'running'
    const workflowId = req.query.workflowId;
    
    console.log('📊 Fetching execution history for user:', userId);
    console.log('   Page:', page, 'Limit:', limit);
    console.log('   Filters - Status:', status, 'WorkflowId:', workflowId);
    
    // Get all user's workflows
    const userWorkflows = await Workflow.find({ ownerId: userId }).select('_id name');
    const workflowIds = userWorkflows.map(w => w._id);
    
    if (workflowIds.length === 0) {
      return res.json({
        success: true,
        executions: [],
        total: 0,
        page,
        pages: 0
      });
    }
    
    // Build query
    const query = { workflowId: { $in: workflowIds } };
    
    if (status) {
      query.status = status;
    }
    
    if (workflowId) {
      query.workflowId = workflowId;
    }
    
    // Get total count for pagination
    const total = await Log.countDocuments(query);
    
    // Get executions with pagination
    const executions = await Log.find(query)
      .populate('workflowId', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    console.log('   Found', total, 'total executions');
    console.log('   Returning', executions.length, 'executions for this page');
    
    res.json({
      success: true,
      executions,
      total,
      page,
      pages: Math.ceil(total / limit),
      workflows: userWorkflows // Send workflow list for filters
    });
    
  } catch (error) {
    console.error('❌ Error fetching execution history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution history',
      message: error.message
    });
  }
});

/**
 * GET /api/execution-history/:runId
 * Get detailed information about a specific execution
 */
router.get('/api/execution-history/:runId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { runId } = req.params;
    
    console.log('🔍 Fetching execution details for runId:', runId);
    
    // Get execution log
    const execution = await Log.findOne({ runId })
      .populate('workflowId', 'name description definition')
      .lean();
    
    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }
    
    // Verify user owns this workflow
    const workflow = await Workflow.findOne({
      _id: execution.workflowId._id,
      ownerId: userId
    });
    
    if (!workflow) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    console.log('   ✅ Execution found, status:', execution.status);
    
    res.json({
      success: true,
      execution
    });
    
  } catch (error) {
    console.error('❌ Error fetching execution details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution details',
      message: error.message
    });
  }
});

/**
 * DELETE /api/execution-history/:runId
 * Delete a specific execution log
 */
router.delete('/api/execution-history/:runId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { runId } = req.params;
    
    console.log('🗑️ Deleting execution log:', runId);
    
    // Get execution to verify ownership
    const execution = await Log.findOne({ runId }).populate('workflowId');
    
    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }
    
    // Verify user owns the workflow
    const workflow = await Workflow.findOne({
      _id: execution.workflowId._id,
      ownerId: userId
    });
    
    if (!workflow) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // Delete the log
    await Log.deleteOne({ runId });
    
    console.log('   ✅ Execution log deleted');
    
    res.json({
      success: true,
      message: 'Execution log deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting execution log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete execution log',
      message: error.message
    });
  }
});

/**
 * POST /api/execution-history/cleanup
 * Delete old execution logs (older than specified days)
 */
router.post('/api/execution-history/cleanup', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { days = 30 } = req.body;
    
    console.log('🧹 Cleaning up logs older than', days, 'days');
    
    // Get user's workflows
    const userWorkflows = await Workflow.find({ ownerId: userId }).select('_id');
    const workflowIds = userWorkflows.map(w => w._id);
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Delete old logs
    const result = await Log.deleteMany({
      workflowId: { $in: workflowIds },
      createdAt: { $lt: cutoffDate }
    });
    
    console.log('   ✅ Deleted', result.deletedCount, 'old logs');
    
    res.json({
      success: true,
      deleted: result.deletedCount,
      message: `Deleted ${result.deletedCount} logs older than ${days} days`
    });
    
  } catch (error) {
    console.error('❌ Error cleaning up logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup logs',
      message: error.message
    });
  }
});

module.exports = router;