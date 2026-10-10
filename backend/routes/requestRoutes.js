const express = require('express');
const router = express.Router();
const { sendEmail } = require('../emailService');

// Base route
router.get('/', (req, res) => {
  res.json({ message: 'Request routes module initialized', status: 'OK' });
});

// Email trigger for frontend integration (both Approval and Rejection with Refund Reminder)
router.post('/send-test-email', async (req, res) => {
  try {
    const { to, studentName, certificateType, status, rejectionReason, refundNotice } = req.body;
    const recipient = to || process.env.EMAIL_USER;
    const certName = certificateType || 'Bonafide Certificate';
    const name = studentName || 'Student';

    let subject = `[OCRS] Certificate Request Status: ${certName}`;
    let text = '';

    if (status === 'Rejected') {
      subject = `[OCRS] Update: ${certName} Application Rejected - Action Required`;
      text = `Hello ${name},\n\nYour application for "${certName}" has been reviewed by the Institutional Academic Controller.\n\nStatus: REJECTED\nReason for Rejection:\n"${rejectionReason || 'Document verification criteria not satisfied'}"\n\n${refundNotice ? `Payment Refund Reminder Notice:\n${refundNotice}\n\n` : ''}If you have questions or wish to rectify your submitted documents, please contact the Academic Affairs Helpdesk.\n\nWarm regards,\nOffice of Academic Affairs & Certification Services\nAutonomous Institute of Technology`;
    } else {
      subject = `[OCRS] Official Certificate Approved: ${certName}`;
      text = `Hello ${name},\n\nCongratulations! Your application for "${certName}" has been officially APPROVED and stamped with the AICTE institutional digital seal.\n\nTracking ID: CERT-${Date.now().toString().slice(-6)}\n\nYou can view and download your verified credential with high-resolution QR verification directly in the Student Portal.\n\nWarm regards,\nOffice of Academic Affairs & Certification Services\nAutonomous Institute of Technology`;
    }

    const result = await sendEmail(recipient, subject, text);
    res.json({
      success: true,
      message: `Notification sent to ${recipient}`,
      messageId: result.messageId,
    });
  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
