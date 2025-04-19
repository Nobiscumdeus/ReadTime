// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authenticate');
const adminController = require('../controllers/admin.controller');

// GET /api/admin/users
router.get('/api/admin/users', 
  authMiddleware, 
  adminMiddleware, 
  adminController.getAllUsers
);


module.exports = router;