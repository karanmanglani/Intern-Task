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
    user
  });
});

// Update user preferences (email, phone, address permissions)
exports.updatePreferences = catchAsync(async (req, res, next) => {
  const { email, phone, address } = req.body;

  // Update permissions based on user input (permissions are boolean)
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      'permissions.email': email === 'true',
      'permissions.phone': phone === 'true',
      'permissions.address': address === 'true'
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

  // After updating, render preferences page again with updated data
  res.status(200).render('preferences', {
    title: 'Preferences Updated',
    user: updatedUser,
    alert: 'preferences' // Show success message
  });
});

// Render user account page with current preferences
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
    user: req.user
  });
};

// Update user data (name and email) and render updated account page
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedUser) {
    return next(new AppError('User not found!', 404));
  }

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser
  });
});
