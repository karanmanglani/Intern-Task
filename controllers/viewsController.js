const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Render a page showing user preferences (email, phone, address permissions)
exports.getPreferencesPage = catchAsync(async (req, res, next) => {
  // Fetch the current user
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found!', 404));
  }

  // Render the preferences page with user data
  res.status(200).render('preferences', {
    title: 'Update Your Preferences',
    user,
    alert: req.query.alert || ''  // Check if there's an alert in the query string
  });
});

// Update user preferences (email, phone, address permissions)
exports.updatePreferences = catchAsync(async (req, res, next) => {
  const { email, phone, address } = req.body;

  // Validate input for preferences
  if (typeof email !== 'boolean' || typeof phone !== 'boolean' || typeof address !== 'boolean') {
    return next(new AppError('Invalid input for preferences!', 400));
  }

  // Update permissions based on user input (permissions are boolean)
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      'permissions.email': email,
      'permissions.phone': phone,
      'permissions.address': address
    },
    {
      new: true,
      runValidators: true
    }
  );

  // If no user is found or update failed, return error
  if (!updatedUser) {
    return next(new AppError('User not found!', 404));
  }

  // After updating, render preferences page again with updated data and success message
  res.status(200).render('preferences', {
    title: 'Preferences Updated',
    user: updatedUser,
    alert: 'preferences'  // Show success message after update
  });
});

// Render user account page with current preferences
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
    user: req.user // user is set from auth middleware
  });
};

// Update user data (name and email) and render updated account page
exports.updateUserData = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  // Update user name and email
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    {
      new: true,
      runValidators: true
    }
  );

  // If no user is found or update failed, return error
  if (!updatedUser) {
    return next(new AppError('User not found!', 404));
  }

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser
  });
});

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'preferences') {
    res.locals.alert = "Your preferences have been updated successfully!";
  }
  next(); // Pass control to the next middleware
};

exports.getOverview = async (req, res, next) => {
  // Ensure the user is logged in (already set by the protect middleware)
  if (!req.user) {
    return next(new AppError('User not found!', 404));
  }

  // Render the overview page with user data (for example, preferences)
  res.status(200).render('overview', {
    title: 'Your Preferences Overview',
    user: req.user  // The user is already added to req by the protect middleware
  });
};

// viewsController.js
exports.getSignupPage = (req, res) => {
  res.status(200).render('signup', { title: 'Sign Up' });
};
