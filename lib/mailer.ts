import nodemailer from "nodemailer";

export interface SendReceiptEmailParams {
  to: string;
  studentName: string;
  certType: string;
  receiptNo: string;
  amount: number;
  pdfBuffer: Buffer;
}

export function createMailerTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendReceiptEmail(
  params: SendReceiptEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, studentName, certType, receiptNo, amount, pdfBuffer } = params;

  try {
    const transporter = createMailerTransport();
    const mailFrom =
      process.env.MAIL_FROM ||
      `"OCRS University" <${process.env.SMTP_USER || "ocrs.university@gmail.com"}>`;

    const html = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px;">
        <h2 style="color: #1e40af;">Official Payment Confirmation</h2>
        <p>Dear ${studentName},</p>
        <p>Your payment of <b>₹${amount}</b> for <b>${certType}</b> has been received.</p>
        <p>Receipt No: <b>${receiptNo}</b></p>
        <p>Please find your receipt attached. You can also download it anytime from your OCRS dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 0.9em; color: #64748b;">
          Regards,<br/>
          <b>Registrar Office</b><br/>
          Online Certificate Request System (OCRS)
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: mailFrom,
      to,
      subject: `Payment Receipt — ${certType} (${receiptNo})`,
      html,
      attachments: [
        {
          filename: `${receiptNo}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[Mailer] Failed to send receipt email:", err?.message || err);
    return { success: false, error: err?.message || "Email delivery failed" };
  }
}
