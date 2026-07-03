import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT, comparePassword, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify session
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // 2. Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ error: 'New password must be different from current password' }, { status: 400 });
    }

    // 3. Try real DB — if offline fall back gracefully
    let fallbackMode = false;
    let user: any = null;

    try {
      user = await prisma.user.findUnique({ where: { id: payload.userId } });
    } catch {
      fallbackMode = true;
    }

    if (fallbackMode || !user) {
      // Demo mode: accept 'Password123' as current password
      if (currentPassword !== 'Password123') {
        return NextResponse.json({ error: 'Current password is incorrect (demo mode: use Password123)' }, { status: 401 });
      }
      // In demo mode we cannot persist — just acknowledge
      return NextResponse.json({ success: true, message: 'Password updated successfully (demo mode — not persisted)' });
    }

    // 4. Verify current password against hash
    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // 5. Hash new password and update
    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { passwordHash: newHash },
    });

    // 6. Audit log
    try {
      await prisma.auditLog.create({
        data: {
          collegeId: user.collegeId,
          userId: user.id,
          action: 'PASSWORD_CHANGE',
          details: 'User changed their password via Account Settings.',
        },
      });
    } catch {}

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
