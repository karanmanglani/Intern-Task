const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true, // Ensure unique usernames
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot be more than 20 characters'],
  },
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,  // Still enforce uniqueness, but will handle null values separately
    validate: [validator.isEmail, 'Please provide a valid email'],
    sparse: true // This allows for multiple documents to have null email
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  permissions: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    address: { type: Boolean, default: false }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Instance method to check password correctness
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to update permissions and remove specific data
userSchema.methods.updatePermissions = async function (updatedPermissions) {
  this.permissions = { ...this.permissions, ...updatedPermissions };
  if (!this.permissions.email) this.email = undefined;
  if (!this.permissions.phone) this.phone = undefined;
  if (!this.permissions.address) this.address = undefined;

  await this.save();
};

// Method to initialize permissions based on user input
userSchema.methods.initializePermissions = async function (initialPermissions) {
  this.permissions = { ...initialPermissions };
  if (!this.permissions.email) this.email = undefined;
  if (!this.permissions.phone) this.phone = undefined;
  if (!this.permissions.address) this.address = undefined;

  await this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
