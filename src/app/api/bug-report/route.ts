import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bug_name, bug_email, bug_url, bug_comments, attachment_name } = body;

    if (!bug_comments || !bug_comments.trim()) {
      return NextResponse.json(
        { errors: ['The comments text is required.'] },
        { status: 400 }
      );
    }

    // Process bug report
    const reportData = {
      id: `BUG-${Date.now()}`,
      name: bug_name || 'Suraj',
      email: bug_email || 'suraj.vishwakarma@gvilab.com',
      url: bug_url || 'https://online.seranking.com/admin.dashboard.html',
      comments: bug_comments.trim(),
      attachment: attachment_name || null,
      created_at: new Date().toISOString(),
      status: 'received',
      account_id: 5269343,
    };

    return NextResponse.json({
      success: true,
      message: 'Message sent',
      report: reportData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { errors: ['Failed to submit report. Please try again.'] },
      { status: 500 }
    );
  }
}
