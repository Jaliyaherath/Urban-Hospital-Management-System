const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospital: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
