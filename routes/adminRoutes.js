const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

const router = express.Router();

// Admin Signup and Login (Separate)
router.get('/login', adminController.getAdminLoginPage);
router.post('/login', adminController.login);
router.get('/signup', adminController.getAdminSignupPage);
router.post('/signup', adminController.signup);
router.get('/check-username/:username', adminController.checkUsernameAvailability);

// Admin Dashboard (for logged-in admins)
router.get('/admin', authController.protect, authController.restrictTo('admin'), adminController.getAdminDashboard);

// User management
router.get('/users', authController.protect, authController.restrictTo('admin'), adminController.getAllUsers);
router.get('/users/:id', authController.protect, authController.restrictTo('admin'), adminController.getUser);
router.get('/users/:id/edit', authController.protect, authController.restrictTo('admin'), adminController.getEditUserPage);
router.patch('/users/:id', authController.protect, authController.restrictTo('admin'), adminController.updateUser);
router.delete('/users/:id', authController.protect, authController.restrictTo('admin'), adminController.deleteUser);

module.exports = router;
