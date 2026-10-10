const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

// Placeholder routes
router.get('/', (req, res) => {
  res.json({ message: 'Admin routes module initialized' });
});

// POST /api/admin/requests/:id/reject (Issue 1)
router.post('/requests/:id/reject', adminController.rejectRequest);

module.exports = router;
