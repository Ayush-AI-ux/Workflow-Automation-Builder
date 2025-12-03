// src/controllers/workflowController.js
const Workflow = require('../models/workflow');

exports.createWorkflow = async (req, res, next) => {
  try {
    const { name, definition } = req.body;
    if (!name || !definition) return res.status(400).json({ error: 'name and definition required' });

    const wf = new Workflow({ name, definition, ownerId: req.user._id });
    await wf.save();
    res.json(wf);
  } catch (err) { next(err); }
};

exports.updateWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, definition } = req.body;
    const wf = await Workflow.findOne({ _id: id, ownerId: req.user._id });
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });

    if (name) wf.name = name;
    if (definition) wf.definition = definition;
    await wf.save();
    res.json(wf);
  } catch (err) { next(err); }
};

exports.deleteWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Workflow.deleteOne({ _id: id, ownerId: req.user._id });
    res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.getWorkflows = async (req, res, next) => {
  try {
    const wfs = await Workflow.find({ ownerId: req.user._id }).sort({ updatedAt: -1 });
    res.json(wfs);
  } catch (err) { next(err); }
};

exports.getWorkflowById = async (req, res, next) => {
  try {
    const wf = await Workflow.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    res.json(wf);
  } catch (err) { next(err); }
};