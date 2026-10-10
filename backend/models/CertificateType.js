const mongoose = require('mongoose');

const certificateTypeSchema = new mongoose.Schema({
  typeId:       { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  fee:          { type: Number, default: 0 },
  code:         { type: String },
}, { timestamps: true });

module.exports = mongoose.model('CertificateType', certificateTypeSchema);