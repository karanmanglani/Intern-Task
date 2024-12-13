const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const AuditLog = require('../models/auditLog');
const User = require('../models/userModel');

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
router.get('/admin/users', authController.protect, authController.restrictTo('admin'), viewsController.getAdminDashboard );

// Endpoint to fetch audit logs
router.get('/admin/audit-logs', async (req, res) => {
    const logs = await AuditLog.find({});
    res.json(logs);
});

router.get('/admin/user-ips', async (req, res) => {
    try {
      // Fetch users with IP addresses
      const usersWithIps = await User.find({ ipAddress: { $ne: null } }).select('ipAddress');
      
      // Return IP addresses as JSON
      res.status(200).json(usersWithIps.map(user => user.ipAddress));
    } catch (error) {
      console.error("Error fetching user IPs:", error);
      res.status(500).send("Error fetching user IPs");
    }
});

router.get('/admin/get-username/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'username');
    res.json({ username: user ? user.username : 'Unknown' });
  } catch (error) {
    console.error("Error fetching username:", error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
