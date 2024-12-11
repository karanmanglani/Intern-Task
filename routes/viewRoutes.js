const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// Show landing page if user is not logged in
router.get('/', authController.isLoggedIn, viewsController.getLandingPage);

// Render the overview page with user preferences
router.get('/overview', authController.protect, viewsController.getOverview);

// Route to display and update user preferences
router.get('/preferences', authController.protect, viewsController.getPreferencesPage);

// Route to update user preferences (email, phone, address)
router.post('/update-preferences', authController.protect, viewsController.updatePreferences);

// Route to display and update user account data (name, email)
router.get('/account', authController.protect, viewsController.getAccount);

// Route to update user name and email
router.post('/update-user-data', authController.protect, viewsController.updateUserData);

// Sign up page
router.get('/signup', viewsController.getSignupPage);  // Renders the signup page
router.get('/login',viewsController.getLoginPage);

router.post('/update-:fieldName', authController.protect,viewsController.updateField);
router.post('/delete-:fieldName', authController.protect,viewsController.deleteField);

// Admin routes
router.get('/admin/login', viewsController.getAdminLoginPage);
router.get('/admin/signup', viewsController.getAdminSignupPage);

// Admin Dashboard (protected route, requires admin role)
router.get('/admin/dashboard', authController.protect, authController.restrictTo('admin'), viewsController.getAdminDashboard);

// Admin User Management
router.get('/admin/users', authController.protect, authController.restrictTo('admin'), viewsController.getAllUsers);
router.get('/admin/users/add', authController.protect, authController.restrictTo('admin'), viewsController.getAddUserPage);
router.get('/admin/users/:id', authController.protect, authController.restrictTo('admin'), viewsController.getUser);
router.get('/admin/users/:id/edit', authController.protect, authController.restrictTo('admin'), viewsController.getEditUserPage);

module.exports = router;
