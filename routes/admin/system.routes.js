// routes/system.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../../middleware/authenticate');
//const adminController = require('../../controllers/admin.controller');
const adminSystemController=require('../../controllers/admin/system.controller');


router.get('/api/admin/system/stats',authMiddleware,adminMiddleware,adminSystemController.systemStats)

router.get('/api/admin/system/metrics',authMiddleware,adminMiddleware,adminSystemController.systemMetrics)

router.get('/api/admin/system/logs',authMiddleware,adminMiddleware,adminSystemController.systemLogs)

router.get('/api/admin/system/database',authMiddleware,adminMiddleware,adminSystemController.systemDatabase)



module.exports=router;