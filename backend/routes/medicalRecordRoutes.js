const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer(); // Initialize multer for file uploads

const {
  addMedicalRecord,
  getMedicalRecordsForPatient,
  updateMedicalRecord,
  deleteMedicalRecord,
} = require('../controllers/medicalRecordController');

const router = express.Router();

// Routes for medical records
router.post('/add', protect, restrictTo('staff', 'admin'), upload.single('pdfFile'), addMedicalRecord);
router.get('/patient', protect, getMedicalRecordsForPatient);
router.put('/update', protect, restrictTo('staff', 'admin'), updateMedicalRecord);
router.delete('/delete', protect, restrictTo('staff', 'admin'), deleteMedicalRecord);

module.exports = router;
