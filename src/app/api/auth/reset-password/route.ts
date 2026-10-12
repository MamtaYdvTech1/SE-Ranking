import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ResetPasswordSchema } from '@/lib/validation/schemas';
import { verifyPasswordResetToken } from '@/lib/server/password-reset';
import { hashPassword } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate body with Zod
    const validation = ResetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Please provide a valid password.' },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Verify token cryptographically
    const tokenResult = await verifyPasswordResetToken(token);
    if (!tokenResult.valid || !tokenResult.userId) {
      return NextResponse.json(
        { error: tokenResult.error || 'Invalid or expired password reset link.' },
        { status: 400 }
      );
    }

    // Hash new password using scrypt with random salt
    const newPasswordHash = hashPassword(password);

    // Update password in database
    await prisma.user.update({
      where: { id: tokenResult.userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    // Invalidate any existing sessions for this user for security
    await prisma.session.deleteMany({
      where: { userId: tokenResult.userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.',
    });
  } catch (err: any) {
    console.error('Error in POST /api/auth/reset-password:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
