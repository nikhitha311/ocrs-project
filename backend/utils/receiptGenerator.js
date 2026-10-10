const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Generate official Receipt PDF using Puppeteer and save to backend/uploads/receipts/
 */
async function generateReceiptPdf({
  receiptNo,
  studentName,
  rollNo,
  department,
  certType,
  amount,
  upiTxnId,
  paidAt,
  universityName = process.env.UPI_NAME || 'University Name',
}) {
  const receiptsDir = path.join(__dirname, '..', 'uploads', 'receipts');
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const safeFileName = `${receiptNo.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  const filePath = path.join(receiptsDir, safeFileName);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { margin: 0; color: #1e1b4b; font-size: 24px; letter-spacing: 0.5px; }
        .header h2 { margin: 6px 0 0; color: #4338ca; font-size: 16px; font-weight: 600; }
        .badge { display: inline-block; background: #ecfdf5; color: #047857; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid #a7f3d0; margin-top: 8px; }
        .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .details-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .label { font-weight: 600; color: #64748b; width: 40%; }
        .val { font-weight: 700; color: #0f172a; }
        .amount-box { margin-top: 30px; background: #f8fafc; border: 2px dashed #6366f1; border-radius: 12px; padding: 18px; text-align: center; }
        .amount-box .title { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .amount-box .num { font-size: 28px; font-weight: 900; color: #10b981; margin-top: 4px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${universityName.toUpperCase()}</h1>
        <h2>OFFICIAL PAYMENT RECEIPT</h2>
        <span class="badge">PAYMENT CONFIRMED (UPI)</span>
      </div>

      <table class="details-table">
        <tr>
          <td class="label">Receipt Number:</td>
          <td class="val">${receiptNo}</td>
        </tr>
        <tr>
          <td class="label">Date & Time:</td>
          <td class="val">${new Date(paidAt).toLocaleString()}</td>
        </tr>
        <tr>
          <td class="label">Student Name:</td>
          <td class="val">${studentName}</td>
        </tr>
        <tr>
          <td class="label">Roll Number:</td>
          <td class="val">${rollNo}</td>
        </tr>
        <tr>
          <td class="label">Department:</td>
          <td class="val">${department}</td>
        </tr>
        <tr>
          <td class="label">Certificate Requested:</td>
          <td class="val">${certType}</td>
        </tr>
        <tr>
          <td class="label">Payment Mode:</td>
          <td class="val">UPI</td>
        </tr>
        <tr>
          <td class="label">UPI Transaction ID:</td>
          <td class="val" style="font-family: monospace;">${upiTxnId}</td>
        </tr>
      </table>

      <div class="amount-box">
        <div class="title">Total Amount Paid</div>
        <div class="num">₹${amount}</div>
      </div>

      <div class="footer">
        Computer-generated receipt. No physical signature required.<br />
        Office of the Academic Registrar & Student Finance
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: filePath, format: 'A4', printBackground: true });
  await browser.close();

  return { filePath, fileName: safeFileName };
}

module.exports = { generateReceiptPdf };
