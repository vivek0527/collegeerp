import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

// Fetch current college settings
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const college = await prisma.college.findUnique({
      where: { id: payload.collegeId },
      select: {
        id: true,
        name: true,
        code: true,
        datePreference: true,
        timezone: true,
      },
    });

    return NextResponse.json({ college });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// Update college settings (restricted to Admin/Principal/VP)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { datePreference, timezone } = await request.json();

    if (datePreference && !['AD', 'BS'].includes(datePreference)) {
      return NextResponse.json({ error: 'Invalid date preference. Must be AD or BS' }, { status: 400 });
    }

    const updatedCollege = await prisma.college.update({
      where: { id: payload.collegeId },
      data: {
        ...(datePreference && { datePreference }),
        ...(timezone && { timezone }),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        collegeId: payload.collegeId,
        userId: payload.userId,
        action: 'UPDATE_SETTINGS',
        details: `Updated date format to: ${datePreference}, timezone to: ${timezone}`,
      },
    });

    return NextResponse.json({
      success: true,
      college: {
        id: updatedCollege.id,
        name: updatedCollege.name,
        datePreference: updatedCollege.datePreference,
        timezone: updatedCollege.timezone,
      },
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
