const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createAppointment, getAppointmentsForPatient, getAppointmentsForHospitalStaff, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const router = express.Router();

// User and Admin create appointments
router.post('/create', protect, restrictTo('user', 'admin'), createAppointment);

// User fetches their appointments
router.get('/patient', protect, restrictTo('user'), getAppointmentsForPatient);

// Hospital staff and Admin fetch all appointments
router.get('/staff', protect, restrictTo('staff', 'admin'), getAppointmentsForHospitalStaff);

// Hospital staff updates user appointments
router.patch('/:id', protect, restrictTo('staff', 'admin'), updateAppointment);

// Admin deletes appointments
router.delete('/:id', protect, restrictTo('admin'), deleteAppointment);

module.exports = router;
