const Reading = require('../models/Reading.model');
const { parseAnyDate } = require('../utility/dateParser');

exports.saveReading = async (req, res) => {
  try {
    const { date: rawDate, hours } = req.body;
    const userId = req.user.id;

    const date = parseAnyDate(rawDate);
    if (!date || isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const reading = await Reading.findOneAndUpdate(
      { user: userId, date: { $gte: startOfDay, $lte: new Date(startOfDay.getTime() + 86400000 - 1) }},
      { user: userId, date: startOfDay, hours: parseFloat(hours) },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        id: reading._id,
        date: startOfDay.toISOString().split('T')[0],
        hours: reading.hours
      }
    });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

exports.deleteReading = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    
    const parsedDate = parseAnyDate(date);
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);
    
    const result = await Reading.deleteOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    if (result.deletedCount === 0) {
      return res.status(200).json({ success: true, message: 'No reading found' });
    }
    
    res.json({ success: true, data: { date: startOfDay.toISOString().split('T')[0] }});
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

exports.getMonthlyData = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user.id;
    const monthNum = parseInt(month);
    
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Month must be 1-12' });
    }
    
    const year = new Date().getFullYear();
    const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));
    
    const readings = await Reading.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 }).lean();
    
    res.json({ success: true, data: readings });
  } catch (err) {
    console.error('Monthly data error:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};