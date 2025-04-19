// routes/ai.routes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// POST /api/ai/analyze
router.post('/analyze', aiController.analyzeReadings);

// POST /api/ai/predict-goal
router.post('/predict-goal', aiController.predictGoal);

module.exports = router;