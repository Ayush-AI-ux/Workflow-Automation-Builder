const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const authMiddleware = require('../utils/authMiddleware'); // FIXED PATH
const Workflow = require('../models/workflow');

/**
 * POST /api/ai/suggest-next
 * Get AI suggestion for next node to add
 */
router.post('/suggest-next', authMiddleware, async (req, res) => {
  try {
    const { nodes, edges } = req.body;

    console.log('🤖 AI Suggest request:', { nodes: nodes?.length, edges: edges?.length });

    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ error: 'Invalid workflow data' });
    }

    const suggestion = await aiService.suggestNextNode({ nodes, edges });

    console.log('✅ Suggestion generated:', suggestion.suggestion);

    res.json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error('❌ AI Suggest Error:', error);
    res.status(500).json({ error: 'Failed to generate suggestion' });
  }
});

/**
 * POST /api/ai/generate-workflow
 * Generate complete workflow from description
 */
router.post('/generate-workflow', authMiddleware, async (req, res) => {
  try {
    const { description } = req.body;

    console.log('🤖 AI Generate request:', description);

    if (!description || description.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Please provide a detailed workflow description (min 10 characters)' 
      });
    }

    const workflow = await aiService.generateWorkflow(
      description, 
      req.user.name || req.user.email
    );

    console.log('✅ Workflow generated:', workflow.name);

    res.json({
      success: true,
      workflow,
    });
  } catch (error) {
    console.error('❌ AI Generate Error:', error);
    res.status(500).json({ error: 'Failed to generate workflow' });
  }
});

/**
 * POST /api/ai/analyze-workflow
 * Analyze workflow for issues and improvements
 */
router.post('/analyze-workflow', authMiddleware, async (req, res) => {
  try {
    const { nodes, edges } = req.body;

    console.log('🤖 AI Analyze request:', { nodes: nodes?.length, edges: edges?.length });

    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ error: 'Invalid workflow data' });
    }

    const analysis = await aiService.analyzeWorkflow({ nodes, edges });

    console.log('✅ Analysis complete. Score:', analysis.score);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('❌ AI Analyze Error:', error);
    res.status(500).json({ error: 'Failed to analyze workflow' });
  }
});

/**
 * GET /api/ai/recommendations
 * Get personalized workflow recommendations
 */
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    // Get user's existing workflows
    const workflows = await Workflow.find({ userId: req.user.id })
      .select('name nodes')
      .limit(10)
      .lean();

    const recommendations = await aiService.getRecommendations(workflows);

    res.json({
      success: true,
      recommendations: recommendations.recommendations || [],
    });
  } catch (error) {
    console.error('❌ AI Recommendations Error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;