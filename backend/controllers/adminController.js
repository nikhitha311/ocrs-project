const store = require('../models/store');
const { sendEmail } = require('../emailService');

exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundNotice } = req.body;

    const targetRequest = await store.getRequestById(id);
    if (!targetRequest) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const updated = await store.updateRequest(id, {
      status: 'Rejected',
      rejectionReason: reason || 'Document verification criteria not satisfied',
      refundNotice: refundNotice || (targetRequest.feePaid ? `Full refund of ${targetRequest.fee} initiated.` : null),
      dateRejected: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    });

    // Notify student via email
    try {
      const recipient = targetRequest.studentEmail || process.env.EMAIL_USER;
      if (recipient) {
        const certName = targetRequest.certificateType || 'Certificate';
        const subject = `[OCRS] Update: ${certName} Application Rejected - Action Required`;
        const text = `Hello ${targetRequest.studentName || 'Student'},\n\nYour application for "${certName}" (Tracking ID: ${targetRequest.certificateNumber || id}) has been reviewed by the Institutional Academic Controller.\n\nStatus: REJECTED\nReason for Rejection:\n"${reason}"\n\n${refundNotice ? `Payment Refund Notice:\n${refundNotice}\n\n` : ''}Warm regards,\nOffice of Academic Affairs & Certification Services\nAutonomous Institute of Technology`;
        await sendEmail(recipient, subject, text);
      }
    } catch (mailErr) {
      console.warn('Rejection email delivery notice:', mailErr.message);
    }

    return res.json({
      success: true,
      message: 'Request rejected · Student notified',
      request: updated,
    });
  } catch (err) {
    console.error('Admin reject error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};