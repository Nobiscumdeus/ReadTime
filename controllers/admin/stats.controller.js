const User = require('../../models/User.model');
const Reading = require('../../models/Reading.model');

exports.getAdminStats = async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    const now = new Date();
    
    // Calculate date ranges
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
    
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));

    // Parallel database queries
    const [
      userCount,
      newUsers,
      previousPeriodUsers,
      totalReadings,
      newReadings,
      previousPeriodReadings,
      activeUsers,
      previousActiveUsers,
      readingStats,
      previousReadingStats,
      readingDistribution,
      monthlyTrends,
      recentActivity,
      recentSignups
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: previousStartDate, $lt: startDate } }),
      Reading.countDocuments(),
      Reading.countDocuments({ date: { $gte: startDate } }),
      Reading.countDocuments({ date: { $gte: previousStartDate, $lt: startDate } }),
      Reading.distinct('user', { date: { $gte: startDate } }),
      Reading.distinct('user', { date: { $gte: previousStartDate, $lt: startDate } }),
      Reading.aggregate([
        { $match: { date: { $gte: startDate } } },
        { $group: { _id: null, totalHours: { $sum: "$hours" }, count: { $sum: 1 } } }
      ]),
      Reading.aggregate([
        { $match: { date: { $gte: previousStartDate, $lt: startDate } } },
        { $group: { _id: null, totalHours: { $sum: "$hours" }, count: { $sum: 1 } } }
      ]),
      Reading.aggregate([
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
      ]),
      Reading.aggregate([
        { $match: { date: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) } } },
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
      ]),
      Reading.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name')
        .lean(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt')
        .lean()
    ]);

    // Calculate metrics
    const userGrowthPercent = previousPeriodUsers > 0 
      ? ((newUsers - previousPeriodUsers) / previousPeriodUsers * 100).toFixed(1)
      : 100;
    
    const readingsGrowthPercent = previousPeriodReadings > 0 
      ? ((newReadings - previousPeriodReadings) / previousPeriodReadings * 100).toFixed(1)
      : 100;
    
    const activeUsersCount = activeUsers.length;
    const previousActiveUsersCount = previousActiveUsers.length;
    const activeUsersGrowthPercent = previousActiveUsersCount > 0 
      ? ((activeUsersCount - previousActiveUsersCount) / previousActiveUsersCount * 100).toFixed(1)
      : 100;
    
    const averageReadingHours = readingStats.length > 0 
      ? (readingStats[0].totalHours / readingStats[0].count).toFixed(1)
      : 0;
    
    const previousAverageReadingHours = previousReadingStats.length > 0 
      ? previousReadingStats[0].totalHours / previousReadingStats[0].count
      : 0;
    
    const avgHoursGrowthPercent = previousAverageReadingHours > 0 
      ? ((averageReadingHours - previousAverageReadingHours) / previousAverageReadingHours * 100).toFixed(1)
      : 100;

    //.............................Trend directions .....................................
    // In your metric calculations section, add trend direction:
    const userTrend = newUsers >= previousPeriodUsers ? 'up' : 'down';
    const readingsTrend = newReadings >= previousPeriodReadings ? 'up' : 'down';
    const activeUsersTrend = activeUsersCount >= previousActiveUsersCount ? 'up' : 'down';
    const avgHoursTrend = averageReadingHours >= previousAverageReadingHours ? 'up' : 'down';



    // Format response data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const responseData = {
      stats: {
        userCount,
        userGrowthPercent,
        totalReadings,
        readingsGrowthPercent,
        activeUsersCount,
        activeUsersGrowthPercent,
        averageReadingHours,
        avgHoursGrowthPercent,
        //Trends....
        userTrend,
        readingsTrend,
        activeUsersTrend,
        avgHoursTrend

      },
      userActivityData: readingDistribution.map(item => ({
        name: item._id,
        value: item.count
      })),
      monthlyTrendData: monthlyTrends.map(item => ({
        month: monthNames[item.month - 1],
        readings: item.readings,
        users: item.users
      })),
      recentActivity: [
        ...recentActivity.map(a => ({
          type: 'reading',
        //  username: a.user.username,
       // username:a.name,
        username:a.user?.name || 'Unknown',
          hours: a.hours,
          timestamp: a.createdAt
        })),
        ...recentSignups.map(u => ({
          type: 'signup',
          username: u.name,
          timestamp: u.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)
    };

    // Send the response
    res.json(responseData);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching admin statistics',
      error: error.message 
    });
  }
};