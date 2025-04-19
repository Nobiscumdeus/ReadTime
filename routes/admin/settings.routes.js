// routes/system.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../../middleware/authenticate');

const settingController=require('../../controllers/admin/settings.controller');



// Data export routes
router.get('/api/admin/export/csv', authMiddleware,adminMiddleware, settingController.ReadingsCSV);
router.get('/api/admin/export/json', authMiddleware,adminMiddleware, settingController.ReadingsJSON);

// Backup and maintenance routes
router.post('/api/admin/backup',  authMiddleware,adminMiddleware,settingController.runDatabaseBackup);
router.post('/api/admin/cache/clear',  authMiddleware,adminMiddleware, settingController.clearCache);
router.post('/api/admin/database/optimize',  authMiddleware,adminMiddleware,settingController.optimizeDatabase);

// Settings routes
router.put('/api/admin/settings',  authMiddleware,adminMiddleware,settingController.updateSettings);
router.post('/api/admin/api-key/regenerate', authMiddleware,adminMiddleware, settingController.regenerateApiKey);



module.exports=router;