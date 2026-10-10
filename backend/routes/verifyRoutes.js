const express = require('express');
const router = express.Router();

// Placeholder routes to be expanded in STEP 7
router.get('/', (req, res) => {
  res.json({ message: 'Verification routes module initialized' });
});

module.exports = router;
