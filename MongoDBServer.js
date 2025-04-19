const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router=express.Router();
const app = express();
const corsOptions=require('./config/corsConfig');
const { authMiddleware, adminMiddleware,  handleAIServiceError ,dbConnectionCheck } = require('./middleware/authenticate');
const {connectDB,getDbStatus}=require('./db/mongodbConnection');

const {handleReadingError}=require('./utility/service')
const User = require('./models/User.model');
const Reading = require('./models/Reading.model');
const authRoutes=require('./routes/auth.routes');
const testRoutes=require('./routes/test.routes')
const userRoutes=require('./routes/user.routes');
//const adminRoutes=require('./routes/admin.routes');
const adminRoutes=require('./routes/admin/users.routes');
const dataRoutes = require('./routes/data.routes');
const statsRoutes = require('./routes/stats.routes');
const aiRoutes=require('./routes/ai.routes');
//const adminStatsRoutes=require('./routes/adminStats.routes');
const adminStatsRoutes=require('./routes/admin/stats.routes');

const systemRoutes=require('./routes/admin/system.routes');
const settingsRoutes=require('./routes/admin/settings.routes');

require('dotenv').config();



// Database connection
connectDB().then(() => {
  // Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

  // Start server only after DB connection attempt
  const PORT = process.env.PORT || 5000;

  // AI service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  //Authentication routes
app.use('/api/auth/',authRoutes);
//Test routes
app.use(testRoutes);
//User routes
app.use(userRoutes);
//Admin rotes
app.use(adminRoutes);

//Data routes
app.use('/api/data', dataRoutes);
//AI Routes
app.use('/api/ai',aiRoutes);
//Admin stats routes
app.use(adminStatsRoutes);

//System routes
app.use(systemRoutes);

//Settings routes
app.use(settingsRoutes);

//DB status check route 
app.get('/api/status', (req, res) => {
  res.json({
    dbConnected: getDbStatus(),
    message: getDbStatus() 
      ? 'Database is connected' 
      : 'Database is disconnected - some features may be limited'
  });
});



  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database status: ${getDbStatus() ? 'Connected' : 'Disconnected'}`);
  });
});

