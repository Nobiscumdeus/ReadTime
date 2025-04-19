// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.NODE_ENV === 'production' ? 
      ['https://read-time-beige.vercel.app/','https://read-time-beige.vercel.app'] : 
      ['http://localhost:5173', 'http://localhost:3000'];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Enable cookies/cross-origin credentials if needed
};

module.exports=corsOptions;