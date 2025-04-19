const User = require('../models/User.model');
const mongoose=require('mongoose');
const Reading =require('../models/Reading.model');

//import { UsersQueryParams, UserListItem } from '../types/user.types';



exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('[Get User Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



/**
 * Get paginated list of users with their reading statistics
 */





exports.getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'all',
      sortBy = 'newest' 
    } = req.query 

    // Build filter conditions
    const filter = {};
    
    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'reading_hours':
        // This will be handled in the aggregation
        break;
      case 'last_active':
        sort = { lastActive: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
    }

    // Count total users matching filter
    const total = await User.countDocuments(filter);
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    const totalPages = Math.ceil(total / Number(limit));
    
    // Get users with reading stats
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'readings',
          localField: '_id',
          foreignField: 'userId',
          as: 'allReadings'
        }
      },
      {
        $addFields: {
          totalReadingHours: {
            $cond: {
              if: { $isArray: "$allReadings" },
              then: { $sum: "$allReadings.hours" },
              else: 0
            }
          }
        }
      }
    ];
    
    // Add sort stage based on sortBy parameter
    if (sortBy === 'reading_hours') {
      pipeline.push({ $sort: { totalReadingHours: -1 } });
    } else {
      pipeline.push({ $sort: sort });
    }
    
    // Add pagination stages
    pipeline.push(
      { $skip: skip },
      { $limit: Number(limit) }
    );
    
    // Add projection stage
    pipeline.push({
      $project: {
        _id: 1,  
        name: 1,
        email: 1,
        createdAt: 1,
        lastActive: 1,
        isActive: 1,
        isAdmin: 1,
        totalReadingHours: 1
      }
    });
    
    const users = await User.aggregate(pipeline);

    // Format the data for the frontend
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      username: user.name,
      email: user.email,
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
      totalHours: Math.round(user.totalReadingHours || 0),
      lastActive: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never',
      isActive: Boolean(user.isActive),
      isAdmin: Boolean(user.isAdmin)
    }));

    res.json({
      users: formattedUsers,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching users' 
    });
  }
};
/**
 * Update user status (active/inactive)
 */
exports.updateUserStatus = async (req,res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'isActive must be a boolean value' 
      });
    }

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive, lastActive: isActive ? new Date() : undefined },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating user status' 
    });
  }
};

/**
 * Delete a user
 */
exports.deleteUser = async (req,res) => {
  try {
    const { userId } = req.params;

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    // Don't let admins delete themselves
    if (req.user && req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Optional: Delete all user readings
    await Reading.deleteMany({ userId });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting user' 
    });
  }
};

/**
 * Update admin status
 */
exports.updateAdminStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'isAdmin must be a boolean value' 
      });
    }

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    // Don't let admins revoke their own admin rights
    if (req.user && req.user.id === userId && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot revoke your own admin status'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: `Admin status ${isAdmin ? 'granted' : 'revoked'} successfully`
    });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating admin status' 
    });
  }
};

/**
 * Get user details
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get reading statistics
    const readingStats = await Reading.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { 
        $group: { 
          _id: null,
          totalHours: { $sum: '$hours' },
          avgHoursPerSession: { $avg: '$hours' },
          count: { $sum: 1 },
          firstReading: { $min: '$date' },
          lastReading: { $max: '$date' }
        } 
      }
    ]);

    const stats = readingStats.length > 0 ? readingStats[0] : {
      totalHours: 0,
      avgHoursPerSession: 0,
      count: 0,
      firstReading: null,
      lastReading: null
    };

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        joinDate: user.createdAt,
        lastActive: user.lastActive,
        isActive: user.isActive,
        isAdmin: user.isAdmin
      },
      readingStats: {
        totalHours: Math.round(stats.totalHours || 0),
        avgHoursPerSession: Number((stats.avgHoursPerSession || 0).toFixed(1)),
        readingsCount: stats.count,
        firstReading: stats.firstReading,
        lastReading: stats.lastReading
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching user details' 
    });
  }
};