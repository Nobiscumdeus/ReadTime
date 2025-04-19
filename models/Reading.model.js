const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: { 
    type: String, 
    trim: true, 
    maxlength: 500 
  },
  date: {
    type: Date,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
ReadingSchema.index({ user: 1, date: 1 }, { unique: true });
ReadingSchema.index({ user: 1, createdAt: -1 });

// Update timestamp middleware
ReadingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Reading', ReadingSchema);