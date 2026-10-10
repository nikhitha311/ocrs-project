/**
 * Data Store for OCRS Express Backend
 * MongoDB-backed version
 */

const Request = require('./Request');
const CertificateType = require('./CertificateType');

// Static list — never changes
const CERTIFICATE_TYPES = [
  { id: 'bonafide',           typeId: 'bonafide',           name: 'Bonafide Certificate',              fee: 0,   code: 'BC'  },
  { id: 'study_conduct',      typeId: 'study_conduct',      name: 'Study & Conduct Certificate',       fee: 0,   code: 'SCC' },
  { id: 'medium_instruction', typeId: 'medium_instruction', name: 'Medium of Instruction (English)',   fee: 0,   code: 'MOI' },
  { id: 'course_completion',  typeId: 'course_completion',  name: 'Course Completion Certificate',     fee: 0,   code: 'CCC' },
  { id: 'transfer_cert',      typeId: 'transfer_cert',      name: 'Transfer Certificate (TC)',         fee: 100, code: 'TC'  },
  { id: 'migration_cert',     typeId: 'migration_cert',     name: 'Migration Certificate',             fee: 150, code: 'MC'  },
];

// ── Requests ──
async function getRequestById(id) {
  const conditions = [{ trackingId: id }];
  if (/^[a-f\d]{24}$/i.test(id)) conditions.push({ _id: id });
  return await Request.findOne({ $or: conditions });
}

async function getRequestsByStudent(rollNumber) {
  return await Request.find({ rollNumber }).sort({ createdAt: -1 });
}

async function getAllRequests() {
  return await Request.find().sort({ createdAt: -1 });
}

async function addRequest(reqData) {
  const doc = new Request(reqData);
  return await doc.save();
}

async function updateRequest(id, fields) {
  const conditions = [{ trackingId: id }];
  if (/^[a-f\d]{24}$/i.test(id)) conditions.push({ _id: id });
  return await Request.findOneAndUpdate(
    { $or: conditions },
    { $set: fields },
    { new: true }
  );
}

// ── Certificate Types (static) ──
function getCertificateTypeByName(name) {
  const found = CERTIFICATE_TYPES.find(
    (c) => c.name.toLowerCase() === (name || '').toLowerCase()
  );
  if (found) return found;
  return {
    name: name || 'Official Certificate',
    fee: name?.includes('Transfer') ? 100 : name?.includes('Migration') ? 150 : 0,
  };
}

function getCertificateTypeById(id) {
  return CERTIFICATE_TYPES.find((c) => c.id === id || c.typeId === id);
}

// ── Seed helper ──
async function seedCertificateTypes() {
  const CertificateType = require('./CertificateType');
  const User = require('./User');
  const bcrypt = require('bcryptjs');

  // Seed certificate types
  const count = await CertificateType.countDocuments();
  if (count === 0) {
    const docs = CERTIFICATE_TYPES.map(t => ({
      typeId: t.typeId,
      name: t.name,
      fee: t.fee,
      code: t.code,
    }));
    await CertificateType.insertMany(docs);
    console.log('✅ Certificate types seeded to MongoDB');
  }

  // Seed admin
  const adminExists = await User.findOne({ email: 'admin@uni.edu' });
  if (!adminExists) {
    const adminPw = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Dr. K. S. Ramanujam',
      email: 'admin@uni.edu',
      passwordHash: adminPw,
      role: 'ADMIN',
    });
    console.log('✅ Admin user seeded to MongoDB');
  }

  // Seed student
  const studentExists = await User.findOne({ rollNo: '24881A12A1' });
  if (!studentExists) {
    const pw = await bcrypt.hash('student123', 10);
    await User.create({
      name: 'Nikhitha Mandhula',
      rollNo: '24881A12A1',
      email: 'nikhithamandhula18@gmail.com',
      department: 'Information Technology (IT)',
      passwordHash: pw,
      role: 'STUDENT',
    });
    console.log('✅ Student user seeded to MongoDB');
  }
}

module.exports = {
  CERTIFICATE_TYPES,
  getRequestById,
  getRequestsByStudent,
  getAllRequests,
  addRequest,
  updateRequest,
  getCertificateTypeByName,
  getCertificateTypeById,
  seedCertificateTypes,
};