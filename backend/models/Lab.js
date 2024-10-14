const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  availability: [{ type: Date }]
});

module.exports = mongoose.model('Lab', labSchema);
