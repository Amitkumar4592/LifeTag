const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uniqueId: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  bloodGroup: { type: String },
  medicalDetails: { type: String },
  pdfPath: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
