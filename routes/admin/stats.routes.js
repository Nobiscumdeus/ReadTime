const express = require('express');
const router = express.Router();
//const adminStatsController = require('../controllers/adminStats.controller');
const adminStatsController=require('../../controllers/admin/stats.controller');
const { authMiddleware, adminMiddleware,isAdmin } = require('../../middleware/authenticate');

// Simplified route since controller now handles response
router.get('/api/admin/stats',  authMiddleware, adminMiddleware, adminStatsController.getAdminStats);

module.exports = router;