/**
 * Request Controller - Handles student certificate request operations and eligibility checks
 */
const store = require('../models/store');

/**
 * GET /api/certificate-types/eligible
 */
exports.getEligibleTypes = async (req, res) => {
  try {
    const rollNumber = (req.query.rollNumber || req.user?.rollNumber || '24881A12A1').trim().toUpperCase();
    const studentName = (req.query.studentName || req.user?.name || '').trim().toLowerCase();

    // MongoDB lo student requests fetch
    const studentRequests = await store.getRequestsByStudent(rollNumber);

    const types = store.CERTIFICATE_TYPES.map((type) => {
      const matching = studentRequests.filter((r) => {
        return (
          r.typeId === type.id ||
          (r.certificateType && r.certificateType.toLowerCase() === type.name.toLowerCase())
        );
      });

      const isRejected = matching.some((r) => (r.status || '').toUpperCase() === 'REJECTED');
      if (isRejected) {
        return { id: type.id, name: type.name, fee: type.fee, eligible: false, reason: 'previously_rejected' };
      }

      const isIssued = matching.some((r) => {
        const s = (r.status || '').toUpperCase();
        return s === 'ISSUED' || s === 'APPROVED';
      });
      if (isIssued) {
        return { id: type.id, name: type.name, fee: type.fee, eligible: false, reason: 'already_issued' };
      }

      const hasActive = matching.some((r) => {
        const s = (r.status || '').toUpperCase();
        return ['SUBMITTED', 'IN_REVIEW', 'PENDING'].includes(s);
      });
      if (hasActive) {
        return { id: type.id, name: type.name, fee: type.fee, eligible: false, reason: 'active_request' };
      }

      return { id: type.id, name: type.name, fee: type.fee, eligible: true, reason: null };
    });

    res.json(types);
  } catch (err) {
    console.error('getEligibleTypes error:', err);
    res.status(500).json({ error: 'Failed to fetch eligibility' });
  }
};

/**
 * POST /api/student/requests
 */
exports.createRequest = async (req, res) => {
  try {
    const {
      typeId,
      certificateType,
      studentName = 'Nikhitha Mandhula',
      rollNumber = '24881A12A1',
      department = 'Information Technology (IT)',
      academicYear = '2024-2026',
      studentEmail = 'nikhithamandhula18@gmail.com',
      purpose = 'Official Certification',
      urgency = 'Normal',
      notes = '',
    } = req.body;

    const certType = store.CERTIFICATE_TYPES.find(
      (c) => c.id === typeId || c.name.toLowerCase() === (certificateType || '').toLowerCase()
    ) || { id: typeId || 'custom', name: certificateType || 'Certificate', fee: 0 };

    const targetRoll = rollNumber.trim().toUpperCase();

    // MongoDB lo student requests fetch
    const studentRequests = await store.getRequestsByStudent(targetRoll);

    const matchingRequests = studentRequests.filter((r) => {
      return (
        r.typeId === certType.id ||
        (r.certificateType && r.certificateType.toLowerCase() === certType.name.toLowerCase())
      );
    });

    // Guard 1: Rejected
    const isRejected = matchingRequests.some((r) => (r.status || '').toUpperCase() === 'REJECTED');
    if (isRejected) {
      return res.status(400).json({
        error: 'This certificate request was rejected. Please contact the registrar office.',
      });
    }

    // Guard 2: Already issued
    const isIssued = matchingRequests.some((r) => {
      const s = (r.status || '').toUpperCase();
      return s === 'ISSUED' || s === 'APPROVED';
    });
    if (isIssued) {
      return res.status(400).json({ error: 'This certificate has already been issued.' });
    }

    // Guard 3: Active request
    const hasActive = matchingRequests.some((r) => {
      const s = (r.status || '').toUpperCase();
      return ['SUBMITTED', 'IN_REVIEW', 'PENDING'].includes(s);
    });
    if (hasActive) {
      return res.status(400).json({ error: 'You already have an active request.' });
    }

    // Create new request
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date();
    const newRequest = {
      trackingId: newId,
      certificateNumber: `OCRS-2026-${newId}`,
      typeId: certType.id,
      certificateType: certType.name,
      studentName,
      rollNumber,
      department,
      academicYear,
      studentEmail,
      purpose,
      urgency,
      notes,
      status: 'SUBMITTED',
      appliedDate: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      appliedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      appliedTimestamp: Date.now(),
      fee: certType.fee,
      payment: certType.fee > 0
        ? { amount: certType.fee, status: 'PENDING', method: 'UPI' }
        : null,
    };

    const saved = await store.addRequest(newRequest);

    res.status(201).json({
      ok: true,
      success: true,
      request: saved,
    });
  } catch (err) {
    console.error('createRequest error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
};