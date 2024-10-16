const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const multer = require('multer');
const {
  addMedicalRecord,
  getMedicalRecordsForPatient,
  updateMedicalRecord,
  deleteMedicalRecord,
} = require('../controllers/medicalRecordController');

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') { // Ensure file is a PDF
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Routes for medical records
router.post('/add', protect, restrictTo('staff', 'admin'), upload.single('pdfUrl'), addMedicalRecord);
router.get('/patient', protect, getMedicalRecordsForPatient);
router.put('/update', protect, restrictTo('staff', 'admin'), updateMedicalRecord);
router.delete('/delete', protect, restrictTo('staff', 'admin'), deleteMedicalRecord);

module.exports = router;
