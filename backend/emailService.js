require("dotenv").config();
const nodemailer = require("nodemailer");

// Lazy transporter — only create when needed
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  try {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
      tls: {
        rejectUnauthorized: true,
      },
      // Prevent long hangs
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
    return transporter;
  } catch (err) {
    console.warn("⚠️  SMTP transporter init failed:", err.message);
    return null;
  }
}

async function sendEmail(to, subject, text, attachments = []) {
  const t = getTransporter();
  if (!t) {
    console.warn("⚠️  Email skipped (no transporter)");
    return { ok: false, skipped: true };
  }

  try {
    const info = await t.sendMail({
      from: `"OCRS University" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      attachments,
    });
    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (err) {
    // Do NOT throw — email failure should never crash the server
    console.warn("⚠️  Email failed (non-fatal):", err.message);
    return { ok: false, error: err.message };
  }
}

// Export getter so other files can use `transporter` if they need it
module.exports = {
  sendEmail,
  get transporter() {
    return getTransporter();
  },
};

// Optional: verify SMTP connection ONCE at startup — but NEVER crash on failure
setTimeout(() => {
  const t = getTransporter();
  if (!t) return;
  t.verify()
    .then(() => console.log("✅ SMTP OAuth authentication successful!"))
    .catch((err) => console.warn("⚠️  SMTP verify failed (non-fatal):", err.message));
}, 2000);