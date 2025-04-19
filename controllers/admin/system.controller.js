

const mongoose = require('mongoose');
const os = require('os');
const { exec } = require('child_process');
const User = require('../../models/User.model');
const Reading = require('../../models/Reading.model');
const {connectDB,getDbStatus}=require('../../db/mongodbConnection');



const metricsHistory=[]
const MAX_METRICS_HISTORY=20

//Function to collect system metrics 
const collectMetrics=()=>{
    const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = Math.round((totalMem - freeMem) / totalMem * 100);
  
  const timestamp=new Date()
  const metrics={
    timestamp,
    cpu:Math.round(cpuUsage),
    memory:memoryUsage,
    requests:Math.floor(Math.random() * 30) + 10
  }

  //Add to history and keep only recent entries 
  metricsHistory.unshift(metrics);
  if(metricsHistory.length > MAX_METRICS_HISTORY){
    metricsHistory.pop();
  }
  return metrics 
}

//Start collecting metrics every 2 minute
setInterval(collectMetrics,120000)

//Initialize first metrics
collectMetrics();

// Array to store system logs (in memory, will reset on server restart)
const systemLogs = [
    {
      timestamp: new Date(),
      level: 'INFO',
      message: 'System monitoring service started'
    }
  ];
  const MAX_LOGS = 100;

  //Add log helper function 

  const addSystemLog = (level, message) => {
    const log = {
      timestamp: new Date(),
      level,
      message
    };
    
    systemLogs.unshift(log);
    if (systemLogs.length > MAX_LOGS) {
      systemLogs.pop();
    }
    
    return log;
  };


exports.systemStats=async (req,res)=>{
    try{
         // Get current CPU and memory stats
    const currentMetrics = metricsHistory[0] || collectMetrics();
    
        // Get database stats
    const dbStats = await mongoose.connection.db.stats();
    const dbSizeInMB = Math.round(dbStats.dataSize / (1024 * 1024) * 10) / 10;
    const dbStorageSizeInMB = Math.round(dbStats.storageSize / (1024 * 1024) * 10) / 10;

     // Calculate "available" space (simplified for demo purposes)
    // In production you'd want to use actual disk space metrics
    const dbAvailableInMB = 5000 - dbStorageSizeInMB; // Assuming------------------ 5GB limit------------------

    addSystemLog('INFO','System stats requested');
    res.json({
        cpu: currentMetrics.cpu,
        memory: currentMetrics.memory,
        dbSize: dbSizeInMB,
        dbAvailable: dbAvailableInMB,
        collections: dbStats.collections,
        totalDocuments: dbStats.objects
      });
    }catch(error){
        console.error('Error getting system stats:',error)
        addSystemLog('ERROR', `Failed to collect system stats: ${error.message}`);
        res.status(500).json({ message: 'Server error' });

    } 


    }

// @route   GET api/admin/system/metrics
// @desc    Get historical system metrics
// @access  Private/Admin

exports.systemMetrics=async(req,res)=>{
    try{
        addSystemLog('INFO','System metrics history requested')
        res.json(metricsHistory)
    }catch(error){
        console.error('Error getting system metrics:', error);
        addSystemLog('ERROR', `Failed to retrieve metrics history: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.systemLogs=async(req,res)=>{
    try{
        res.json(systemLogs)
    }catch(error){
        console.error('Error getting system logs:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.systemDatabase= async(req,res)=>{
    try{
        const dbStats=await mongoose.connection.db.stats()
         // Get collection stats
    const userCount = await User.countDocuments();
    const readingCount = await Reading.countDocuments();
    
    // Calculate average readings per user
    const avgReadingsPerUser = userCount > 0 ? readingCount / userCount : 0;
    
    addSystemLog('INFO', 'Detailed database stats requested');
    
    res.json({
      dbStats,
      collections: {
        users: userCount,
        readings: readingCount
      },
      averages: {
        readingsPerUser: Math.round(avgReadingsPerUser * 10) / 10
      }
    });
  } catch (error) {
    console.error('Error getting database stats:', error);
    addSystemLog('ERROR', `Failed to retrieve database stats: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
}