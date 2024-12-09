const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

// Middleware to hash the password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to verify password
adminSchema.methods.correctPassword = async function (candidatePassword, adminPassword) {
  return await bcrypt.compare(candidatePassword, adminPassword);
};

// Method to update the last login timestamp
adminSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save();
};

// Dashboard-specific methods (optional)

// Method to get all user data for the dashboard
adminSchema.statics.getAllUsers = async function () {
  const User = mongoose.model('User');
  return await User.find({}, { name: 1, email: 1, phone: 1, address: 1, permissions: 1 });
};

// Method to delete a specific user
adminSchema.statics.deleteUserById = async function (userId) {
  const User = mongoose.model('User');
  return await User.findByIdAndDelete(userId);
};

// Method to search users by name or email
adminSchema.statics.searchUsers = async function (query) {
  const User = mongoose.model('User');
  return await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  });
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
