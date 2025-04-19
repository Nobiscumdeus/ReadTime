const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const{ authMiddleware }= require('../middleware/authenticate');

// POST /api/auth/register
router.post('/register', authController.register);


// POST /api/auth/login
router.post('/login', authController.login);

// Email verification
router.get('/verify/:token', authController.verifyEmail);

// Resend verification email
router.post('/resend-verification', authController.resendVerification);

module.exports=router;