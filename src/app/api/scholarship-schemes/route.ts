import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { AuditEngine } from '@/lib/auditEngine';

const STORE_PATH = path.join(process.cwd(), 'src', 'lib', 'mockScholarshipSchemes.json');

function readStore(): any[] {
  try {
    if (!fs.existsSync(STORE_PATH)) return [];
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch { return []; }
}

function writeStore(data: any[]) {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

// GET all schemes for the college
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allSchemes = readStore();
    const collegeSchemes = allSchemes.filter(s => s.collegeId === payload.collegeId || s.collegeId === 'mock-college-id');

    return NextResponse.json({ schemes: collegeSchemes });
  } catch (error) {
    console.error('Fetch scholarship schemes error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// POST create a new scheme (Restricted to Principal/VP/Admin)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden. Only Principal/VP/Admin can create schemes.' }, { status: 403 });
    }

    const { name, discountType, discountValue } = await request.json();

    if (!name || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const store = readStore();
    
    const newScheme = {
      id: `scheme-${Date.now()}`,
      name,
      discountType,
      discountValue: parseFloat(discountValue),
      createdBy: payload.name || payload.role,
      collegeId: payload.collegeId
    };

    store.push(newScheme);
    writeStore(store);

    // Audit Event
    await AuditEngine.recordEvent({
      moduleName: payload.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'VICE_PRINCIPAL',
      entityType: 'SCHOLARSHIP_SCHEME',
      entityId: newScheme.id,
      createdBy: payload.name || payload.role,
      userRole: payload.role,
      actionPerformed: 'SCHEME_CREATED',
      newValue: { name, discountType, discountValue },
      reason: `New scholarship scheme authorized.`,
      collegeId: payload.collegeId
    });

    return NextResponse.json({ success: true, scheme: newScheme });
  } catch (error) {
    console.error('Create scheme error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// DELETE a scheme
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const store = readStore();
    const index = store.findIndex(s => s.id === id && (s.collegeId === payload.collegeId || s.collegeId === 'mock-college-id'));

    if (index === -1) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }

    const deleted = store[index];
    store.splice(index, 1);
    writeStore(store);

    await AuditEngine.recordEvent({
      moduleName: payload.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'VICE_PRINCIPAL',
      entityType: 'SCHOLARSHIP_SCHEME',
      entityId: id,
      createdBy: payload.name || payload.role,
      userRole: payload.role,
      actionPerformed: 'SCHEME_DELETED',
      newValue: { deletedSchemeName: deleted.name },
      reason: `Scholarship scheme revoked/deleted.`,
      collegeId: payload.collegeId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete scheme error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
