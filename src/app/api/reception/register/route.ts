import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, hashPassword } from '@/lib/auth';
import prisma from '@/lib/db';
import { AuditEngine } from '@/lib/auditEngine';
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'src', 'lib', 'mockStudentRegistrations.json');

interface MockRegistration {
  id: string;
  collegeId: string;
  // Student
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  rollNumber: string;
  admissionNumber: string;
  className: string;
  dateOfBirthBS: string;
  // Parent
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentOccupation: string;
  createdAt: string;
}

function readStore(): MockRegistration[] {
  try {
    if (!fs.existsSync(STORE_PATH)) return [];
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch { return []; }
}

function writeStore(data: MockRegistration[]) {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

// GET — list all registrations
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allowed = ['RECEPTION', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'];
  if (!allowed.includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Try DB first
  let isDbOnline = true;
  try { await prisma.user.findFirst(); } catch { isDbOnline = false; }

  if (isDbOnline) {
    try {
      const students = await prisma.student.findMany({
        where: { user: { collegeId: payload.collegeId } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          class: { select: { name: true, section: true } },
          parent: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ students, mode: 'db' });
    } catch (e) {
      console.error('DB student fetch error:', e);
    }
  }

  // Local fallback
  const all = readStore().filter(r => r.collegeId === payload.collegeId);
  const students = all.map(r => ({
    id: r.studentId,
    rollNumber: r.rollNumber,
    admissionNumber: r.admissionNumber,
    dateOfBirthBS: r.dateOfBirthBS,
    user: { id: r.studentId, name: r.studentName, email: r.studentEmail, phone: r.studentPhone },
    class: { name: r.className, section: '' },
    parent: r.parentId ? {
      id: r.parentId,
      phone: r.parentPhone,
      occupation: r.parentOccupation,
      user: { name: r.parentName, email: r.parentEmail }
    } : null
  }));
  return NextResponse.json({ students, mode: 'local' });
}

// POST — register new student + parent
export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload || !['RECEPTION', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check if Admission Portal & Department-wise Switch is open
  const sessionStorePath = path.join(process.cwd(), 'src', 'lib', 'mockAcademicSessions.json');
  let isAdmissionOpen = true;
  let activeAy = '2083-2084 BS';
  let allowedDepts: string[] = [];

  try {
    if (fs.existsSync(sessionStorePath)) {
      const sessions = JSON.parse(fs.readFileSync(sessionStorePath, 'utf-8'));
      const activeObj = sessions.find((x: any) => x.isActive) || sessions[0];
      if (activeObj) {
        isAdmissionOpen = !!activeObj.isAdmissionOpen;
        activeAy = activeObj.sessionName || activeAy;
        if (activeObj.departments && Array.isArray(activeObj.departments)) {
          allowedDepts = activeObj.departments
            .filter((d: any) => d.isAdmissionOpen)
            .map((d: any) => d.code.toUpperCase());
        }
      }
    }
  } catch (e) {}

  if (!isAdmissionOpen) {
    return NextResponse.json({ 
      error: 'Admission Portal is currently CLOSED by Executive Management for all departments.' 
    }, { status: 403 });
  }

  const {
    // Student
    studentName, studentEmail, studentPhone, studentPassword,
    rollNumber, admissionNumber, classId, className, dateOfBirthBS,
    department, shift, seeGpa, entranceMark, academicYear,
    // Parent
    parentName, parentEmail, parentPhone, parentPassword, parentOccupation,
    // Scholarship
    scholarshipSchemeId, scholarshipRemarks
  } = await request.json();

  if (!studentName || !studentEmail || !studentPassword || !admissionNumber) {
    return NextResponse.json({ error: 'Missing required student fields (Name, Email, Password, Admission No)' }, { status: 400 });
  }
  if (!parentName || !parentEmail || !parentPassword) {
    return NextResponse.json({ error: 'Missing required parent fields' }, { status: 400 });
  }
  if (studentEmail === parentEmail) {
    return NextResponse.json({ error: 'Student and parent must have different email addresses' }, { status: 400 });
  }

  // Department-specific ON/OFF Portal Switch validation
  if (department && allowedDepts.length > 0) {
    const targetCode = String(department).toUpperCase();
    const isDeptOpen = allowedDepts.some(code => targetCode.includes(code) || code.includes(targetCode));
    if (!isDeptOpen) {
      return NextResponse.json({ 
        error: `Admission Portal for [${department}] is currently TURNED OFF by Executive Management (Principal/VP/Chairperson).` 
      }, { status: 403 });
    }
  }

  // Try DB
  let isDbOnline = true;
  try { await prisma.user.findFirst(); } catch { isDbOnline = false; }

  if (isDbOnline) {
    try {
      const studentHash = await hashPassword(studentPassword);
      const parentHash = await hashPassword(parentPassword);

      let resolvedClassId = classId;
      if (!resolvedClassId) {
        const cls = await prisma.class.findFirst({ where: { collegeId: payload.collegeId } });
        resolvedClassId = cls?.id;
      }
      if (!resolvedClassId) {
        return NextResponse.json({ error: 'No class found. Please create a class first.' }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Create parent user
        const parentUser = await tx.user.create({
          data: {
            email: parentEmail,
            passwordHash: parentHash,
            name: parentName,
            role: 'PARENT',
            collegeId: payload.collegeId,
          }
        });
        const parentProfile = await tx.parent.create({
          data: {
            userId: parentUser.id,
            phone: parentPhone,
            occupation: parentOccupation || '',
          }
        });

        // Create student user
        const studentUser = await tx.user.create({
          data: {
            email: studentEmail,
            passwordHash: studentHash,
            name: studentName,
            role: 'STUDENT',
            collegeId: payload.collegeId,
          }
        });
        const studentProfile = await tx.student.create({
          data: {
            userId: studentUser.id,
            rollNumber,
            admissionNumber,
            classId: resolvedClassId,
            parentId: parentProfile.id,
            dateOfBirthBS: dateOfBirthBS || null,
          }
        });

        return { studentUser, studentProfile, parentUser, parentProfile };
      });

      // Automatic Audit Event Generation via Central AuditEngine
      await AuditEngine.recordEvent({
        moduleName: 'RECEPTION',
        entityType: 'STUDENT',
        entityId: result.studentProfile.id,
        referenceNumber: admissionNumber,
        studentId: result.studentProfile.id,
        createdBy: payload.name || 'Reception Staff',
        userRole: payload.role,
        actionPerformed: 'STUDENT_CREATED',
        newValue: { studentName, studentEmail, rollNumber, admissionNumber, className, scholarshipSchemeId },
        reason: `New student registration created at Front Desk by Reception.`,
        collegeId: payload.collegeId
      });

      if (scholarshipSchemeId) {
        // Look up scheme
        const schemesPath = path.join(process.cwd(), 'src', 'lib', 'mockScholarshipSchemes.json');
        let schemeName = 'Unknown Scheme';
        let schemeVal = 'Unknown';
        try {
          const schemes = JSON.parse(fs.readFileSync(schemesPath, 'utf-8'));
          const s = schemes.find((x: any) => x.id === scholarshipSchemeId);
          if (s) {
            schemeName = s.name;
            schemeVal = s.discountType === 'PERCENTAGE' ? `${s.discountValue}%` : `NPR ${s.discountValue}`;
          }
        } catch(e) {}

        await AuditEngine.recordEvent({
          moduleName: 'RECEPTION',
          entityType: 'SCHOLARSHIP',
          entityId: result.studentProfile.id,
          referenceNumber: admissionNumber,
          studentId: result.studentProfile.id,
          createdBy: payload.name || 'Reception Staff',
          userRole: payload.role,
          actionPerformed: 'SCHOLARSHIP_GRANTED',
          newValue: { schemeId: scholarshipSchemeId, schemeName, schemeValue: schemeVal, remarks: scholarshipRemarks },
          reason: scholarshipRemarks || `Authorized scholarship scheme [${schemeName}] granted at registration.`,
          collegeId: payload.collegeId
        });
      }

      return NextResponse.json({ success: true, data: result, mode: 'db' });
    } catch (e: any) {
      if (e.code === 'P2002') {
        return NextResponse.json({ error: 'Email already registered. Use a different email.' }, { status: 409 });
      }
      console.error('Registration error:', e);
    }
  }

  // Local fallback — store in JSON
  const store = readStore();

  // Check duplicates
  if (store.find(r => r.studentEmail === studentEmail)) {
    return NextResponse.json({ error: 'Student email already registered.' }, { status: 409 });
  }
  if (store.find(r => r.parentEmail === parentEmail)) {
    return NextResponse.json({ error: 'Parent email already registered.' }, { status: 409 });
  }

  const now = new Date().toISOString();
  const sid = `local-student-${Date.now()}`;
  const pid = `local-parent-${Date.now() + 1}`;

  const record: any = {
    id: `reg-${Date.now()}`,
    collegeId: payload.collegeId,
    studentId: sid,
    studentName,
    studentEmail,
    studentPhone: studentPhone || '',
    rollNumber: rollNumber || '',
    admissionNumber,
    className: className || department || 'Unassigned Department',
    department: department || 'Science',
    shift: shift || 'Day',
    seeGpa: seeGpa || '',
    entranceMark: entranceMark || '',
    academicYear: academicYear || activeAy,
    section: '',
    dateOfBirthBS: dateOfBirthBS || '',
    parentId: pid,
    parentName,
    parentEmail,
    parentPhone: parentPhone || '',
    parentOccupation: parentOccupation || '',
    createdAt: now,
  };

  store.push(record);
  writeStore(store);

  // Automatic Audit Event Generation via Central AuditEngine
  await AuditEngine.recordEvent({
    moduleName: 'RECEPTION',
    entityType: 'STUDENT',
    entityId: sid,
    referenceNumber: admissionNumber,
    studentId: sid,
    createdBy: payload.name || 'Reception Staff',
    userRole: payload.role,
    actionPerformed: 'STUDENT_CREATED',
    newValue: { studentName, studentEmail, rollNumber, admissionNumber, className, scholarshipSchemeId },
    reason: `New student registration created at Front Desk by Reception.`,
    collegeId: payload.collegeId
  });

  if (scholarshipSchemeId) {
    // Look up scheme
    const schemesPath = path.join(process.cwd(), 'src', 'lib', 'mockScholarshipSchemes.json');
    let schemeName = 'Unknown Scheme';
    let schemeVal = 'Unknown';
    try {
      const schemes = JSON.parse(fs.readFileSync(schemesPath, 'utf-8'));
      const s = schemes.find((x: any) => x.id === scholarshipSchemeId);
      if (s) {
        schemeName = s.name;
        schemeVal = s.discountType === 'PERCENTAGE' ? `${s.discountValue}%` : `NPR ${s.discountValue}`;
      }
    } catch(e) {}

    await AuditEngine.recordEvent({
      moduleName: 'RECEPTION',
      entityType: 'SCHOLARSHIP',
      entityId: sid,
      referenceNumber: admissionNumber,
      studentId: sid,
      createdBy: payload.name || 'Reception Staff',
      userRole: payload.role,
      actionPerformed: 'SCHOLARSHIP_GRANTED',
      newValue: { schemeId: scholarshipSchemeId, schemeName, schemeValue: schemeVal, remarks: scholarshipRemarks },
      reason: scholarshipRemarks || `Authorized scholarship scheme [${schemeName}] granted at registration.`,
      collegeId: payload.collegeId
    });
  }

  return NextResponse.json({
    success: true,
    mode: 'local',
    studentEmail,
    parentEmail,
    message: 'Registration saved locally. Sync to database when online.'
  });
}
