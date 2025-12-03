const express = require('express');
const router = express.Router();
const Workflow = require('../models/workflow');
const scheduler = require('../services/scheduler');
const auth = require('../utils/authMiddleware');

// Enable/disable schedule
router.post('/:id/toggle', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      ownerId: req.user.id
    });

    if (!workflow) return res.status(404).json({ msg: 'Workflow not found' });

    workflow.schedule.enabled = !workflow.schedule.enabled;
    await workflow.save();

    if (workflow.schedule.enabled) {
      scheduler.reloadWorkflow(workflow._id);
    } else {
      scheduler.unscheduleWorkflow(workflow._id);
    }

    res.json({ schedule: workflow.schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update schedule (cron + timezone)
router.put('/:id', auth, async (req, res) => {
  const { cron, timezone } = req.body;

  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      ownerId: req.user.id
    });

    if (!workflow) return res.status(404).json({ msg: 'Workflow not found' });

    workflow.schedule.cron = cron;
    workflow.schedule.timezone = timezone || 'UTC';
    workflow.schedule.enabled = true;

    await workflow.save();
    scheduler.reloadWorkflow(workflow._id);

    res.json({ schedule: workflow.schedule });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get schedule status
router.get('/:id', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      ownerId: req.user.id
    }).select('schedule');

    if (!workflow) return res.status(404).json({ msg: 'Not found' });
    res.json({ schedule: workflow.schedule });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;