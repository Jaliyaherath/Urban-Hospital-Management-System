const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createAppointment, getAppointmentsForPatient, getAppointmentsForHospitalStaff, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const router = express.Router();
const multer = require('multer');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// User and Admin create appointments
router.post('/create', protect, restrictTo('user', 'admin'), upload.single('picture'), createAppointment);

// User fetches their appointments
router.get('/patient', protect, restrictTo('user'), getAppointmentsForPatient);

// Hospital staff and Admin fetch all appointments
router.get('/staff', protect, restrictTo('staff', 'admin'), getAppointmentsForHospitalStaff);

// Hospital staff updates user appointments
router.put('/:id', protect, restrictTo('staff', 'admin'), upload.single('picture'), updateAppointment);

// Admin deletes appointments
router.delete('/:id', protect, restrictTo('admin'), deleteAppointment);

module.exports = router;
