const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  rollNo:       { type: String, unique: true, sparse: true },
  email:        { type: String, unique: true, sparse: true },
  phone:        { type: String },
  department:   { type: String },
  program:      { type: String },
  batch:        { type: String },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);