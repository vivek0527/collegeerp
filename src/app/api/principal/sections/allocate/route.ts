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

// Extract 2-digit year from academic year string, e.g. "2026/2027" -> "26"
function getYearPrefix(ayString?: string): string {
  if (!ayString) return '26';
  const match = ayString.match(/\b(20)?(\d{2})\b/);
  return match ? match[2] : '26';
}

// Find highest existing 4-digit sequence number in assigned roll numbers for an academic year
function getHighestSeq(allRegistrations: any[], yearPrefix: string): number {
  let maxSeq = 0;
  for (const reg of allRegistrations) {
    if (!reg.rollNumber) continue;
    // Roll number pattern e.g. "26SD0023" -> match last 4 digits
    const match = reg.rollNumber.match(/^[0-9]{2}[A-Za-z]{2,4}([0-9]{4})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSeq) maxSeq = num;
    }
  }
  return maxSeq;
}

// POST — Automated section division & roll number assignment
export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload || !['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const {
    academicYear,
    department,
    shift,        // 'Day' | 'Morning'
    sectionCount, // e.g. 2 for Section A and B
    deptCode,     // e.g. 'S' or 'CS' or 'M'
    shiftCode,    // e.g. 'D' or 'M'
  } = await request.json();

  if (!department || !sectionCount || sectionCount < 1) {
    return NextResponse.json({ error: 'Department and valid sectionCount required' }, { status: 400 });
  }

  const all = readRegistrations();
  const yearPrefix = getYearPrefix(academicYear || '2026/2027');
  const dCode = (deptCode || department.slice(0, 1)).toUpperCase();
  const sCode = (shiftCode || (shift ? shift.slice(0, 1) : 'D')).toUpperCase();
  const tagCode = `${dCode}${sCode}`; // e.g., 'SD' or 'MM'

  // Filter unassigned / matching department & academic year students
  const matchingIndices: number[] = [];
  const candidates: { index: number; data: any }[] = [];

  all.forEach((reg, idx) => {
    const isAyMatch = !academicYear || reg.academicYear === academicYear || !reg.academicYear;
    const isDeptMatch = reg.department?.toLowerCase() === department.toLowerCase() ||
                        reg.className?.toLowerCase().includes(department.toLowerCase());
    const isShiftMatch = !shift || !reg.shift || reg.shift.toLowerCase() === shift.toLowerCase();

    if (isAyMatch && isDeptMatch && isShiftMatch) {
      matchingIndices.push(idx);
      candidates.push({ index: idx, data: reg });
    }
  });

  if (candidates.length === 0) {
    return NextResponse.json({ 
      error: `No registered students found for Department: ${department} (${shift || 'Any Shift'}) in Academic Year: ${academicYear || 'Active'}` 
    }, { status: 404 });
  }

  // Sort candidates by Entrance Mark (descending), secondary sort by SEE GPA (descending)
  candidates.sort((a, b) => {
    const markA = parseFloat(a.data.entranceMark || '0');
    const markB = parseFloat(b.data.entranceMark || '0');
    if (markB !== markA) return markB - markA;

    const gpaA = parseFloat(a.data.seeGpa || '0');
    const gpaB = parseFloat(b.data.seeGpa || '0');
    return gpaB - gpaA;
  });

  // Calculate current max sequence across all registrations
  let currentSeq = getHighestSeq(all, yearPrefix);

  const sectionLabels = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E'];
  const updatedRecords: any[] = [];

  // Distribute into N sections evenly
  candidates.forEach((cand, rankIndex) => {
    currentSeq += 1;
    const seqStr = String(currentSeq).padStart(4, '0');
    const newRollNumber = `${yearPrefix}${tagCode}${seqStr}`; // e.g. "26SD0001"
    
    const sectionIndex = rankIndex % sectionCount;
    const assignedSection = sectionLabels[sectionIndex] || `Section ${sectionIndex + 1}`;

    const original = all[cand.index];
    original.section = assignedSection;
    original.rollNumber = newRollNumber;
    original.rank = rankIndex + 1;
    original.department = department;
    original.shift = shift || original.shift || 'Day';
    original.academicYear = academicYear || original.academicYear || '2026/2027';

    updatedRecords.push({
      studentName: original.studentName || original.name,
      rank: rankIndex + 1,
      entranceMark: original.entranceMark,
      seeGpa: original.seeGpa,
      section: assignedSection,
      rollNumber: newRollNumber
    });
  });

  writeRegistrations(all);

  return NextResponse.json({
    message: `Successfully allocated ${candidates.length} students across ${sectionCount} section(s).`,
    totalAllocated: candidates.length,
    allocatedStudents: updatedRecords
  });
}
