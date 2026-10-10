import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export interface CertificatePdfProps {
  studentName: string;
  rollNo: string;
  department: string;
  program: string;
  certType: string;
  serialNo: string;
  issuedAt: Date | string;
  qrUrl: string;
}

export async function generateCertificatePdf(
  props: CertificatePdfProps
): Promise<Buffer> {
  const {
    studentName,
    rollNo,
    department,
    program,
    certType,
    serialNo,
    issuedAt,
    qrUrl,
  } = props;

  // A4 Landscape: 842.0 x 595.0 points
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Border: Deep blue primary border
  const primaryBlue = rgb(0.12, 0.35, 0.75);
  const goldAccent = rgb(0.78, 0.65, 0.28);
  const darkSlate = rgb(0.15, 0.2, 0.28);
  const mutedText = rgb(0.35, 0.4, 0.48);

  // Outer blue rectangle
  page.drawRectangle({
    x: 24,
    y: 24,
    width: 842 - 48,
    height: 595 - 48,
    borderColor: primaryBlue,
    borderWidth: 3.5,
  });

  // Inner subtle gold/blue decorative border
  page.drawRectangle({
    x: 32,
    y: 32,
    width: 842 - 64,
    height: 595 - 64,
    borderColor: goldAccent,
    borderWidth: 1,
  });

  const univName = (process.env.UPI_NAME || "UNIVERSITY OF TECHNOLOGY").toUpperCase();

  // "UNIVERSITY NAME" bold blue title
  const univTitleWidth = helveticaBold.widthOfTextAtSize(univName, 26);
  page.drawText(univName, {
    x: (842 - univTitleWidth) / 2,
    y: 510,
    size: 26,
    font: helveticaBold,
    color: primaryBlue,
  });

  // Decorative sub-header
  const subHeader = "OFFICIAL DIGITAL ACADEMIC CREDENTIAL";
  const subWidth = helvetica.widthOfTextAtSize(subHeader, 10);
  page.drawText(subHeader, {
    x: (842 - subWidth) / 2,
    y: 490,
    size: 10,
    font: helvetica,
    color: mutedText,
  });

  // Certificate Type uppercase
  const certTitle = (certType || "CERTIFICATE").toUpperCase();
  const certWidth = helveticaBold.widthOfTextAtSize(certTitle, 20);
  page.drawText(certTitle, {
    x: (842 - certWidth) / 2,
    y: 440,
    size: 20,
    font: helveticaBold,
    color: darkSlate,
  });

  // Divider line under title
  page.drawLine({
    start: { x: (842 - certWidth) / 2 - 20, y: 430 },
    end: { x: (842 + certWidth) / 2 + 20, y: 430 },
    thickness: 1.5,
    color: goldAccent,
  });

  // "This is to certify that"
  const preamble = "This is to certify that";
  const preWidth = helveticaOblique.widthOfTextAtSize(preamble, 15);
  page.drawText(preamble, {
    x: (842 - preWidth) / 2,
    y: 380,
    size: 15,
    font: helveticaOblique,
    color: mutedText,
  });

  // Student name (28pt bold)
  const nameWidth = helveticaBold.widthOfTextAtSize(studentName, 28);
  page.drawText(studentName, {
    x: (842 - nameWidth) / 2,
    y: 330,
    size: 28,
    font: helveticaBold,
    color: primaryBlue,
  });

  // Roll / Program / Department line
  const detailsLine = `Roll No: ${rollNo}   |   Program: ${program || "B.Tech"}   |   Department: ${department}`;
  const detailsWidth = helvetica.widthOfTextAtSize(detailsLine, 14);
  page.drawText(detailsLine, {
    x: (842 - detailsWidth) / 2,
    y: 285,
    size: 14,
    font: helvetica,
    color: darkSlate,
  });

  // "is a bonafide student of this university."
  const affirmation = "is a bonafide student of this university.";
  const affWidth = helvetica.widthOfTextAtSize(affirmation, 14);
  page.drawText(affirmation, {
    x: (842 - affWidth) / 2,
    y: 245,
    size: 14,
    font: helvetica,
    color: darkSlate,
  });

  // Serial + Issued date bottom-left
  const dateStr =
    issuedAt instanceof Date
      ? issuedAt.toDateString()
      : new Date(issuedAt).toDateString();

  page.drawText(`Serial No: ${serialNo}`, {
    x: 60,
    y: 110,
    size: 11,
    font: helveticaBold,
    color: darkSlate,
  });

  page.drawText(`Date of Issue: ${dateStr}`, {
    x: 60,
    y: 92,
    size: 11,
    font: helvetica,
    color: mutedText,
  });

  page.drawText("Office of Academic Affairs & Registrar", {
    x: 60,
    y: 74,
    size: 10,
    font: helvetica,
    color: mutedText,
  });

  // Generate QR code PNG buffer
  const qrPngBuffer = await QRCode.toBuffer(qrUrl, {
    width: 100,
    margin: 1,
    errorCorrectionLevel: "M",
  });
  const qrImage = await pdfDoc.embedPng(qrPngBuffer);

  // QR (100x100) bottom-right
  const qrX = 842 - 60 - 100;
  const qrY = 65;
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: 100,
    height: 100,
  });

  // "Scan to verify" caption
  const caption = "Scan to verify";
  const capWidth = helvetica.widthOfTextAtSize(caption, 9);
  page.drawText(caption, {
    x: qrX + (100 - capWidth) / 2,
    y: qrY - 14,
    size: 9,
    font: helvetica,
    color: mutedText,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
