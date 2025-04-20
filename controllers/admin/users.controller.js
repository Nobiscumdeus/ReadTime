// controllers/admin.controller.js
const User = require('../../models/User.model');
const Reading=require('../../models/Reading.model');
const mongoose=require('mongoose')


exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find()
        .select('-password -__v')
        .populate({
          path: 'readings',
          select: 'hours date',
          options: { lean: true }
        })
        .lean();
        
      const usersWithStats = users.map(user => ({
        ...user,
        totalHours: user.readings.reduce((sum, reading) => sum + (reading?.hours || 0), 0),
        joinDate: new Date(user.createdAt).toLocaleDateString(),
        lastActive: user.lastActive
          ? new Date(user.lastActive).toLocaleString()
          : 'Never',
        daysSinceLastActive: user.lastActive
          ? Math.floor((Date.now() - new Date(user.lastActive)) / (1000 * 60 * 60 * 24))
          : 'N/A'
      }));
        
      res.json({
        success: true,
        data: usersWithStats
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  };






  exports.getUserDetails = async (req, res) => {
    try {
      const { id } = req.params;
  
      // ✅ Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format"
        });
      }
  
      // ✅ Fetch user without password & __v
      const user = await User.findById(id)
        .select('-password -__v')
        .lean();
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      // ✅ ✅ FETCH readings directly using Reading model instead of .populate()
      const readings = await Reading.find({ user: id })
        .select('hours date title notes createdAt updatedAt')
        .sort({ date: -1 }) // sort by most recent
        .lean();
  
      // ✅ Calculate total and average hours
      const totalHours = readings.reduce((sum, r) => sum + (r.hours || 0), 0);
      const avgHours = readings.length > 0
        ? (totalHours / readings.length).toFixed(1)
        : "0.0";
  
      // ✅ Format readings
      const processedReadings = readings.map(reading => ({
        ...reading,
        formattedDate: reading.date ? new Date(reading.date).toLocaleDateString() : 'N/A',
      }));
  
      // ✅ Build the response object
      const responseData = {
        ...user,
        isVerified: user.isVerified || false, // ← New line (defaults to false if missing)
        totalHours,
        averageHours: avgHours,
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString() : null,
        formattedJoinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
        lastActive: user.lastActive ? new Date(user.lastActive).toISOString() : null,
        formattedLastActive: user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never',
        readings: processedReadings
      };
  
      // ✅ Return final data
      res.json({
        success: true,
        data: responseData
      });
  
    } catch (error) {
      console.error("User details error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };








exports.getUserReadingsForCharts = async (req, res) => {
  const { id } = req.params;
  const { month, year } = req.query;

  // Validate User ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  // Validate Month and Year
  if (month) {
    if (month < 1 || month > 12 || isNaN(month)) {
      return res.status(400).json({ success: false, message: 'Invalid month provided. Please use a value between 1 and 12.' });
    }
  }

  if (year) {
    if (isNaN(year) || year.length !== 4) {
      return res.status(400).json({ success: false, message: 'Invalid year provided. Please use a valid 4-digit year.' });
    }
  }

  try {
    const filter = { user: id };

    // Apply date range if month and year are provided
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const readings = await Reading.find(filter)
      .select('hours date')
      .sort({ date: 1 }) // Sort in ascending order for trend analysis
      .lean();

    // Return filtered readings
    res.json({ success: true, data: readings });
  } catch (err) {
    console.error('Error fetching user readings:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}





