const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Signup and login routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// // Forgot and reset password routes
// router.post('/forgotPassword', authController.forgotPassword);
// router.patch('/resetPassword/:token', authController.resetPassword);

// // Protect all routes after this middleware
router.use(authController.protect);

// // User-specific routes
router.get('/me', userController.getMe, userController.getUser); // Get user profile
router.patch('/updateMe', userController.updateMe); // Update user preferences (email, phone, address)
router.delete('/deleteMe', userController.deleteMe); // Soft delete user (deactivate account)

// Route to check username availability
router.get('/check-username/:username', userController.checkUsernameAvailability);

// // Routes for updating and viewing user preferences
// router.get('/preferences', userController.getPreferencesPage); // Get preferences page
// router.post('/update-preferences', userController.updatePreferences); // Update user preferences

module.exports = router;
