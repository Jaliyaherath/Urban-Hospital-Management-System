const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createLabSession, getAvailableLabSessions, getUserBookings, manageBookings,bookLabSessionWithPayment,deleteAppointment,updateAppointmentStatus } = require('../controllers/labController');
const router = express.Router();

// Route for admins and staff to create lab sessions
router.post('/create', protect, restrictTo('staff', 'admin'), createLabSession);

// Route for users to view and book lab sessions
router.get('/available', protect, getAvailableLabSessions);
//router.post('/book', protect, bookLabSession);

// Routes for users to view their own bookings
router.get('/my-appointments', protect, getUserBookings);

// Routes for staff/admin to view, update, and delete bookings
router.get('/manage-appointments', protect, restrictTo('staff', 'admin'), manageBookings);

router.delete('/:appointmentId', protect, restrictTo('staff', 'admin'), deleteAppointment);

router.put('/:appointmentId', protect, restrictTo('staff', 'admin'), updateAppointmentStatus);

router.post('/book-with-payment', protect, bookLabSessionWithPayment);

module.exports = router;
