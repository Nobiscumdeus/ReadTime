
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Token Extraction (multiple sources)
  const token = 
    req.header('Authorization')?.replace('Bearer ', '') || 
    req.header('x-auth-token') || 
    req.cookies?.token;

  // 2. Token Validation
  if (!token) {
    return res.status(401).json({ 
      success: false,
      code: 'MISSING_TOKEN',
      message: 'Authentication token required' 
    });
  }

  try {
    // 3. Token Verification (with explicit algorithm)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Prevent algorithm confusion attacks
      clockTolerance: 15, // 15-second grace period for clock skew
    });

    // 4. Attach User Data
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user' // Default role if not specified
    };

    // 5. Refresh Token Logic (optional)
    if (decoded.exp - Date.now() / 1000 < 3600) { // If expires in <1 hour
      const newToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.setHeader('X-New-Token', newToken);
    }

    next();
  } catch (error) {
    // 6. Detailed Error Handling
    let message = 'Invalid token';
    let code = 'INVALID_TOKEN';

    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
      code = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Malformed token';
      code = 'MALFORMED_TOKEN';
    }

    return res.status(401).json({ 
      success: false,
      code,
      message
    });
  }
};

// Middleware to handle AI service error
const handleAIServiceError = (err, res) => {
  console.error('AI Service Error: ', err);
  if (err.response) {
    console.error('Error details: ', err.response.data);
    return res.status(err.response.status).json({
      error: 'AI Service Error',
      details: err.response.data
    });
  }
  return res.status(500).json({
    error: 'AI Service unavailable',
    details: 'Could not connect to AI Service'
  });
};

const adminMiddleware = (req, res, next) => {
  console.log('User in adminMiddleware:', req.user); // Debug log
  
  // Check for 'admin' role instead of isAdmin boolean
  if (req.user?.role !== 'admin') {
    console.log('Blocked non-admin user:', req.user?.email);
    return res.status(403).json({ 
      success: false,
      code: 'FORBIDDEN',
      message: 'Admin privileges required' 
    });
  }
  
  next(); // Allow access if role === 'admin'
};

// Where isAdmin middleware might look like:
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

const dbConnectionCheck = (req, res, next) => {
  if (!isDbConnected && req.path !== '/api/health' && !req.path.startsWith('/api/static')) {
    return res.status(503).json({
      success: false,
      message: 'Database service temporarily unavailable. Please try again later.',
      retryable: true
    });
  }
  next();
};

// middleware/adminAuth.js
const adminAuth = (req, res, next) => {
  // req.user is set by the previous auth middleware
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

//module.exports = adminAuth;





module.exports = {
  authMiddleware,
  adminMiddleware,
  handleAIServiceError,
  dbConnectionCheck,
  isAdmin,
  adminAuth,
};