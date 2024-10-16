const mongoose = require('mongoose');

const treatmentAppointmentSchema = new mongoose.Schema({
  treatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['booked', 'completed', 'canceled'],
    default: 'booked'
  }
});

const TreatmentAppointment = mongoose.model('TreatmentAppointment', treatmentAppointmentSchema);

module.exports = TreatmentAppointment;
