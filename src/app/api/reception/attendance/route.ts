import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import prisma from '@/lib/db';
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'src', 'lib', 'mockStudentRegistrations.json');

function readStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) return [];
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch { return []; }
}

const MOCK_ATTENDANCE = [
  { studentId: 'mock-student-id-1', studentName: 'Niranjan Thapa', className: 'Grade 11 Science-A', rollNumber: '01', status: 'PRESENT', parentName: 'Ram Bahadur Thapa', parentPhone: '+977-9841234567', parentEmail: 'parent@emc.edu.np' },
  { studentId: 'mock-student-id-2', studentName: 'Suman Karki', className: 'Grade 11 Science-A', rollNumber: '02', status: 'ABSENT', parentName: 'Hari Prasad Karki', parentPhone: '+977-9851112233', parentEmail: 'hkarki@email.com' },
  { studentId: 'mock-student-id-3', studentName: 'Priya Sharma', className: 'Grade 11 Commerce-B', rollNumber: '03', status: 'PRESENT', parentName: 'Ramesh Sharma', parentPhone: '+977-9808223344', parentEmail: 'rsharma@email.com' },
  { studentId: 'mock-student-id-4', studentName: 'Aakash Thapa', className: 'Grade 11 Commerce-B', rollNumber: '04', status: 'ABSENT', parentName: 'Dinesh Thapa', parentPhone: '+977-9867334455', parentEmail: 'dthapa@email.com' },
  { studentId: 'mock-student-id-5', studentName: 'Anita Rai', className: 'Grade 12 Science-A', rollNumber: '05', status: 'LATE', parentName: 'Bikram Rai', parentPhone: '+977-9845445566', parentEmail: 'brai@email.com' },
  { studentId: 'mock-student-id-6', studentName: 'Rohan Khadka', className: 'Grade 12 Science-A', rollNumber: '06', status: 'PRESENT', parentName: 'Sita Khadka', parentPhone: '+977-9820556677', parentEmail: 'skhadka@email.com' },
  { studentId: 'mock-student-id-7', studentName: 'Kritika Bhandari', className: 'Grade 12 Arts', rollNumber: '07', status: 'ABSENT', parentName: 'Mohan Bhandari', parentPhone: '+977-9860667788', parentEmail: 'mbhandari@email.com' },
  { studentId: 'mock-student-id-8', studentName: 'Rajan Poudel', className: 'Grade 12 Arts', rollNumber: '08', status: 'PRESENT', parentName: 'Gita Poudel', parentPhone: '+977-9841778899', parentEmail: 'gpoudel@email.com' },
];

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allowed = ['RECEPTION', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'];
  if (!allowed.includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const absentOnly = searchParams.get('absent') === 'true';

  // Try DB
  let isDbOnline = true;
  try { await prisma.user.findFirst(); } catch { isDbOnline = false; }

  if (isDbOnline) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const records = await prisma.attendance.findMany({
        where: {
          collegeId: payload.collegeId,
          dateAD: { gte: today },
          ...(absentOnly ? { status: 'ABSENT' } : {}),
        },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              class: { select: { name: true, section: true } },
              parent: {
                include: {
                  user: { select: { name: true, email: true } }
                }
              }
            }
          }
        },
        orderBy: { dateAD: 'desc' }
      });

      const attendance = records.map((r: any) => ({
        studentId: r.studentId,
        studentName: r.student.user.name,
        className: `${r.student.class.name} ${r.student.class.section}`.trim(),
        rollNumber: r.student.rollNumber,
        status: r.status,
        parentName: r.student.parent?.user?.name || '—',
        parentPhone: r.student.parent?.phone || '—',
        parentEmail: r.student.parent?.user?.email || '—',
      }));

      const summary = {
        total: attendance.length,
        present: attendance.filter((a: any) => a.status === 'PRESENT').length,
        absent: attendance.filter((a: any) => a.status === 'ABSENT').length,
        late: attendance.filter((a: any) => a.status === 'LATE').length,
        excused: attendance.filter((a: any) => a.status === 'EXCUSED').length,
      };

      return NextResponse.json({ attendance, summary, mode: 'db' });
    } catch (e) {
      console.error('DB attendance fetch error:', e);
    }
  }

  // Local fallback — combine mock data with locally registered students
  const stored = readStore().filter((r: any) => r.collegeId === payload.collegeId);
  const localAttendance = [
    ...MOCK_ATTENDANCE,
    ...stored.map((r: any) => ({
      studentId: r.studentId,
      studentName: r.studentName,
      className: r.className,
      rollNumber: r.rollNumber,
      status: 'PRESENT',
      parentName: r.parentName,
      parentPhone: r.parentPhone,
      parentEmail: r.parentEmail || '',
    }))
  ];

  const filtered = absentOnly
    ? localAttendance.filter((a: any) => a.status === 'ABSENT')
    : localAttendance;

  const summary = {
    total: localAttendance.length,
    present: localAttendance.filter((a: any) => a.status === 'PRESENT').length,
    absent: localAttendance.filter((a: any) => a.status === 'ABSENT').length,
    late: localAttendance.filter((a: any) => a.status === 'LATE').length,
    excused: localAttendance.filter((a: any) => a.status === 'EXCUSED').length,
  };

  return NextResponse.json({ attendance: filtered, summary, mode: 'local' });
}
