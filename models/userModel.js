const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

async function emailValidator(value) {
  // Check if the email is provided and is in the correct format
  if (value && !validator.isEmail(value)) {
    throw new Error('Please provide a valid email address.');
  }
  
  // If email is provided, ensure it is unique (only check if not null)
  if (value) {
    const existingUser = await mongoose.models.User.findOne({ email: value });
    if (existingUser) {
      throw new Error('Email is already registered. Please use a different email.');
    }
  }

  return true; // Validation passed
}

async function phoneValidator(value) {
  // If phone is provided, ensure it's unique (only check if not null)
  if (value) {
    const existingUser = await mongoose.models.User.findOne({ phone: value });
    if (existingUser) {
      throw new Error('Phone number is already registered. Please use a different phone number.');
    }
  }

  return true; // Validation passed
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true
  },
  email: {
    type: String,
    unique: false,
    validate: {
      validator: emailValidator, // Custom email validation
      message: '{VALUE} is not a valid email or it already exists.'
    },
    lowercase: true,
    required: false,  // Email is optional, handled manually in signup logic
  },
  phone: {
    type: String,
    validate: {
      validator: phoneValidator, // Custom phone validation
      message: '{VALUE} is not a valid phone number or it already exists.'
    },
    default: null,
  },
  address: {
    type: String,
    default: null, // Allow null by default
  },
  permissions: {
    email: {
      type: Boolean,
      default: false
    },
    phone: {
      type: Boolean,
      default: false
    },
    address: {
      type: Boolean,
      default: false
    }
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
