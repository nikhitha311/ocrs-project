const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const requestController = require('../controllers/requestController');

// POST /api/student/requests (Issue 3 duplicate guard)
router.post('/requests', requestController.createRequest);

// GET /api/student/certificate-types/eligible
router.get('/certificate-types/eligible', requestController.getEligibleTypes);

// GET /api/student/requests/:id/payment
router.get('/requests/:id/payment', paymentController.getPaymentDetails);

// POST /api/student/requests/:id/payment
router.post('/requests/:id/payment', paymentController.confirmPayment);

// GET /api/student/requests/:id/receipt
router.get('/requests/:id/receipt', paymentController.downloadReceipt);

module.exports = router;
