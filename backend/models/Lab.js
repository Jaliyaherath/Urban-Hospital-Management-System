const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  services: [String], // Additional services offered by the lab
  availability: [
    {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the admin/staff who created the session
    required: true
  }
});

module.exports = mongoose.model('Lab', labSchema);
