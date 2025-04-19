const express = require('express');
const router = express.Router();
const {testEndpoint }= require('../controllers/test.controller');

// GET /api/test
router.get('/api/test', testEndpoint);

module.exports = router;