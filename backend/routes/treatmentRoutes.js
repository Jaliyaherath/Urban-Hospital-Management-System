const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  createTreatmentSession,
  getAvailableTreatments,
  bookTreatmentSession,
  getUserBookings,
  manageBookings
} = require('../controllers/treatmentController');

const router = express.Router();

// Route for admins and staff to create treatment sessions
router.post('/create', protect, restrictTo('staff', 'admin'), createTreatmentSession);

// Route for users to view and book treatment sessions
router.get('/available', protect, getAvailableTreatments);
router.post('/book', protect, bookTreatmentSession);

// Routes for users to view their own bookings
router.get('/my-appointments', protect, getUserBookings);

// Routes for staff/admin to view, update, and delete bookings
router.get('/manage-appointments', protect, restrictTo('staff', 'admin'), manageBookings);

module.exports = router;