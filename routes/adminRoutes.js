const express = require('express');
const adminController = require('./../controllers/adminController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('admin')); // Only allow admins to access the routes

// Admin routes for managing users
// router.get('/users', adminController.getAllUsers); // Get all users
// router.get('/users/:id', adminController.getUser); // Get a single user by ID
// router.patch('/users/:id', adminController.updateUser); // Update user by ID
// router.delete('/users/:id', adminController.deleteUser); // Delete user by ID
// router.patch('/users/:id/deactivate', adminController.deactivateUser); // Soft delete user (deactivate account)

module.exports = router;
