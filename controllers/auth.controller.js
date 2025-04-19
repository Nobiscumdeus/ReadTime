const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto=require('crypto');
const {sendVerificationEmail}=require('../utility/emailService');
require('dotenv').config();

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.isAdmin ? 'admin' : 'user'
    },
    process.env.JWT_SECRET || 'fallback_secret_change_in_prod',
    { 
      expiresIn: '1d',
      algorithm: 'HS256'
    }
  );
};


//Registration Controller 
exports.register=async(req,res)=>{
  try{
    const {name,email,password}=req.body;

     // Validation (Lean but effective)
     if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    
    // Email format check (simple regex)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

     // Check existing user (optimized query)
     const existingUser = await User.findOne({ email }).select('_id').lean();
     if (existingUser) {
       return res.status(409).json({ message: 'Email already in use' }); // 409 Conflict
     }

       // Check for dev admin 
    //const isAdmin = process.env.NODE_ENV === 'development' && email === process.env.DEV_ADMIN_EMAIL;

    const isAdmin = process.env.NODE_ENV === 'development' && 
                email === process.env.DEV_ADMIN_EMAIL;

     // Generate verification token and expiration
     const verificationToken = generateVerificationToken();
     const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create new user with verification fields
      /*
    const user = new User({ 
      name, 
      email, 
      password, 
      isAdmin, 
      isVerified: false, // Default to unverified
      verificationToken,
      verificationTokenExpires
    });
*/
// Then modify the user creation to auto-verify admin:
const user = new User({ 
  name, 
  email, 
  password, 
  isAdmin,
  isVerified: isAdmin ? true : false, // Auto-verify admin
  verificationToken: isAdmin ? null : generateVerificationToken(),
  verificationTokenExpires: isAdmin ? null : new Date(Date.now() + 24 * 60 * 60 * 1000)
});

    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);

    if(!emailSent){
       // Still create the user but inform that email couldn't be sent
       return res.status(201).json({
        success: true,
        message: 'Account created but verification email could not be sent. Please contact support.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: false
        }
      });
    }

     // Response (no sensitive data and no token yet)
     res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: false
      }
    });

  }catch(error){
    console.error('Registration error:',error);

    //handle duplicate  email race condition
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
}

// Login controller 

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trim and validate input
    if (!email?.trim() || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user with password field (explicitly selected)
    const user = await User.findOne({ email: email.trim().toLowerCase() })
                          .select('+password +isActive +isVerified') // Include verification status
                          .lean();

    // Security: Generic error message to prevent user enumeration
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

  
    // Check if email is verified
    /*
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email // Send back email to help with resending verification
      });
    }
      */

    if (!user.isVerified && !(process.env.NODE_ENV === 'development' && user.isAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email
      });
    }

    // Account status check
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated. Contact support.'
      });
    }

    // Password comparison (timing-safe)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Either the email or password is incorrect'
      });
    }

    // Generate JWT
    const token = generateToken(user);

    // Update the lastActive timestamp
    await User.findByIdAndUpdate(user._id, { lastActive: Date.now() });

    // Response (exclude sensitive fields)
    const { password: _, ...userData } = user;
    res.json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Oops something went wrong, try again later'
    });
  }
};


//Controller for email verification
/*
exports.verifyEmail=async (req,res)=>{
  try{
    const {token}=req.params;

    //Find user by verification token 
    const user=await User.findOne({
      verificationToken:token,
      verificationTokenExpires:{$gt:Date.now()}
    });

    if(!user){
      return res.status(400).json({
        success:false,
        message:'Invalid or expired verification token'
      })
    }

    //Update user verification status 
    user.isVerified=true;
    user.verificationToken=undefined;
    user.verificationTokenExpires=undefined;
    await user.save();

    //Generate token now that they are verified
    const jwtToken=generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true,
        isAdmin: user.isAdmin
      }
    });
  }catch(error){
    console.error('Email verification error:',error);
    res.status(500).json({
      success:false,
      message:'Server error during email verification '
    })

  }
}

// Resend verification controller
// New method: Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // For security reasons, still return success even if email doesn't exist
      return res.status(200).json({
        success: true,
        message: 'If your email exists in our system, a verification email has been sent'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. Please login.'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending verification email'
    });
  }
};
*/


exports.verifyEmail = async (req, res) => {
  console.log('\n[VERIFY] Starting email verification process');
  try {
    const { token } = req.params;
    console.log('[VERIFY] Received token:', token);

    if (!token) {
      console.log('[VERIFY] No token provided');
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    console.log('[VERIFY] Searching for user with token');
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('[VERIFY] Invalid or expired token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    console.log(`[VERIFY] Found user ${user.email} for verification`);
    console.log('[VERIFY] Current verification status:', user.isVerified);

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    
    console.log('[VERIFY] Saving verified user');
    await user.save();

    // Generate token now that they are verified
    const jwtToken = generateToken(user);
    console.log('[VERIFY] Generated JWT token for user');

    console.log('[VERIFY] Verification completed successfully');
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('[VERIFY ERROR]', error);
    console.error('[VERIFY ERROR] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during email verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/*
exports.resendVerification = async (req, res) => {
  console.log('\n[RESEND] Starting resend verification process');
  try {
    const { email } = req.body;
    console.log('[RESEND] Requested email:', email);

    if (!email?.trim()) {
      console.log('[RESEND] No email provided');
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    console.log('[RESEND] Searching for user:', cleanEmail);
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      console.log('[RESEND] No user found (security response)');
      return res.status(200).json({
        success: true,
        message: 'If your email exists in our system, a verification email has been sent'
      });
    }

    console.log('[RESEND] Found user:', user._id);
    console.log('[RESEND] Current verification status:', user.isVerified);

    if (user.isVerified) {
      console.log('[RESEND] User already verified');
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. Please login.'
      });
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    console.log('[RESEND] Generated new token:', verificationToken);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();
    console.log('[RESEND] Updated user with new token');

    console.log('[RESEND] Sending verification email');
    const emailSent = await sendVerificationEmail(cleanEmail, verificationToken);

    if (!emailSent) {
      console.log('[RESEND] Failed to send email');
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    console.log('[RESEND] Verification email sent successfully');
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });

  } catch (error) {
    console.error('[RESEND ERROR]', error);
    console.error('[RESEND ERROR] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while resending verification email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
*/
exports.resendVerification = async (req, res) => {
  console.log('\n[RESEND] Starting resend verification process');
  try {
    const { email } = req.body;
    
    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Security: Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If your email exists in our system, a verification email has been sent'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. Please login.'
      });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send email
    const emailSent = await sendVerificationEmail(cleanEmail, verificationToken);
    
    if (!emailSent) {
      throw new Error('Failed to send verification email');
    }

    return res.status(200).json({
      success: true,
      message:  'Verification email resent successfully! Please check your inbox, and if you don\'t see it within a few minutes, check your spam/junk folder as well.',
    });

  } catch (error) {
    console.error('[RESEND ERROR]', error);
    
    // Specific error for email service failures
    if (error.message.includes('Failed to send verification email')) {
      return res.status(500).json({
        success: false,
        message: 'Email service temporarily unavailable. Please try again later.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during verification resend'
    });
  }
};
