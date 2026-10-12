import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export function getEmailTransporter(customCredentials?: {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
}) {
  const host = customCredentials?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(customCredentials?.port || process.env.SMTP_PORT || 587);
  const user = customCredentials?.user || process.env.SMTP_USER || process.env.DEMO_WORK_EMAIL || 'admin@seranking.com';
  // Use the user's provided App Password (spaces stripped or kept)
  const pass = customCredentials?.pass || process.env.SMTP_PASS || 'lnrkdpgwszfxlvuw';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: pass.replace(/\s+/g, ''),
    },
  });
}

export async function sendEmail(options: SendEmailOptions) {
  const transporter = getEmailTransporter();
  const from = options.from || process.env.SMTP_FROM || 'SE Ranking Studio <no-reply@seranking.com>';

  return transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  });
}
