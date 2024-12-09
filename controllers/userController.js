const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// Get current logged-in user (sets user id for the next middleware)
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id; // Set user id from JWT
  next();
};

// Update user preferences (email, phone, address permissions)
exports.updateMe = catchAsync(async (req, res, next) => {
  // Prevent password updates through this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // Filter allowed fields to update (name, email, phone, address, permissions)
  const filteredBody = filterObj(req.body, 'name', 'email', 'phone', 'address', 'permissions');

  // Update user document with the filtered data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  // Handle case where user is not found
  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
});

// Soft delete user account (set active to false)
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  // Handle case where user is not found
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get a single user by ID
exports.getUser = factory.getOne(User);

// Get all users (admin view for managing user data)
exports.getAllUsers = factory.getAll(User);

// Create new user (this route is not defined in this project; handle via signup route)
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};

// Admin can update user details, excluding password
exports.updateUser = factory.updateOne(User);

// Admin can delete user by ID
exports.deleteUser = factory.deleteOne(User);

// Utility function to filter allowed fields for updates
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.checkUsernameAvailability = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  console.log('Checking availability for username:', username);  // Log username being checked

  // Check if the username already exists in the database (exact match)
  const existingUser = await User.findOne({ username: username });

  if (existingUser) {
    console.log('Username already exists');
    return res.status(200).json({
      status: 'success',
      data: { isAvailable: false }  // Username is already taken
    });
  }

  console.log('Username is available');
  return res.status(200).json({
    status: 'success',
    data: { isAvailable: true }  // Username is available
  });
});



