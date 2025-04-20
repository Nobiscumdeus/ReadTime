// controllers/ai.controller.js
const axios = require('axios');
const { handleAIServiceError } = require('../middleware/authenticate');
const Reading = require('../models/Reading.model');
const User = require('../models/User.model');
require('dotenv').config();

// Any other models you need
//const AI_SERVICE_URL = process.env.AI_SERVICE_URL||'http://localhost:8000';
const AI_SERVICE_URL=process.env.AI_SERVICE_URL || 'https://readtimeai.onrender.com:8000' || 'https://readtimeai.onrender.com'

exports.analyzeReadings = async (req, res) => {
  try {
    // 1. Validate month
    const month = parseInt(req.body.month);
    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid month (must be 1-12)' });
    }
    
    // 2. Query MongoDB with timezone handling
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, month - 1, 1);
    const endDate = new Date(currentYear, month, 0);
  
    
      
     const readings = await Reading.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

   
    
    // 3. If no data, return meaningful error
    if (readings.length === 0) {
      return res.status(404).json({
        insights: [{
          type: "error",
          title: "No Data Found",
          message: `No reading data found for month ${month}`,
          score: 0
        }]
      });
    }
    
    // 4. Transform data
    const formattedReadings = readings.map(reading => ({
      date: new Date(reading.date).toISOString(),
      hours: parseFloat(reading.hours)
    }));
    
    // 5. Call AI service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/analyze`, {
      readings: formattedReadings
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    res.json(aiResponse.data);
    
  } catch (err) {
    console.error("AI Analysis error:", {
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });
    res.status(500).json({
      error: "Analysis failed",
      details: err.message
    });
  }
};

exports.predictGoal = async (req, res) => {
  try {
    const { target_hours, month_data } = req.body;
    
    // Validate and transform data
    const requestData = {
      target_hours: parseFloat(target_hours),
      month_data: month_data.map(item => ({
        date: item.date,
        hours: parseFloat(item.hours)
      }))
    };
    
    // Call AI service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/predict-goal`, requestData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    res.json(aiResponse.data);
  } catch (err) {
    handleAIServiceError(err, res);
  }
};