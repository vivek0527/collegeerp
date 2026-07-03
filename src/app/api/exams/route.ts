import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode'); // 'schedule' | 'seatplan' | 'results'
    const studentIdParam = searchParams.get('studentId');
    const examId = searchParams.get('examId');

    let studentId = studentIdParam;

    // Student role defaults to their own profile
    if (payload.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: payload.userId },
      });
      if (student) studentId = student.id;
    } else if (payload.role === 'PARENT') {
      if (!studentIdParam) {
        const parent = await prisma.parent.findUnique({
          where: { userId: payload.userId },
          include: { students: true },
        });
        if (parent && parent.students.length > 0) {
          studentId = parent.students[0].id;
        }
      }
    }

    // 1. Return exam schedules (available to all)
    if (mode === 'schedule') {
      const exams = await prisma.exam.findMany({
        where: { collegeId: payload.collegeId },
        orderBy: { startDateAD: 'desc' },
      });
      return NextResponse.json({ exams });
    }

    // 2. Return seat planning
    if (mode === 'seatplan') {
      if (!studentId) {
        return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
      }
      const seats = await prisma.examSeat.findMany({
        where: {
          studentId: studentId,
          ...(examId && { examId }),
        },
        include: {
          exam: true,
        },
      });
      return NextResponse.json({ seats });
    }

    // 3. Return results/grades
    if (mode === 'results') {
      if (!studentId) {
        return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
      }
      const results = await prisma.result.findMany({
        where: {
          collegeId: payload.collegeId,
          studentId: studentId,
          ...(examId && { examId }),
        },
        include: {
          exam: true,
          subject: true,
        },
      });
      return NextResponse.json({ results });
    }

    // Return general exam lists for admins/teachers
    const exams = await prisma.exam.findMany({
      where: { collegeId: payload.collegeId },
      orderBy: { startDateAD: 'desc' },
    });
    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Fetch exams error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action } = await request.json(); // 'createExam' | 'enterResult' | 'createSeatPlan'

    // Create New Exam Event (Exam Dept / Admin)
    if (action === 'createExam') {
      if (!['ADMIN', 'EXAM_DEPT', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(payload.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const { name, type, startDateAD, startDateBS, endDateAD, endDateBS } = await request.json();

      const exam = await prisma.exam.create({
        data: {
          collegeId: payload.collegeId,
          name,
          type,
          startDateAD: new Date(startDateAD),
          startDateBS,
          endDateAD: new Date(endDateAD),
          endDateBS,
        },
      });
      return NextResponse.json({ success: true, exam });
    }

    // Enter Student Marks (Teacher / Exam Dept / Admin)
    if (action === 'enterResult') {
      if (!['ADMIN', 'EXAM_DEPT', 'TEACHER'].includes(payload.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const { studentId, examId, subjectId, marksObtained, totalMarks, passMarks, remarks } = await request.json();

      // Simple grading formula
      const pct = (marksObtained / totalMarks) * 100;
      let grade = 'F';
      if (marksObtained >= passMarks) {
        if (pct >= 90) grade = 'A+';
        else if (pct >= 80) grade = 'A';
        else if (pct >= 70) grade = 'B+';
        else if (pct >= 60) grade = 'B';
        else if (pct >= 50) grade = 'C+';
        else if (pct >= 40) grade = 'C';
      }

      const result = await prisma.result.create({
        data: {
          collegeId: payload.collegeId,
          studentId,
          examId,
          subjectId,
          marksObtained: parseFloat(marksObtained),
          totalMarks: parseFloat(totalMarks),
          passMarks: parseFloat(passMarks),
          grade,
          remarks,
        },
      });
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });
  } catch (error) {
    console.error('Exam operation error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
