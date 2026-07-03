import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { AttendanceStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('studentId');
    const classIdParam = searchParams.get('classId');
    const subjectIdParam = searchParams.get('subjectId');

    let studentId = studentIdParam;

    // Standard student dashboard requests their own records
    if (payload.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: payload.userId },
      });
      if (!student) return NextResponse.json({ attendance: [] });
      studentId = student.id;
    } else if (payload.role === 'PARENT') {
      // Parents can view their student records
      if (!studentIdParam) {
        const parent = await prisma.parent.findUnique({
          where: { userId: payload.userId },
          include: { students: true },
        });
        if (!parent || parent.students.length === 0) {
          return NextResponse.json({ attendance: [] });
        }
        studentId = parent.students[0].id; // Fallback to first child
      }
    }

    if (studentId) {
      // Query specific student attendance logs
      const attendance = await prisma.attendance.findMany({
        where: {
          collegeId: payload.collegeId,
          studentId,
          ...(subjectIdParam && { subjectId: subjectIdParam }),
        },
        include: {
          subject: true,
          markedBy: { select: { name: true } },
        },
        orderBy: { dateAD: 'desc' },
      });

      // Calculate statistics
      const total = attendance.length;
      const present = attendance.filter((a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

      return NextResponse.json({ attendance, stats: { total, present, percentage } });
    }

    // For Teachers / VP / Principal viewing by Class / Subject
    if (['TEACHER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN'].includes(payload.role)) {
      if (!classIdParam) {
        return NextResponse.json({ error: 'Missing classId parameters' }, { status: 400 });
      }

      const attendance = await prisma.attendance.findMany({
        where: {
          collegeId: payload.collegeId,
          student: { classId: classIdParam },
          ...(subjectIdParam && { subjectId: subjectIdParam }),
        },
        include: {
          student: {
            include: { user: { select: { name: true } } },
          },
          subject: true,
        },
        orderBy: { dateAD: 'desc' },
      });

      return NextResponse.json({ attendance });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['TEACHER', 'VICE_PRINCIPAL', 'PRINCIPAL', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { classId, subjectId, dateAD, dateBS, attendanceList } = await request.json();

    if (!classId || !dateAD || !dateBS || !attendanceList || !Array.isArray(attendanceList)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const parsedDate = new Date(dateAD);

    // Save attendance transactions
    const queries = attendanceList.map((record: { studentId: string; status: AttendanceStatus; remarks?: string }) => {
      return prisma.attendance.create({
        data: {
          collegeId: payload.collegeId,
          studentId: record.studentId,
          subjectId: subjectId || null,
          dateAD: parsedDate,
          dateBS: dateBS,
          status: record.status,
          remarks: record.remarks || '',
          markedById: payload.userId,
        },
      });
    });

    await prisma.$transaction(queries);

    // Write audit log
    await prisma.auditLog.create({
      data: {
        collegeId: payload.collegeId,
        userId: payload.userId,
        action: 'MARK_ATTENDANCE',
        details: `Marked attendance for class: ${classId}, date: ${dateBS}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Attendance records registered successfully' });
  } catch (error) {
    console.error('Submit attendance error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
