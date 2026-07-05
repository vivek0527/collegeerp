import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const DEPT_STORE_PATH = path.join(process.cwd(), 'src', 'lib', 'mockDepartments.json');

interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
}

function readDepts(): DepartmentRecord[] {
  try {
    if (!fs.existsSync(DEPT_STORE_PATH)) {
      const initial: DepartmentRecord[] = [
        { id: 'dept-1', name: 'Science', code: 'S' },
        { id: 'dept-2', name: 'Management', code: 'M' },
        { id: 'dept-3', name: 'Humanities', code: 'H' },
        { id: 'dept-4', name: 'Computer Science', code: 'CS' },
      ];
      fs.writeFileSync(DEPT_STORE_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(fs.readFileSync(DEPT_STORE_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeDepts(data: DepartmentRecord[]) {
  const dir = path.dirname(DEPT_STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DEPT_STORE_PATH, JSON.stringify(data, null, 2));
}

// GET — List all dynamic departments
export async function GET(request: NextRequest) {
  const depts = readDepts();
  return NextResponse.json({ departments: depts });
}

// POST — Create new department (Principal / Admin)
export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload || !['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, code } = await request.json();
  if (!name || !code) {
    return NextResponse.json({ error: 'Department Name and Department Code are required' }, { status: 400 });
  }

  const depts = readDepts();
  if (depts.some(d => d.name.toLowerCase() === name.toLowerCase())) {
    return NextResponse.json({ error: 'Department with this name already exists' }, { status: 409 });
  }

  const newDept: DepartmentRecord = {
    id: `dept-${Date.now()}`,
    name: name.trim(),
    code: code.trim().toUpperCase(),
  };

  depts.push(newDept);
  writeDepts(depts);

  return NextResponse.json({ message: 'Department created successfully', department: newDept });
}

// DELETE — Remove department
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload || !['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Department ID required' }, { status: 400 });

  const depts = readDepts();
  const filtered = depts.filter(d => d.id !== id);

  writeDepts(filtered);

  return NextResponse.json({ message: 'Department removed successfully' });
}
