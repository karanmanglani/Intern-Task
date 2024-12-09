const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const Admin = require('./../models/adminModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN // Token expiration
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id, user.role);
  const expiresIn = process.env.JWT_EXPIRES_IN;
  const days = parseInt(expiresIn, 10);

  // Set the JWT cookie with the token
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove password from the user object before sending it
  user.password = undefined;

  // Send the response with status and token data (success response)
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

// Signup for regular users
exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, phone, address, password, passwordConfirm, emailPermission, phonePermission, addressPermission ,name} = req.body;

  // Check if the email or username already exists in the database
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return next(new AppError('Username is already taken. Please choose a different username.', 400));
  }

  // Check if passwords match
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match!', 400));
  }

  // Create a new user
  const newUser = await User.create({
    username,
    name,
    email: emailPermission === 'true' ? email : undefined,  // Store email only if permission is granted
    phone: phonePermission === 'true' ? phone : undefined,  // Store phone only if permission is granted
    address: addressPermission === 'true' ? address : undefined, // Store address only if permission is granted
    password,
    passwordConfirm,
    permissions: {
      email: emailPermission === 'true',
      phone: phonePermission === 'true',
      address: addressPermission === 'true',
    }
  });

  // Send the token and redirect to the overview page
  createSendToken(newUser, 201, req, res);
});



// Login for users and admins
exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError('Please provide a username and password!', 400));
  }

  // Find user by username (not email)
  const user = await User.findOne({ username }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect username or password', 401));
  }

  // If everything is ok, send token and data
  createSendToken(user, 200, req, res);
});

// Logout
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

// Protect middleware (skip for username availability route)
exports.protect = catchAsync(async (req, res, next) => {
  if (req.originalUrl.startsWith('/api/v1/users/check-username')) {
    return next();  // Skip authentication for the check-username route
  }

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const model = decoded.role === 'admin' ? Admin : User;
    const currentUser = await model.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    return next(err);
  }
});



// Restrict routes to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Admin-specific functions
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({}, { username: 1, name: 1, email: 1, phone: 1, address: 1, permissions: 1 });
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});

// Check if the user is logged in (checks for a valid JWT)
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged-in user, set currentUser in res.locals
      res.locals.user = currentUser;  // Making user data available in views
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
