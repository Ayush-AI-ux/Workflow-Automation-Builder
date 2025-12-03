// src/routes/workflows.js
const express = require('express');
const router = express.Router();
const auth = require('../utils/authMiddleware');
const controller = require('../controllers/workflowController');

router.use(auth); // protect all routes

router.post('/', controller.createWorkflow);
router.get('/', controller.getWorkflows);
router.get('/:id', controller.getWorkflowById);
router.put('/:id', controller.updateWorkflow);
router.delete('/:id', controller.deleteWorkflow);

module.exports = router;