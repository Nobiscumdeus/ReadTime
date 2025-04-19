// api/admin/stats.js (Express route handler)
//const express = require('express');
//const router = express.Router();
//const User = require('../models/User');
//const Reading = require('../models/Reading');
//const auth = require('../middleware/auth');
//const adminAuth = require('../middleware/adminAuth');

/*
// Admin stats endpoint
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    // Calculate date ranges
    const now = new Date();
    let startDate;
    
    switch(range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Previous period for comparison
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    
    // Get total user count
    const userCount = await User.countDocuments();
    
    // Get new users in current period
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    
    // Get new users in previous period
    const previousPeriodUsers = await User.countDocuments({ 
      createdAt: { $gte: previousStartDate, $lt: startDate } 
    });
    
    // Calculate user growth percentage
    const userGrowthPercent = previousPeriodUsers > 0 
      ? ((newUsers - previousPeriodUsers) / previousPeriodUsers * 100).toFixed(1)
      : 100;
    
    // Get total readings count
    const totalReadings = await Reading.countDocuments();
    
    // Get readings in current period
    const newReadings = await Reading.countDocuments({ date: { $gte: startDate } });
    
    // Get readings in previous period
    const previousPeriodReadings = await Reading.countDocuments({ 
      date: { $gte: previousStartDate, $lt: startDate } 
    });
    
    // Calculate readings growth percentage
    const readingsGrowthPercent = previousPeriodReadings > 0 
      ? ((newReadings - previousPeriodReadings) / previousPeriodReadings * 100).toFixed(1)
      : 100;
    
    // Get active users (users with at least one reading in current period)
    const activeUsers = await Reading.distinct('user', { date: { $gte: startDate } });
    const activeUsersCount = activeUsers.length;
    
    // Get active users in previous period
    const previousActiveUsers = await Reading.distinct('user', { 
      date: { $gte: previousStartDate, $lt: startDate } 
    });
    const previousActiveUsersCount = previousActiveUsers.length;
    
    // Calculate active users growth percentage
    const activeUsersGrowthPercent = previousActiveUsersCount > 0 
      ? ((activeUsersCount - previousActiveUsersCount) / previousActiveUsersCount * 100).toFixed(1)
      : 100;
    
    // Calculate average reading hours
    const readingStats = await Reading.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $group: { _id: null, totalHours: { $sum: "$hours" }, count: { $sum: 1 } } }
    ]);
    
    const averageReadingHours = readingStats.length > 0 
      ? (readingStats[0].totalHours / readingStats[0].count).toFixed(1)
      : 0;
    
    // Calculate previous period average reading hours
    const previousReadingStats = await Reading.aggregate([
      { $match: { date: { $gte: previousStartDate, $lt: startDate } } },
      { $group: { _id: null, totalHours: { $sum: "$hours" }, count: { $sum: 1 } } }
    ]);
    
    const previousAverageReadingHours = previousReadingStats.length > 0 
      ? previousReadingStats[0].totalHours / previousReadingStats[0].count
      : 0;
    
    // Calculate average reading hours growth percentage
    const avgHoursGrowthPercent = previousAverageReadingHours > 0 
      ? ((averageReadingHours - previousAverageReadingHours) / previousAverageReadingHours * 100).toFixed(1)
      : 100;
    
    // Get reading time distribution
    const readingDistribution = await Reading.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $group: {
        _id: {
          $cond: [
            { $lte: ["$hours", 1] }, "0-1 hours",
            { $cond: [
              { $lte: ["$hours", 2] }, "1-2 hours",
              { $cond: [
                { $lte: ["$hours", 4] }, "2-4 hours",
                "4+ hours"
              ]}
            ]}
          ]
        },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Format reading distribution for the frontend
    const userActivityData = readingDistribution.map(item => ({
      name: item._id,
      value: item.count
    }));
    
    // Get monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await Reading.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { 
          year: { $year: "$date" },
          month: { $month: "$date" }
        },
        readings: { $sum: 1 },
        uniqueUsers: { $addToSet: "$user" }
      }},
      { $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        readings: 1,
        users: { $size: "$uniqueUsers" }
      }},
      { $sort: { year: 1, month: 1 } }
    ]);
    
    // Format monthly trends for the frontend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrendData = monthlyTrends.map(item => ({
      month: monthNames[item.month - 1],
      readings: item.readings,
      users: item.users
    }));
    
    // Get recent activity (last 10 activities)
    const recentActivity = await Reading.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .lean();
    
    const formattedRecentActivity = recentActivity.map(activity => ({
      type: 'reading',
      username: activity.user.name,
      hours: activity.hours,
      timestamp: activity.createdAt
    }));
    
    // Add recent user signups to activity feed
    const recentSignups = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt')
      .lean();
    
    const formattedSignups = recentSignups.map(user => ({
      type: 'signup',
      username: user.name,
      timestamp: user.createdAt
    }));
    
    // Combine and sort all recent activity
    const allActivity = [...formattedRecentActivity, ...formattedSignups]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
    
    res.json({
      stats: {
        userCount,
        userGrowthPercent,
        totalReadings,
        readingsGrowthPercent,
        activeUsersCount,
        activeUsersGrowthPercent,
        averageReadingHours,
        avgHoursGrowthPercent
      },
      userActivityData,
      monthlyTrendData,
      recentActivity: allActivity
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin statistics' });
  }
});

module.exports = router;

*/


