import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const AY_STORE_PATH = path.join(process.cwd(), 'src', 'lib', 'mockAcademicYears.json');

export interface AcademicYearRecord {
  id: string;
  year: string;
  isActive: boolean;
  isAdmissionOpen: boolean;
  createdAt: string;
}

function readAyStore(): AcademicYearRecord[] {
  try {
    if (!fs.existsSync(AY_STORE_PATH)) {
      const initial: AcademicYearRecord[] = [{
        id: 'ay-2026-2027',
        year: '2026/2027',
        isActive: true,
        isAdmissionOpen: true,
        createdAt: new Date().toISOString()
      }];
      fs.writeFileSync(AY_STORE_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(fs.readFileSync(AY_STORE_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeAyStore(data: AcademicYearRecord[]) {
  const dir = path.dirname(AY_STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(AY_STORE_PATH, JSON.stringify(data, null, 2));
}

// GET — List Academic Years & Admission Status
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const years = readAyStore();
  const activeYear = years.find(y => y.isActive) || years[0] || null;

  return NextResponse.json({
    years,
    activeYear,
    isAdmissionOpen: activeYear ? activeYear.isAdmissionOpen : false
  });
}

// POST — Create new Academic Year
export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload || !['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { year } = await request.json();
  if (!year || typeof year !== 'string') {
    return NextResponse.json({ error: 'Invalid or missing year string (e.g. 2026/2027)' }, { status: 400 });
  }

  const years = readAyStore();
  // Deactivate all existing
  const updatedYears = years.map(y => ({ ...y, isActive: false }));

  const newAy: AcademicYearRecord = {
    id: `ay-${Date.now()}`,
    year: year.trim(),
    isActive: true,
    isAdmissionOpen: true,
    createdAt: new Date().toISOString()
  };

  updatedYears.unshift(newAy);
  writeAyStore(updatedYears);

  return NextResponse.json({ message: 'Academic Year created successfully', academicYear: newAy });
}

// PATCH — Toggle Admission Portal ON/OFF
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload || !['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { isAdmissionOpen, yearId } = await request.json();
  if (typeof isAdmissionOpen !== 'boolean') {
    return NextResponse.json({ error: 'isAdmissionOpen boolean required' }, { status: 400 });
  }

  const years = readAyStore();
  const targetIndex = yearId 
    ? years.findIndex(y => y.id === yearId)
    : years.findIndex(y => y.isActive);

  if (targetIndex === -1) {
    return NextResponse.json({ error: 'Academic Year not found' }, { status: 404 });
  }

  years[targetIndex].isAdmissionOpen = isAdmissionOpen;
  writeAyStore(years);

  return NextResponse.json({ 
    message: `Admission portal toggled ${isAdmissionOpen ? 'ON' : 'OFF'}`,
    academicYear: years[targetIndex]
  });
}
