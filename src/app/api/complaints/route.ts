import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { ComplaintStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let complaints;

    if (payload.role === 'STUDENT') {
      // Find the student profile first
      const student = await prisma.student.findUnique({
        where: { userId: payload.userId },
      });
      if (!student) return NextResponse.json({ complaints: [] });

      complaints = await prisma.complaint.findMany({
        where: {
          collegeId: payload.collegeId,
          studentId: student.id,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(payload.role)) {
      // Admin/Principal/VP can read all complaints
      complaints = await prisma.complaint.findMany({
        where: { collegeId: payload.collegeId },
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              rollNumber: true,
              user: { select: { name: true } },
            },
          },
        },
      });

      // Anonymize if filed anonymously
      complaints = complaints.map((c) => {
        if (c.isAnonymous) {
          return {
            ...c,
            student: null, // Wipe student name details
            studentId: null,
          };
        }
        return c;
      });
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Fetch complaints error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, isAnonymous } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing title or description' }, { status: 400 });
    }

    let studentId: string | null = null;

    // Get student profile if role is STUDENT
    if (payload.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: payload.userId },
      });
      if (student) {
        studentId = student.id;
      }
    }

    const complaint = await prisma.complaint.create({
      data: {
        collegeId: payload.collegeId,
        title,
        description,
        isAnonymous: !!isAnonymous,
        studentId,
        status: ComplaintStatus.OPEN,
      },
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('File complaint error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, responseContent, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing complaint ID' }, { status: 400 });
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        status: status || ComplaintStatus.RESOLVED,
        responseContent,
        resolvedById: payload.userId,
      },
    });

    return NextResponse.json({ success: true, complaint: updatedComplaint });
  } catch (error) {
    console.error('Resolve complaint error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
