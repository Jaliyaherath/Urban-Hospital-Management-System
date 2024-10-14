const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  availability: [{ type: Date }] // store available time slots
});

module.exports = mongoose.model('Doctor', doctorSchema);
