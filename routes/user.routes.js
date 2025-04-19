const express = require('express');
const router = express.Router();
const userController=require('../controllers/user.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/authenticate');


// GET /api/user (protected route)
router.get('/api/user', authMiddleware, userController.getCurrentUser);

//GET ALL USERS
router.get('/api/admin/users',authMiddleware,adminMiddleware,userController.getUsers);

//Get user details
router.get('api/admin/users/:userId',authMiddleware,adminMiddleware, userController.getUserDetails);

// Update user's active status
router.patch('/api/admin/users/:userId/status',authMiddleware,adminMiddleware, userController.updateUserStatus);

// Update user's admin status
router.patch('/api/admin/users/:userId/admin',authMiddleware, adminMiddleware,userController.updateAdminStatus);

// Delete user
router.delete('/api/admin/users/:userId', authMiddleware,adminMiddleware,userController.deleteUser);



module.exports = router;