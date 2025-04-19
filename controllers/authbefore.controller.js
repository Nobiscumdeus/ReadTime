const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

  // Auth Routes
  exports.register= async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
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
  
    //Check for dev admin 
    // Create new user with admin check
    const isAdmin = process.env.NODE_ENV === 'development' && email === process.env.DEV_ADMIN_EMAIL;

      // Hash password (auto-handled by schema pre-save hook)
      const user = new User({ name, email, password,isAdmin });
      await user.save();
  
      // Generate JWT (secure config)
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'fallback_secret_change_in_production',
        { expiresIn: '1d' }
      );
  
      // Response (no sensitive data)
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin:user.isAdmin,
        }
      });
  
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle duplicate email race condition
      if (error.code === 11000) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      
      res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
  }

exports.login=async (req, res) => {
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
                              .select('+password +isActive') // Include normally excluded fields
                              .lean();
    
        // Security: Generic error message to prevent user enumeration
        if (!user) {
          return res.status(401).json({ 
            success: false,
            message: 'Invalid credentials' 
          });
        }
    
        // Account status check (example extension)
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
            //message: 'Invalid credentials' 
            message:'Either the email or password is incorrect'
          });
        }
    
        // Generate JWT (secure configuration)
        const token = jwt.sign(
          { 
            id: user._id,
            role: user.isAdmin ? 'admin' : 'user' // Optional role inclusion
          },
          process.env.JWT_SECRET || 'fallback_secret_change_in_prod',
          { 
            expiresIn: '1d',
            algorithm: 'HS256' // Explicit algorithm selection
          }
        );

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
         // message: 'Authentication service unavailable' 
         message:'Oops something went wrong, try again later'
        });
      }
    }
  
