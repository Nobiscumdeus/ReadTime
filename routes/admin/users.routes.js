// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../../middleware/authenticate');
const adminController = require('../../controllers/admin/users.controller');

// GET /api/admin/users
router.get('/api/admin/users', 
  authMiddleware, 
  adminMiddleware, 
  adminController.getAllUsers
);
router.get('/api/admin/users/:id',authMiddleware,adminMiddleware,adminController.getUserDetails);

router.get('/api/admin/users/:id/charts',authMiddleware,adminMiddleware,adminController.getUserReadingsForCharts)

module.exports = router;