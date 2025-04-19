const User = require('../models/User.model');

exports.testEndpoint = async (req, res) => {
  try {
    const testUser = await User.findOne();
    res.json({ 
      success: true, 
      user: testUser || 'No users yet' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

