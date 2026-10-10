const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { getRequestById, getCertificateTypeByName, updateRequest } = require('../models/store');
const { generateReceiptPdf } = require('../utils/receiptGenerator');
const { sendEmail } = require('../emailService');

// GET /api/student/requests/:id/payment
exports.getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await getRequestById(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const certType = getCertificateTypeByName(request.certificateType);
    const fee = certType.fee;

    if (fee === 0) {
      return res.json({ fee: 0, status: 'NOT_REQUIRED' });
    }

    const upiId = process.env.UPI_ID || 'university@upi';
    const upiName = process.env.UPI_NAME || 'University Name';
    const trackingId = request.trackingId || request._id.toString();
    const txnRef = `OCRS${trackingId.slice(-6).toUpperCase()}`;

    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      upiName
    )}&am=${fee}&cu=INR&tn=${encodeURIComponent(`OCRS-${trackingId}`)}&tr=${txnRef}`;

    const qrDataUrl = await QRCode.toDataURL(upiLink, { width: 400, margin: 2 });

    return res.json({
      amount: fee,
      upiLink,
      qrDataUrl,
      txnRef,
      status: 'PENDING',
    });
  } catch (err) {
    console.error('getPaymentDetails error:', err);
    return res.status(500).json({ error: 'Failed to generate payment info' });
  }
};

// POST /api/student/requests/:id/payment
exports.confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { upiTxnId } = req.body;

    if (!upiTxnId || !upiTxnId.trim()) {
      return res.status(400).json({ error: 'UPI Transaction ID is required' });
    }

    const request = await getRequestById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const certType = getCertificateTypeByName(request.certificateType);
    const trackingId = request.trackingId || request._id.toString();
    const year = new Date().getFullYear();
    const receiptNo = `RCPT/${year}/${trackingId.slice(-6).toUpperCase()}`;
    const paidAt = new Date();

    const payment = {
      amount: certType.fee,
      status: 'PAID',
      upiTxnId: upiTxnId.trim(),
      paidAt,
      receiptNo,
      method: 'UPI',
    };

    await updateRequest(id, {
      status: 'IN_REVIEW',
      payment,
      receiptNumber: receiptNo,
      feePaid: true,
      paymentMethod: 'UPI',
      paymentReference: upiTxnId.trim(),
    });

    // Generate receipt PDF
    let receiptFile = null;
    try {
      receiptFile = await generateReceiptPdf({
        receiptNo,
        studentName: request.studentName || 'Student',
        rollNo: request.rollNumber || '24881A12A1',
        department: request.department || 'Information Technology (IT)',
        certType: request.certificateType,
        amount: certType.fee,
        upiTxnId: upiTxnId.trim(),
        paidAt,
      });
    } catch (pdfErr) {
      console.error('Receipt PDF generation error:', pdfErr);
    }

    // Send email with receipt (fire-and-forget)
    if (receiptFile && request.studentEmail) {
      sendEmail(
        request.studentEmail,
        `[OCRS] Payment Receipt Confirmed: ${receiptNo}`,
        `Hello ${request.studentName},\n\nYour payment of ₹${certType.fee} for "${request.certificateType}" has been successfully recorded.\n\nReceipt Number: ${receiptNo}\nUPI Transaction ID: ${upiTxnId.trim()}\n\nYour request has progressed to Registrar Review.\n\nPlease find your official e-receipt attached.\n\nWarm regards,\nOffice of Academic Affairs & Certification Services`,
        [
          {
            filename: receiptFile.fileName,
            path: receiptFile.filePath,
          },
        ]
      ).catch((mailErr) => console.error('Receipt email dispatch error:', mailErr));
    }

    return res.json({ ok: true, receiptNo });
  } catch (err) {
    console.error('confirmPayment error:', err);
    return res.status(500).json({ error: 'Failed to process payment confirmation' });
  }
};

// GET /api/student/requests/:id/receipt
exports.downloadReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await getRequestById(id);

    if (!request || !request.receiptNumber) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const safeFileName = `${request.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    const filePath = path.join(__dirname, '..', 'uploads', 'receipts', safeFileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Receipt PDF file not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    return fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('downloadReceipt error:', err);
    return res.status(500).json({ error: 'Failed to download receipt' });
  }
};