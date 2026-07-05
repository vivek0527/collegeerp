import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { AuditEngine } from '@/lib/auditEngine';
import fs from 'fs';
import path from 'path';

// Local file path for offline/demo mode persistence
const SALARIES_JSON_PATH = path.join(process.cwd(), 'src', 'lib', 'mockSalarySlips.json');

interface LocalSalarySlip {
  id: string;
  collegeId: string;
  userId: string;
  userName: string;
  userRole: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  payPeriod: string;
  status: string; // PAID, UNPAID
  maxLeavesAllowed: number;
  actualLeaves: number;
  deductionType: string; // AUTO_PER_DAY, PERCENTAGE, FLAT_AMOUNT
  deductionValue: number;
  leaveCutAmount: number;
  createdAt: string;
}

// Get or seed local salary slips
function getLocalSalaries(collegeId: string): LocalSalarySlip[] {
  try {
    if (!fs.existsSync(SALARIES_JSON_PATH)) {
      const parentDir = path.dirname(SALARIES_JSON_PATH);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      const initialSeed: LocalSalarySlip[] = [
        {
          id: 'sal-seed-1',
          collegeId: collegeId || 'mock-college-id',
          userId: 'mock-teacher-id',
          userName: 'Mr. Santosh Dahal',
          userRole: 'TEACHER',
          basicSalary: 55000,
          allowances: 3500,
          deductions: 1000,
          netSalary: 57500,
          payPeriod: 'Asar 2083',
          status: 'PAID',
          maxLeavesAllowed: 2,
          actualLeaves: 1,
          deductionType: 'AUTO_PER_DAY',
          deductionValue: 0,
          leaveCutAmount: 0,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sal-seed-2',
          collegeId: collegeId || 'mock-college-id',
          userId: 'mock-staff-profile-id',
          userName: 'Mrs. Sita Devkota',
          userRole: 'LIBRARIAN',
          basicSalary: 40000,
          allowances: 2000,
          deductions: 500,
          payPeriod: 'Asar 2083',
          status: 'PAID',
          maxLeavesAllowed: 2,
          actualLeaves: 4,
          deductionType: 'AUTO_PER_DAY',
          deductionValue: 0,
          leaveCutAmount: 2667,
          netSalary: 38833,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      fs.writeFileSync(SALARIES_JSON_PATH, JSON.stringify(initialSeed, null, 2));
      return initialSeed;
    }
    const data = fs.readFileSync(SALARIES_JSON_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local salaries:', err);
    return [];
  }
}

function saveLocalSalaries(salaries: LocalSalarySlip[]) {
  try {
    fs.writeFileSync(SALARIES_JSON_PATH, JSON.stringify(salaries, null, 2));
  } catch (err) {
    console.error('Error saving local salaries:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      if (['ACCOUNTS_HEAD', 'ACCOUNTS_OFFICER', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HR'].includes(payload.role)) {
        const slips = await prisma.salarySlip.findMany({
          where: { collegeId: payload.collegeId },
          include: {
            user: { select: { name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ salarySlips: slips });
      } else {
        const slips = await prisma.salarySlip.findMany({
          where: {
            collegeId: payload.collegeId,
            userId: payload.userId
          },
          include: {
            user: { select: { name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ salarySlips: slips });
      }
    } else {
      const local = getLocalSalaries(payload.collegeId);
      if (['ACCOUNTS_HEAD', 'ACCOUNTS_OFFICER', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HR'].includes(payload.role)) {
        return NextResponse.json({
          salarySlips: local.map(s => ({
            id: s.id,
            basicSalary: s.basicSalary,
            allowances: s.allowances,
            deductions: s.deductions,
            netSalary: s.netSalary,
            payPeriod: s.payPeriod,
            status: s.status,
            maxLeavesAllowed: s.maxLeavesAllowed,
            actualLeaves: s.actualLeaves,
            deductionType: s.deductionType,
            deductionValue: s.deductionValue,
            leaveCutAmount: s.leaveCutAmount,
            createdAt: s.createdAt,
            user: { name: s.userName, role: s.userRole }
          }))
        });
      } else {
        const userSlips = local.filter(s => {
          if (payload.role === 'TEACHER') {
            return s.userRole === 'TEACHER';
          } else {
            return s.userId === payload.userId || s.userRole === payload.role;
          }
        });
        return NextResponse.json({
          salarySlips: userSlips.map(s => ({
            id: s.id,
            basicSalary: s.basicSalary,
            allowances: s.allowances,
            deductions: s.deductions,
            netSalary: s.netSalary,
            payPeriod: s.payPeriod,
            status: s.status,
            maxLeavesAllowed: s.maxLeavesAllowed,
            actualLeaves: s.actualLeaves,
            deductionType: s.deductionType,
            deductionValue: s.deductionValue,
            leaveCutAmount: s.leaveCutAmount,
            createdAt: s.createdAt,
            user: { name: s.userName, role: s.userRole }
          }))
        });
      }
    }
  } catch (error) {
    console.error('Salaries GET error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['ACCOUNTS_HEAD', 'HR', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      userId,
      basicSalary,
      allowances,
      deductions,
      payPeriod,
      status,
      userName,
      userRole,
      maxLeavesAllowed,
      actualLeaves,
      deductionType,
      deductionValue,
      daysInMonth
    } = await request.json();

    if (!userId || basicSalary === undefined || !payPeriod) {
      return NextResponse.json({ error: 'Missing userId, basicSalary, or payPeriod' }, { status: 400 });
    }

    const basic = parseFloat(basicSalary);
    const allow = parseFloat(allowances || 0);
    const deduct = parseFloat(deductions || 0);
    
    const maxL = parseInt(maxLeavesAllowed || 2);
    const actL = parseInt(actualLeaves || 0);
    const dedType = deductionType || 'AUTO_PER_DAY';
    const dedVal = parseFloat(deductionValue || 0);
    const monthDays = parseInt(daysInMonth || 30);

    const extraLeaves = Math.max(0, actL - maxL);
    let leaveCut = 0;

    if (extraLeaves > 0) {
      if (dedType === 'AUTO_PER_DAY') {
        leaveCut = Math.round((basic / monthDays) * extraLeaves);
      } else if (dedType === 'PERCENTAGE') {
        leaveCut = Math.round((basic * (dedVal / 100)) * extraLeaves);
      } else if (dedType === 'FLAT_AMOUNT') {
        leaveCut = Math.round(dedVal * extraLeaves);
      }
    }

    const net = basic + allow - deduct - leaveCut;

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      const newSlip = await prisma.salarySlip.create({
        data: {
          collegeId: payload.collegeId,
          userId,
          basicSalary: basic,
          allowances: allow,
          deductions: deduct,
          netSalary: net,
          payPeriod,
          status: status || 'UNPAID',
          maxLeavesAllowed: maxL,
          actualLeaves: actL,
          deductionType: dedType,
          deductionValue: dedVal,
          leaveCutAmount: leaveCut,
        },
        include: {
          user: { select: { name: true, role: true } }
        }
      });

      // Automatic Audit Event Generation via Central AuditEngine
      await AuditEngine.recordEvent({
        moduleName: payload.role === 'HR' ? 'HR' : 'ACCOUNTS_HEAD',
        entityType: 'SALARY',
        entityId: newSlip.id,
        staffId: userId,
        createdBy: payload.name || 'HR / Accounts Head',
        userRole: payload.role,
        actionPerformed: 'SALARY_PROCESSED',
        newValue: { basicSalary: basic, allowances: allow, deductions: deduct, netSalary: net, payPeriod, status },
        reason: `Monthly payroll processed for employee (Pay period: ${payPeriod}).`,
        amount: net,
        collegeId: payload.collegeId
      });

      return NextResponse.json({ success: true, salarySlip: newSlip });
    } else {
      // Local fallback mode
      const local = getLocalSalaries(payload.collegeId);
      const newSlip: LocalSalarySlip = {
        id: `sal-local-${Date.now()}`,
        collegeId: payload.collegeId,
        userId,
        userName: userName || 'Employee',
        userRole: userRole || 'TEACHER',
        basicSalary: basic,
        allowances: allow,
        deductions: deduct,
        netSalary: net,
        payPeriod,
        status: status || 'UNPAID',
        maxLeavesAllowed: maxL,
        actualLeaves: actL,
        deductionType: dedType,
        deductionValue: dedVal,
        leaveCutAmount: leaveCut,
        createdAt: new Date().toISOString()
      };
      local.push(newSlip);
      saveLocalSalaries(local);

      // Automatic Audit Event Generation via Central AuditEngine
      await AuditEngine.recordEvent({
        moduleName: payload.role === 'HR' ? 'HR' : 'ACCOUNTS_HEAD',
        entityType: 'SALARY',
        entityId: newSlip.id,
        staffId: userId,
        createdBy: payload.name || 'HR / Accounts Head',
        userRole: payload.role,
        actionPerformed: 'SALARY_PROCESSED',
        newValue: { basicSalary: basic, allowances: allow, deductions: deduct, netSalary: net, payPeriod, status },
        reason: `Monthly payroll processed for employee (Pay period: ${payPeriod}).`,
        amount: net,
        collegeId: payload.collegeId
      });

      return NextResponse.json({
        success: true,
        salarySlip: {
          id: newSlip.id,
          basicSalary: newSlip.basicSalary,
          allowances: newSlip.allowances,
          deductions: newSlip.deductions,
          netSalary: newSlip.netSalary,
          payPeriod: newSlip.payPeriod,
          status: newSlip.status,
          maxLeavesAllowed: newSlip.maxLeavesAllowed,
          actualLeaves: newSlip.actualLeaves,
          deductionType: newSlip.deductionType,
          deductionValue: newSlip.deductionValue,
          leaveCutAmount: newSlip.leaveCutAmount,
          createdAt: newSlip.createdAt,
          user: { name: newSlip.userName, role: newSlip.userRole }
        }
      });
    }
  } catch (error) {
    console.error('Salary creation error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['ACCOUNTS_HEAD', 'ADMIN', 'HR'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing salary slip ID' }, { status: 400 });

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      await prisma.salarySlip.delete({
        where: { id }
      });
    } else {
      const local = getLocalSalaries(payload.collegeId);
      const filtered = local.filter(s => s.id !== id);
      saveLocalSalaries(filtered);
    }

    // Automatic Audit Event Generation via Central AuditEngine
    await AuditEngine.recordEvent({
      moduleName: payload.role === 'HR' ? 'HR' : 'ACCOUNTS_HEAD',
      entityType: 'SALARY',
      entityId: id,
      createdBy: payload.name || 'HR / Accounts Head',
      userRole: payload.role,
      actionPerformed: 'SALARY_DELETED',
      previousValue: { id },
      newValue: { status: 'DELETED' },
      reason: `Salary slip record (${id}) deleted by ${payload.name || payload.role}.`,
      collegeId: payload.collegeId
    });

    return NextResponse.json({ success: true, message: 'Salary slip deleted successfully' });
  } catch (error) {
    console.error('Salary delete error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
