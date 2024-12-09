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
  // Convert input values to booleans
  const email = req.body.email === 'true';
  const phone = req.body.phone === 'true';
  const address = req.body.address === 'true';

  // Update permissions based on user input
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
    alert: 'Preferences have been updated successfully!' // Show success message
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
exports.getLoginPage = (req, res) => {
  res.status(200).render('login', { title: 'Log In' });
};
exports.getLandingPage = (req, res) => {
  res.status(200).render('landing', { title: 'Home' });
};

exports.updateField = catchAsync(async (req, res, next) => {
  const fieldName = req.params.fieldName; // e.g., 'email', 'phone', or 'address'
  const { value } = req.body;

  if (!value) {
    return next(new AppError('No value provided!', 400));
  }

  const permissionField = `permissions.${fieldName}`;

  // Log the request for debugging
  console.log('Updating field:', fieldName);
  console.log('Value:', value);

  // Update both the permission and the corresponding value
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      [fieldName]: value, // Update the field value (e.g., email)
      [permissionField]: true // Ensure the permission is also set to true
    },
    {
      new: true,
      runValidators: true // Apply validation rules from the schema
    }
  );

  if (!updatedUser) {
    return next(new AppError('User not found!', 404));
  }

  console.log('Updated user:', updatedUser); // Debugging log

  res.status(200).json({
    status: 'success',
    message: `${fieldName} updated successfully!`,
  });
});



exports.deleteField = catchAsync(async (req, res, next) => {
  const fieldName = req.params.fieldName; // e.g., 'email', 'phone', or 'address'

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { [fieldName]: null, [`permissions.${fieldName}`]: false }, // Clear the field and disable the permission
    { new: true }
  );

  if (!updatedUser) {
    return next(new AppError('User not found!', 404));
  }

  res.status(200).json({
    status: 'success',
    message: `${fieldName} removed successfully!`,
  });
});
