const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Route to handle Google Form submissions
router.post('/google-form', webhookController.handleGoogleForm);

module.exports = router;

