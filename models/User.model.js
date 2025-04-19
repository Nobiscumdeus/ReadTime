const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpires: {
    type: Date
  },
  isActive: {  // Add this field
    type: Boolean,
    default: true
  },
  lastActive: {  // Add this field
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reading'
  }]
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Your original implementation is fine - 10 is a good salt rounds value
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error); // Add error handling for robustness
  }
});

// Add this method if you don't already have it elsewhere
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



/*
// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
*/



module.exports = mongoose.model('User', UserSchema);

//module.exports = mongoose.model('User', mongoose.model('User', UserSchema) || UserSchema);