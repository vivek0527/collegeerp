import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, hashPassword } from '@/lib/auth';
import prisma from '@/lib/db';
import { AuditEngine } from '@/lib/auditEngine';

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

    if (isDbOnline) {
      const staffUsers = await prisma.user.findMany({
        where: {
          collegeId: payload.collegeId,
          role: { in: ['TEACHER', 'RECEPTION', 'HR', 'LIBRARIAN', 'EXAM_DEPT', 'ACCOUNTS_OFFICER', 'ACCOUNTS_HEAD'] }
        },
        include: { teacherProfile: true, staffProfile: true },
        orderBy: { createdAt: 'desc' }
      });

      const staff = staffUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        employeeId: u.teacherProfile?.employeeId || u.staffProfile?.employeeId || 'N/A',
        salary: u.teacherProfile?.salary || u.staffProfile?.salary || 0
      }));
      return NextResponse.json({ staff, mode: 'db' });
    } else {
      // Return empty array for offline mock mode unless we implement mockStaffStore
      return NextResponse.json({ staff: [], mode: 'local' });
    }
  } catch (error) {
    console.error('Staff fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    // Only Principal and Admin can create Accounts/HR. VP might be limited, but we allow it here for simplicity.
    if (!payload || !['PRINCIPAL', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden. Only Principal can create staff accounts.' }, { status: 403 });
    }

    const { name, email, password, role, employeeId, baseSalary } = await request.json();

    if (!name || !email || !password || !role || !employeeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let isDbOnline = true;
    try { await prisma.user.findFirst(); } catch { isDbOnline = false; }

    if (isDbOnline) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const passwordHash = await hashPassword(password);
      const salary = parseFloat(baseSalary) || 0;

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            name,
            role,
            collegeId: payload.collegeId,
          }
        });

        if (role === 'TEACHER') {
          await tx.teacher.create({
            data: {
              userId: user.id,
              employeeId,
              salary,
            }
          });
        } else {
          await tx.staff.create({
            data: {
              userId: user.id,
              employeeId,
              roleType: role,
              salary,
            }
          });
        }
        return user;
      });

      await AuditEngine.recordEvent({
        moduleName: 'PRINCIPAL',
        entityType: 'STAFF_ACCOUNT',
        entityId: result.id,
        createdBy: payload.name || payload.role,
        userRole: payload.role,
        actionPerformed: 'STAFF_CREATED',
        newValue: { name, email, role, employeeId, salary },
        reason: `New ${role} account created by Principal.`,
        collegeId: payload.collegeId
      });

      return NextResponse.json({ success: true, mode: 'db' });
    } else {
      return NextResponse.json({ error: 'Cannot create staff accounts in offline mode.' }, { status: 503 });
    }
  } catch (error) {
    console.error('Staff creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
