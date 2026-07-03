import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import prisma from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { AutoSalaryConfig } from '../auto-config/route';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'lib', 'mockSalaryAutoConfigs.json');
const SALARIES_PATH = path.join(process.cwd(), 'src', 'lib', 'mockSalarySlips.json');

const NEPALI_MONTHS = [
  'Baishakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// Nepali month day counts
const DAYS_IN_MONTH = [31, 31, 32, 32, 31, 31, 30, 29, 30, 29, 30, 30];

function readConfigs(): AutoSalaryConfig[] {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return [];
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeConfigs(configs: AutoSalaryConfig[]) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(configs, null, 2));
}

function readLocalSalaries(): any[] {
  try {
    if (!fs.existsSync(SALARIES_PATH)) return [];
    return JSON.parse(fs.readFileSync(SALARIES_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeLocalSalaries(slips: any[]) {
  fs.writeFileSync(SALARIES_PATH, JSON.stringify(slips, null, 2));
}

/**
 * Convert approximate current AD date to Nepali BS month/year.
 * Uses a fixed epoch offset (rough approximation sufficient for month-level scheduling).
 */
function getCurrentBSMonthYear(): { month: number; year: number } {
  const now = new Date();
  const adYear = now.getFullYear();
  const adMonth = now.getMonth(); // 0-indexed

  // Bikram Sambat is approximately 56 years and 8.5 months ahead of AD
  // The BS year starts mid-April (Baishakh 1)
  // Approximate mapping:
  const adMonthToBSMonth: { [key: number]: number } = {
    0: 9,  // January → Poush (prev BS year) / Magh
    1: 10, // February → Falgun
    2: 11, // March → Chaitra
    3: 0,  // April (after ~mid) → Baishakh
    4: 1,  // May → Jestha
    5: 2,  // June → Asar
    6: 3,  // July → Shrawan
    7: 4,  // August → Bhadra
    8: 5,  // September → Ashwin
    9: 6,  // October → Kartik
    10: 7, // November → Mangsir
    11: 8, // December → Poush
  };

  const bsMonth = adMonthToBSMonth[adMonth];
  // BS year = AD year + 56 for months >= April (Baishakh), +57 for Jan-Mar
  const bsYear = adMonth >= 3 ? adYear + 56 : adYear + 57;

  return { month: bsMonth, year: bsYear };
}

function computeDeductions(config: AutoSalaryConfig): number {
  const taxNPR = config.taxMode === 'PERCENT'
    ? Math.round(config.basicSalary * (config.tax / 100))
    : config.tax;
  return config.pf + taxNPR + config.insurance;
}

function computeLeaveCut(config: AutoSalaryConfig, daysInMonth: number): number {
  // Auto-generated slips assume 0 extra leaves taken (accounts head can edit)
  return 0;
}

/**
 * POST — called on dashboard load to trigger monthly auto-generation.
 * Idempotent: skips if already generated for current month.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { month: currentMonth, year: currentYear } = getCurrentBSMonthYear();
  const configs = readConfigs().filter(
    c => c.collegeId === payload.collegeId && c.active
  );

  const generated: string[] = [];

  for (const config of configs) {
    // Skip if past until date
    if (
      currentYear > config.untilYear ||
      (currentYear === config.untilYear && currentMonth > config.untilMonth)
    ) {
      // Mark inactive
      config.active = false;
      continue;
    }

    // Skip if already generated this month
    if (
      config.lastGeneratedMonth === currentMonth &&
      config.lastGeneratedYear === currentYear
    ) {
      continue;
    }

    const payPeriod = `${NEPALI_MONTHS[currentMonth]} ${currentYear}`;
    const monthDays = DAYS_IN_MONTH[currentMonth];
    const deductions = computeDeductions(config);
    const leaveCut = computeLeaveCut(config, monthDays);
    const netSalary = config.basicSalary + config.allowances - deductions - leaveCut;

    // Try DB first, fall back to local JSON
    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      try {
        await prisma.salarySlip.create({
          data: {
            collegeId: payload.collegeId,
            userId: config.userId,
            basicSalary: config.basicSalary,
            allowances: config.allowances,
            deductions,
            netSalary,
            payPeriod,
            status: config.status,
            maxLeavesAllowed: config.maxLeavesAllowed,
            actualLeaves: 0,
            deductionType: config.deductionType,
            deductionValue: config.deductionValue,
            leaveCutAmount: leaveCut,
          }
        });
        generated.push(config.userId);
      } catch (err) {
        console.error('Auto-gen DB error:', err);
        isDbOnline = false; // fall through to local
      }
    }

    if (!isDbOnline) {
      const slips = readLocalSalaries();
      slips.push({
        id: `auto-${config.id}-${currentYear}-${currentMonth}`,
        collegeId: payload.collegeId,
        userId: config.userId,
        userName: config.userName,
        userRole: config.userRole,
        basicSalary: config.basicSalary,
        allowances: config.allowances,
        deductions,
        netSalary,
        payPeriod,
        status: config.status,
        maxLeavesAllowed: config.maxLeavesAllowed,
        actualLeaves: 0,
        deductionType: config.deductionType,
        deductionValue: config.deductionValue,
        leaveCutAmount: leaveCut,
        createdAt: new Date().toISOString(),
      });
      writeLocalSalaries(slips);
      generated.push(config.userId);
    }

    // Update last generated
    config.lastGeneratedMonth = currentMonth;
    config.lastGeneratedYear = currentYear;
  }

  // Persist updated configs
  writeConfigs(configs);

  return NextResponse.json({
    success: true,
    generated: generated.length,
    currentBSMonth: `${NEPALI_MONTHS[currentMonth]} ${currentYear}`,
  });
}
