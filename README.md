# Online Certificate Request System (OCRS)

A modern full-stack web application for automated student certificate requests, verified issuance with QR code validation, and Gmail OAuth2 notifications.

---

## How to Run the Application

### 1. Backend Server (Port 5000)
```bash
cd backend
npm run dev
```
- API Base URL: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

### 2. Frontend Web Application (Port 5173)
```bash
cd frontend
npm run dev
```
- Web Application: **[http://localhost:5173](http://localhost:5173)**

---

##  Features

- **Student Portal**:
  - View status of certificate applications with real-time badges (Pending, Approved, Rejected).
  - Apply for Bonafide, Study & Conduct, Medium of Instruction, Course Completion, and Transfer Certificates.
  - Interactive modal with purpose selection, urgency tier, and supporting document attachment.
  - View & print authorized certificates with AICTE gold seal, Dean's digital signature, and verification QR code.
  - One-click "Email to Me" to receive official status updates in your Gmail inbox.

- **Admin & Faculty Console**:
  - Live table of submitted applications with search and filters.
  - One-click **Approve & Issue** with automatic Gmail OAuth2 notification dispatch.
  - Rejection with review remarks.

- **Public Verification Portal**:
  - Instant online verification for employers, universities, and visa authorities by entering Certificate Number or scanning QR code.

- **Live OAuth2 Diagnostics**:
  - Direct "Test Email" tool in the header to verify Google OAuth2 email delivery anytime.
TEAM Members:
24881A1236 - Kona Varshit Ram
24881A12A1-  Mandhula Nikhitha
24881A12G4 - Mukiri Aparna
