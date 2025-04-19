// Error handler for reading operations
/*
function handleReadingError(res, error) {
    console.error('[Reading Error]', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Reading operation failed'
    });
  }
  
  */
  // Stats calculation (reusable)
  async function calculateUserStats(userId, month) {
    const startDate = new Date(month);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    
    const readings = await Reading.find({
      user: userId,
      date: { $gte: startDate, $lt: endDate }
    });
    
    const totalHours = readings.reduce((sum, r) => sum + r.hours, 0);
    const avgHours = readings.length ? totalHours / readings.length : 0;
    
    return {
      totalHours,
      avgHours,
      daysTracked: readings.length,
      readings: readings.map(r => ({
        date: r.date,
        hours: r.hours
      }))
    };
  }

  const handleReadingError = (res, error) => {
      console.error('Reading operation error:', error);
      
      // Handle different error types
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid data provided',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }
      
      if (error.name === 'MongoServerError' && error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Reading entry already exists for this date'
        });
      }
      
      if (error.kind === 'ObjectId') {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }
      
      // Default server error
      res.status(500).json({
        success: false,
        message: 'Server error while processing reading data'
      });
    };


    // middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = errorHandler;

    module.exports={handleReadingError, calculateUserStats};