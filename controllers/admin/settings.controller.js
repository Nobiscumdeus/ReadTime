const User = require('../../models/User.model');
const Reading = require('../../models/Reading.model');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');


exports .ReadingsCSV=async(req,res)=>{
    try{
        const { startDate, endDate } = req.query;
        const query = {};
        
        if (startDate || endDate) {
          query.date = {};
          if (startDate) query.date.$gte = new Date(startDate);
          if (endDate) query.date.$lte = new Date(endDate);
        }

        // Get all readings with user data
    const readings = await Reading.find(query).populate('user', 'name email');
      // Create a temporary file path
      const timestamp = Date.now();
      const filePath = path.join(__dirname, '..', 'temp', `readings_export_${timestamp}.csv`);
       // Ensure temp directory exists
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

      // Configure CSV writer
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'userId', title: 'User ID' },
          { id: 'userName', title: 'User Name' },
          { id: 'userEmail', title: 'User Email' },
          { id: 'date', title: 'Reading Date' },
          { id: 'hours', title: 'Hours Read' },
          { id: 'notes', title: 'Notes' },
          { id: 'createdAt', title: 'Created At' }
        ]
      });

      // Format data for CSV
    const records = readings.map(reading => ({
        userId: reading.user._id,
        userName: reading.user.name,
        userEmail: reading.user.email,
        date: reading.date.toISOString().split('T')[0],
        hours: reading.hours,
        notes: reading.notes || '',
        createdAt: reading.createdAt.toISOString()
      }));

       // Write to CSV file
    await csvWriter.writeRecords(records);
    
    //Send file to client 

    res.download(filePath,`reading_data_${timestamp}.csv`,(err)=>{
        if(err){
            console.error('Error sending CSV file: ',csv);
        }

        //Delete the temporary file after sending 
        fs.unlink(filePath,(unlinkErr)=>{
            if(unlinkErr) console.error('Error deleting temporary CSV file',unlinkErr)
        })
    })


    }catch(error){
        console.error('Error exporting CSV: ',error);
        res.status(500).json({error:'Failed to export CSV data'})
    }
}



//Exporting all reading data as JSON
exports.ReadingsJSON = async (req, res) => {
    try {
      // Optional date range filtering
      const { startDate, endDate } = req.query;
      const query = {};
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
      
      // Get all readings with user data
      const readings = await Reading.find(query).populate('user', 'name email');
      
      // Format data for JSON export
      const formattedData = readings.map(reading => ({
        id: reading._id,
        user: {
          id: reading.user._id,
          name: reading.user.name,
          email: reading.user.email
        },
        date: reading.date,
        hours: reading.hours,
        notes: reading.notes || '',
        createdAt: reading.createdAt,
        updatedAt: reading.updatedAt
      }));
      
      // Set response headers for JSON download
      res.setHeader('Content-Disposition', 'attachment; filename=reading_data.json');
      res.setHeader('Content-Type', 'application/json');
      
      // Send JSON data
      res.json(formattedData);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      res.status(500).json({ error: 'Failed to export reading data as JSON' });
    }
  };

  
  exports.runDatabaseBackup = async (req, res) => {
    try {
      // In a real app, this would trigger a database backup process
      // For demonstration, we'll just return a success message
      
      // Log the backup event
      console.log(`Manual backup initiated by admin at ${new Date().toISOString()}`);
      
      // Return success response
      res.json({ 
        success: true, 
        message: 'Database backup initiated',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error running backup:', error);
      res.status(500).json({ error: 'Failed to run database backup' });
    }
  };
  
  /**
   * Clear application cache
   */
  exports.clearCache = async (req, res) => {
    try {
      // In a real app, this would clear Redis/Memcached or other cache systems
      // For demonstration, we'll just return a success message
      
      console.log(`Cache clearing initiated by admin at ${new Date().toISOString()}`);
      
      res.json({ 
        success: true, 
        message: 'Application cache cleared successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({ error: 'Failed to clear application cache' });
    }
  };
  
  /**
   * Optimize database
   */
  exports.optimizeDatabase = async (req, res) => {
    try {
      // In a real app, this might run VACUUM or other optimization commands
      // For demonstration, we'll just return a success message
      
      console.log(`Database optimization initiated by admin at ${new Date().toISOString()}`);
      
      res.json({ 
        success: true, 
        message: 'Database optimization completed',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error optimizing database:', error);
      res.status(500).json({ error: 'Failed to optimize database' });
    }
  };
  
  /**
   * Update application settings
   */
  exports.updateSettings = async (req, res) => {
    try {
      const { 
        appName, 
        supportEmail, 
        timezone,
        features,
        backupSchedule,
        notifications
      } = req.body;
      
      // In a real app, this would save to a Settings model or config file
      // For demonstration, we'll just log and return the values
      
      console.log('Settings update:', {
        appName,
        supportEmail,
        timezone,
        features,
        backupSchedule,
        notifications
      });
      
      res.json({ 
        success: true, 
        message: 'Settings updated successfully',
        settings: { 
          appName, 
          supportEmail, 
          timezone,
          features,
          backupSchedule,
          notifications 
        }
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update application settings' });
    }
  };
  
  /**
   * Regenerate API key
   */
  exports.regenerateApiKey = async (req, res) => {
    try {
      // In a real app, you would generate a secure random token
      // For demonstration, we'll create a simple one
      const apiKey = 'rt_api_' + Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
      
      // Log the regeneration event
      console.log(`API key regenerated by admin at ${new Date().toISOString()}`);
      
      res.json({ 
        success: true, 
        apiKey,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error regenerating API key:', error);
      res.status(500).json({ error: 'Failed to regenerate API key' });
    }
  };