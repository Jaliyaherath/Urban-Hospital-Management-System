const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  record: { type: String, required: true },
  pdfUrl: { type: String, required: true }, // URL for the uploaded PDF file
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
