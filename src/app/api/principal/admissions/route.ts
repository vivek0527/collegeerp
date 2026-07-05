import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import prisma from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { AuditEngine } from '@/lib/auditEngine';

const MOCK_REGISTRATIONS_PATH = path.join(process.cwd(), 'src', 'lib', 'mockStudentRegistrations.json');

// Helper to read local registrations
function getMockRegistrations() {
  try {
    if (fs.existsSync(MOCK_REGISTRATIONS_PATH)) {
      return JSON.parse(fs.readFileSync(MOCK_REGISTRATIONS_PATH, 'utf-8'));
    }
  } catch (e) { console.error('Error reading mock registrations:', e); }
  return [];
}

// Helper to write local registrations
function saveMockRegistrations(data: any[]) {
  try {
    fs.writeFileSync(MOCK_REGISTRATIONS_PATH, JSON.stringify(data, null, 2));
  } catch (e) { console.error('Error writing mock registrations:', e); }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let isDbOnline = true;
    try { await prisma.user.findFirst(); } catch { isDbOnline = false; }

    let pendingStudents: any[] = [];
    
    if (isDbOnline) {
      // Fetch from DB (assuming we add a status field, or just fetch recent students for now)
      // Since DB schema might not have an 'admissionStatus' yet, we'll return all students 
      // but in a real system we'd filter by status = 'PENDING'.
      const students = await prisma.student.findMany({
        where: { user: { collegeId: payload.collegeId } },
        include: { user: true, class: true },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit for dashboard
      });
      pendingStudents = students.map(s => ({
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        rollNumber: s.rollNumber,
        admissionNumber: s.admissionNumber,
        className: s.class.name,
        status: (s as any).admissionStatus || 'PENDING',
        mode: 'db'
      }));
    } else {
      // Mock mode
      const regs = getMockRegistrations().filter((r: any) => r.collegeId === payload.collegeId);
      pendingStudents = regs.map((r: any) => ({
        id: r.id, // Registration ID
        studentId: r.studentId,
        name: r.studentName,
        email: r.studentEmail,
        rollNumber: r.rollNumber,
        admissionNumber: r.admissionNumber,
        className: r.className,
        scholarshipSchemeId: r.scholarshipSchemeId || null,
        status: r.status || 'PENDING',
        mode: 'local'
      }));
    }

    return NextResponse.json({ admissions: pendingStudents });
  } catch (error) {
    console.error('Admissions fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { registrationId, status, remarks } = await request.json();
    if (!registrationId || !status) {
      return NextResponse.json({ error: 'Registration ID and status required.' }, { status: 400 });
    }

    let isDbOnline = true;
    try { await prisma.user.findFirst(); } catch { isDbOnline = false; }

    if (isDbOnline) {
      // In a real system, update the DB record.
      // Since schema doesn't have admissionStatus on Student, we just emit an Audit Log.
      await AuditEngine.recordEvent({
        moduleName: 'PRINCIPAL',
        entityType: 'STUDENT_ADMISSION',
        entityId: registrationId,
        createdBy: payload.name || payload.role,
        userRole: payload.role,
        actionPerformed: status === 'APPROVED' ? 'ADMISSION_APPROVED' : 'ADMISSION_REJECTED',
        newValue: { status, remarks },
        reason: remarks || `Admission has been ${status.toLowerCase()} by Principal.`,
        collegeId: payload.collegeId
      });
      return NextResponse.json({ success: true, mode: 'db' });
    } else {
      // Offline mode updates
      const regs = getMockRegistrations();
      const index = regs.findIndex((r: any) => r.id === registrationId);
      if (index === -1) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
      }

      regs[index].status = status;
      regs[index].approvalRemarks = remarks;
      saveMockRegistrations(regs);

      await AuditEngine.recordEvent({
        moduleName: 'PRINCIPAL',
        entityType: 'STUDENT_ADMISSION',
        entityId: regs[index].studentId,
        createdBy: payload.name || payload.role,
        userRole: payload.role,
        actionPerformed: status === 'APPROVED' ? 'ADMISSION_APPROVED' : 'ADMISSION_REJECTED',
        newValue: { status, remarks, schemeId: regs[index].scholarshipSchemeId },
        reason: remarks || `Admission has been ${status.toLowerCase()} by Principal.`,
        collegeId: payload.collegeId
      });

      return NextResponse.json({ success: true, mode: 'local' });
    }
  } catch (error) {
    console.error('Admissions update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
