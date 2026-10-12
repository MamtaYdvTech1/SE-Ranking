import { NextRequest, NextResponse } from 'next/server';
import { getEmailTransporter, sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const testRecipient = body.to || process.env.DEMO_WORK_EMAIL || 'admin@seranking.com';

    // Verify SMTP connection
    const transporter = getEmailTransporter({
      host: body.host,
      port: body.port ? Number(body.port) : undefined,
      user: body.user,
      pass: body.pass,
    });
    
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      console.warn('SMTP verification note:', verifyError.message);
      // Return details
      return NextResponse.json({
        success: false,
        message: `SMTP Connection note: ${verifyError.message || 'Unable to authenticate with SMTP server'}. Please check if the Google account username is configured.`,
        appPasswordStatus: 'Loaded and configured (lnrk dpgw szfx lvuw)',
      });
    }

    // Send sample test email
    await sendEmail({
      to: testRecipient,
      subject: 'SE Ranking - Custom SMTP Test Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; rounded: 8px;">
          <h2 style="color: #0B69FF; margin-bottom: 12px;">SE Ranking Custom SMTP Active</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Your custom SMTP outgoing mail server has been successfully configured with your Google App Password.
          </p>
          <div style="background: #F8FAFC; padding: 14px; border-radius: 6px; font-size: 13px; color: #475569; margin: 16px 0;">
            <strong>Configuration Details:</strong><br />
            • SMTP Host: <code>smtp.gmail.com:587</code><br />
            • Security: STARTTLS<br />
            • App Password: <code>lnrk **** **** lvuw</code> (Active)
          </div>
          <p style="color: #64748B; font-size: 12px; margin-top: 24px;">
            Sent automatically by SE Ranking White Label Report Dispatcher.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testRecipient} via SMTP successfully!`,
      appPasswordStatus: 'Active and verified',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to send test email',
      },
      { status: 500 }
    );
  }
}
