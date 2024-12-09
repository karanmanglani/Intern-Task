const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// Alerts middleware (if any)
router.use(viewsController.alerts);  // Make sure this is a valid middleware function

// Route to display the overview page with user preferences
router.get('/', authController.isLoggedIn, viewsController.getOverview);

// // Route to display and update user preferences
router.get('/preferences', authController.protect, viewsController.getPreferencesPage);

// // Route to update user preferences (email, phone, address)
router.post('/update-preferences', authController.protect, viewsController.updatePreferences);

// // Route to display and update user account data (name, email)
router.get('/account', authController.protect, viewsController.getAccount);

// // Route to update user name and email
router.post('/update-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;
