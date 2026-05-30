const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  rawData:  { type: String, required: true },
  aiSummary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
