// middleware/aiErrorHandler.js
exports.handleAIServiceError = (err, res) => {
    console.error('AI Service Error:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
    
    if (err.response) {
      // Forward the AI service's error response
      return res.status(err.response.status).json({
        error: 'AI Service Error',
        details: err.response.data
      });
    }
    
    res.status(500).json({
      error: 'AI Service Unavailable',
      details: err.message
    });
  };