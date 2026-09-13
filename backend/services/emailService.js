const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

async function sendNotificationEmail({ to, title, message }) {
  const mailer = getTransporter();
  if (!mailer) return { sent: false, reason: 'SMTP is not configured.' };
  if (!to) throw new Error('Notification email recipient is missing.');
  await mailer.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: title,
    text: message,
  });
  return { sent: true };
}

module.exports = { sendNotificationEmail };
