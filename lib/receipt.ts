import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface ReceiptPdfProps {
  receiptNo: string;
  studentName: string;
  rollNo: string;
  department: string;
  certType: string;
  amount: number;
  method: string;
  upiTxnId?: string | null;
  paidAt: Date | string;
  universityName?: string;
}

export async function generateReceiptPdf(
  props: ReceiptPdfProps
): Promise<Buffer> {
  const {
    receiptNo,
    studentName,
    rollNo,
    department,
    certType,
    amount,
    method,
    upiTxnId,
    paidAt,
    universityName,
  } = props;

  // A4 Portrait: 595.0 x 842.0 points
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const primaryBlue = rgb(0.12, 0.35, 0.75);
  const darkSlate = rgb(0.12, 0.16, 0.22);
  const mutedText = rgb(0.4, 0.45, 0.55);
  const cardBg = rgb(0.96, 0.97, 0.99);
  const cardBorder = rgb(0.85, 0.88, 0.94);

  // Top blue banner band
  page.drawRectangle({
    x: 0,
    y: 762,
    width: 595,
    height: 80,
    color: primaryBlue,
  });

  const univ = (
    universityName ||
    process.env.UPI_NAME ||
    "UNIVERSITY OF TECHNOLOGY"
  ).toUpperCase();
  const univWidth = helveticaBold.widthOfTextAtSize(univ, 20);
  page.drawText(univ, {
    x: (595 - univWidth) / 2,
    y: 795,
    size: 20,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  // "PAYMENT RECEIPT" title 16pt
  const title = "OFFICIAL PAYMENT RECEIPT";
  const titleWidth = helveticaBold.widthOfTextAtSize(title, 16);
  page.drawText(title, {
    x: (595 - titleWidth) / 2,
    y: 720,
    size: 16,
    font: helveticaBold,
    color: darkSlate,
  });

  // Divider
  page.drawLine({
    start: { x: 50, y: 700 },
    end: { x: 545, y: 700 },
    thickness: 1,
    color: cardBorder,
  });

  const dateObj = paidAt instanceof Date ? paidAt : new Date(paidAt);
  const dateStr = dateObj.toDateString();

  // Two-column info table card
  page.drawRectangle({
    x: 50,
    y: 470,
    width: 495,
    height: 205,
    color: cardBg,
    borderColor: cardBorder,
    borderWidth: 1,
  });

  // Column 1 (x: 75), Column 2 (x: 325)
  const rows = [
    {
      c1Label: "Receipt No:",
      c1Val: receiptNo,
      c2Label: "Date:",
      c2Val: dateStr,
    },
    {
      c1Label: "Student Name:",
      c1Val: studentName,
      c2Label: "Roll No:",
      c2Val: rollNo,
    },
    {
      c1Label: "Department:",
      c1Val: department,
      c2Label: "Certificate:",
      c2Val: certType,
    },
    {
      c1Label: "Payment Method:",
      c1Val: method || "UPI",
      c2Label: "Transaction ID:",
      c2Val: upiTxnId || "—",
    },
  ];

  let currentY = 635;
  for (const row of rows) {
    // Col 1 label
    page.drawText(row.c1Label, {
      x: 70,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: mutedText,
    });
    // Col 1 value
    page.drawText(row.c1Val || "—", {
      x: 70,
      y: currentY - 14,
      size: 11,
      font: helveticaBold,
      color: darkSlate,
    });

    // Col 2 label
    page.drawText(row.c2Label, {
      x: 320,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: mutedText,
    });
    // Col 2 value
    page.drawText(row.c2Val || "—", {
      x: 320,
      y: currentY - 14,
      size: 11,
      font: helveticaBold,
      color: darkSlate,
    });

    currentY -= 45;
  }

  // Amount box: "Amount Paid: Rs. {amount}" — 24pt bold, boxed
  const amountBoxY = 360;
  page.drawRectangle({
    x: 50,
    y: amountBoxY,
    width: 495,
    height: 75,
    color: rgb(0.93, 0.96, 1.0),
    borderColor: primaryBlue,
    borderWidth: 1.5,
  });

  const amountLabel = `Amount Paid: Rs. ${amount}`;
  const amountWidth = helveticaBold.widthOfTextAtSize(amountLabel, 22);
  page.drawText(amountLabel, {
    x: (595 - amountWidth) / 2,
    y: amountBoxY + 32,
    size: 22,
    font: helveticaBold,
    color: primaryBlue,
  });

  const statusSub = "STATUS: SUCCESSFUL / CLEARED";
  const statusWidth = helvetica.widthOfTextAtSize(statusSub, 10);
  page.drawText(statusSub, {
    x: (595 - statusWidth) / 2,
    y: amountBoxY + 14,
    size: 10,
    font: helvetica,
    color: rgb(0.15, 0.6, 0.3),
  });

  // Footer: "This is a computer-generated receipt. No signature required."
  const footer1 =
    "This is a computer-generated receipt. No signature required.";
  const f1Width = helvetica.widthOfTextAtSize(footer1, 10);
  page.drawText(footer1, {
    x: (595 - f1Width) / 2,
    y: 110,
    size: 10,
    font: helvetica,
    color: mutedText,
  });

  // Footer below: "Verify at {BASE_URL}/verify"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const footer2 = `Verify at ${baseUrl}/verify`;
  const f2Width = helvetica.widthOfTextAtSize(footer2, 10);
  page.drawText(footer2, {
    x: (595 - f2Width) / 2,
    y: 90,
    size: 10,
    font: helveticaBold,
    color: primaryBlue,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
