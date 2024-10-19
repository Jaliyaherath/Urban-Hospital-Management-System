const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  services: [String],
  availability: [
    {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Lab', labSchema);