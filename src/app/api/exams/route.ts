import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { AuditEngine } from '@/lib/auditEngine';

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

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    let studentId = studentIdParam;

    if (isDbOnline) {
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
    } else {
      // Offline fallback mode
      // Mock Exam Sessions list
      const mockExams = [
        {
          id: 'mock-exam-1',
          name: 'First Term Examination 2083',
          type: 'TERMINAL',
          startDateAD: new Date('2026-07-15').toISOString(),
          startDateBS: '2083-04-01',
          endDateAD: new Date('2026-07-22').toISOString(),
          endDateBS: '2083-04-08',
        },
        {
          id: 'mock-exam-2',
          name: 'Second Term Examination 2083',
          type: 'TERMINAL',
          startDateAD: new Date('2026-11-10').toISOString(),
          startDateBS: '2083-07-25',
          endDateAD: new Date('2026-11-17').toISOString(),
          endDateBS: '2083-08-02',
        }
      ];

      if (mode === 'schedule') {
        return NextResponse.json({ exams: mockExams });
      }

      if (mode === 'seatplan') {
        const mockSeats = [
          {
            id: 'mock-seat-1',
            examId: 'mock-exam-1',
            studentId: studentId || 'mock-student-profile-id',
            roomNumber: 'Room 302 - Block B (3rd Floor)',
            benchNumber: 'B-12',
            rollNumberInExam: 'EX-11012',
            exam: mockExams[0]
          }
        ];
        return NextResponse.json({ seats: mockSeats });
      }

      if (mode === 'results') {
        const mockResults = [
          {
            id: 'mock-res-1',
            marksObtained: 84.5,
            totalMarks: 100.0,
            passMarks: 40.0,
            grade: 'A',
            remarks: 'Excellent mathematical analytical skills.',
            createdAt: new Date('2026-07-23').toISOString(),
            exam: mockExams[0],
            subject: {
              id: 'mock-subject-1',
              name: 'Mathematics',
              code: 'MTH-111'
            }
          },
          {
            id: 'mock-res-2',
            marksObtained: 72.0,
            totalMarks: 100.0,
            passMarks: 40.0,
            grade: 'B+',
            remarks: 'Good performance, keep practicing.',
            createdAt: new Date('2026-07-23').toISOString(),
            exam: mockExams[0],
            subject: {
              id: 'mock-subject-2',
              name: 'Physics',
              code: 'PHY-112'
            }
          },
          {
            id: 'mock-res-3',
            marksObtained: 91.0,
            totalMarks: 100.0,
            passMarks: 40.0,
            grade: 'A+',
            remarks: 'Outstanding concepts in Organic Chemistry.',
            createdAt: new Date('2026-07-23').toISOString(),
            exam: mockExams[0],
            subject: {
              id: 'mock-subject-3',
              name: 'Chemistry',
              code: 'CHM-113'
            }
          },
          {
            id: 'mock-res-4',
            marksObtained: 80.0,
            totalMarks: 100.0,
            passMarks: 40.0,
            grade: 'A',
            remarks: 'Great reading comprehension skills.',
            createdAt: new Date('2026-11-18').toISOString(),
            exam: mockExams[1],
            subject: {
              id: 'mock-subject-1',
              name: 'Mathematics',
              code: 'MTH-111'
            }
          },
          {
            id: 'mock-res-5',
            marksObtained: 85.0,
            totalMarks: 100.0,
            passMarks: 40.0,
            grade: 'A',
            remarks: 'Strong mechanics foundation.',
            createdAt: new Date('2026-11-18').toISOString(),
            exam: mockExams[1],
            subject: {
              id: 'mock-subject-2',
              name: 'Physics',
              code: 'PHY-112'
            }
          }
        ];
        return NextResponse.json({ results: mockResults });
      }

      return NextResponse.json({ exams: mockExams });
    }
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
      const { action, name, type, startDateAD, startDateBS, endDateAD, endDateBS } = await request.json();

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

      await AuditEngine.recordEvent({
        moduleName: 'EXAM',
        entityType: 'EXAM_SESSION',
        entityId: exam.id,
        createdBy: payload.name || payload.role,
        userRole: payload.role,
        actionPerformed: 'EXAM_CREATED',
        newValue: { name, type, startDateAD, endDateAD },
        reason: `New ${type} examination session scheduled.`,
        collegeId: payload.collegeId
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

      await AuditEngine.recordEvent({
        moduleName: payload.role === 'TEACHER' ? 'TEACHER' : 'EXAM',
        entityType: 'EXAM_MARKS',
        entityId: result.id,
        studentId: studentId,
        createdBy: payload.name || payload.role,
        userRole: payload.role,
        actionPerformed: 'MARKS_UPDATED',
        newValue: { marksObtained, grade },
        reason: `Exam marks and grade '${grade}' entered for student.`,
        collegeId: payload.collegeId
      });

      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });
  } catch (error) {
    console.error('Exam operation error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
