import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'src', 'lib', 'mockStudentRegistrations.json');

function readRegistrations(): any[] {
  try {
    if (!fs.existsSync(STORE_PATH)) return [];
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeRegistrations(data: any[]) {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

// Find highest existing 4-digit sequence number across all roll numbers
function getHighestSeq(allRegistrations: any[]): number {
  let maxSeq = 0;
  for (const reg of allRegistrations) {
    if (!reg.rollNumber) continue;
    const match = reg.rollNumber.match(/^[0-9]{2}[A-Za-z]{2,4}([0-9]{4})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSeq) maxSeq = num;
    }
  }
  return maxSeq;
}

// GET — List unassigned / late-joining students (missing section or rollNumber)
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload || !['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const all = readRegistrations();
  // Unassigned if section is empty or rollNumber is empty or temporary
  const unassigned = all.filter(reg => !reg.section || !reg.rollNumber || reg.section === '' || reg.rollNumber === '');

  return NextResponse.json({
    totalUnassigned: unassigned.length,
    students: unassigned
  });
}

// PATCH — Assign section and auto-generate next sequential roll number for a single late joiner
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload || !['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { registrationId, section, department, shift } = await request.json();
  if (!registrationId || !section) {
    return NextResponse.json({ error: 'registrationId and section are required' }, { status: 400 });
  }

  const all = readRegistrations();
  const targetIndex = all.findIndex(r => r.id === registrationId || r.studentId === registrationId);

  if (targetIndex === -1) {
    return NextResponse.json({ error: 'Student registration record not found' }, { status: 404 });
  }

  const student = all[targetIndex];
  const deptStr = department || student.department || 'Science';
  const shiftStr = shift || student.shift || 'Day';

  const ayYear = student.academicYear || '2026/2027';
  const yearPrefix = ayYear.match(/\b(20)?(\d{2})\b/)?.[2] || '26';
  const tagCode = `${deptStr.slice(0, 1).toUpperCase()}${shiftStr.slice(0, 1).toUpperCase()}`; // e.g. "SD" or "MM"

  // Auto-next global sequence
  const highestSeq = getHighestSeq(all);
  const newSeqStr = String(highestSeq + 1).padStart(4, '0');
  const newRollNumber = `${yearPrefix}${tagCode}${newSeqStr}`;

  student.section = section;
  student.rollNumber = newRollNumber;
  student.department = deptStr;
  student.shift = shiftStr;

  writeRegistrations(all);

  return NextResponse.json({
    message: 'Successfully assigned section and roll number to late joiner.',
    student
  });
}
