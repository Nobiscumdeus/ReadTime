// controllers/admin.controller.js
const User = require('../models/User.model');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -__v')
      .lean();
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('[Admin Users Error]', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to fetch users'
    });
  }
};

