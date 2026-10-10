const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'ocrs-super-secret-key-2026';

// Base route
router.get('/', (req, res) => {
  res.json({ message: 'Auth routes module initialized', status: 'OK' });
});

// ────────────────────────────────────────
// ADMIN LOGIN
// ────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUser = (username || '').trim().toLowerCase();

    // Find admin by email (or accept 'admin' as alias for admin@uni.edu)
    const email = normalizedUser === 'admin' ? 'admin@uni.edu' : normalizedUser;
    const user = await User.findOne({ email, role: 'ADMIN' });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin Credentials.',
      });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin Credentials.',
      });
    }

    const token = jwt.sign({ id: user._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      user: {
        role: 'admin',
        name: user.name,
        email: user.email,
        designation: 'Dean of Academic Affairs',
      },
      token,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ────────────────────────────────────────
// STUDENT LOGIN
// ────────────────────────────────────────
router.post('/student/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const idStr = (identifier || '').trim();

    // Find by rollNo OR email
    const user = await User.findOne({
      role: 'STUDENT',
      $or: [
        { rollNo: idStr.toUpperCase() },
        { email: idStr.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Student Credentials.',
      });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Student Credentials.',
      });
    }

    const token = jwt.sign({ id: user._id, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      user: {
        role: 'student',
        name: user.name,
        rollNumber: user.rollNo,
        email: user.email,
        department: user.department,
        academicYear: user.batch || '2024-2026',
      },
      token,
    });
  } catch (err) {
    console.error('Student login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ────────────────────────────────────────
// STUDENT REGISTER (NEW!)
// ────────────────────────────────────────
router.post('/student/register', async (req, res) => {
  try {
    const { name, rollNo, email, password, department, batch } = req.body;

    if (!name || !rollNo || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, rollNo, email, password required',
      });
    }

    // Check duplicates
    const existing = await User.findOne({
      $or: [{ rollNo: rollNo.toUpperCase() }, { email: email.toLowerCase() }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists with this rollNo or email',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      rollNo: rollNo.toUpperCase(),
      email: email.toLowerCase(),
      department: department || 'Information Technology (IT)',
      batch: batch || '2024-2026',
      passwordHash,
      role: 'STUDENT',
    });

    const token = jwt.sign({ id: user._id, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      user: {
        role: 'student',
        name: user.name,
        rollNumber: user.rollNo,
        email: user.email,
        department: user.department,
        academicYear: user.batch,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;