import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'lib', 'mockSalaryAutoConfigs.json');

export interface AutoSalaryConfig {
  id: string;
  collegeId: string;
  userId: string;
  userName: string;
  userRole: string;
  basicSalary: number;
  allowances: number;
  pf: number;
  tax: number;
  taxMode: 'FLAT' | 'PERCENT';
  insurance: number;
  status: string;
  maxLeavesAllowed: number;
  deductionType: string;
  deductionValue: number;
  // Until period (Nepali BS)
  untilMonth: number; // 0-indexed
  untilYear: number;
  // Track last generated
  lastGeneratedMonth: number | null;
  lastGeneratedYear: number | null;
  active: boolean;
  createdAt: string;
}

function readConfigs(): AutoSalaryConfig[] {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return [];
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeConfigs(configs: AutoSalaryConfig[]) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(configs, null, 2));
}

// GET — list all active auto-configs for this college
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const all = readConfigs().filter(c => c.collegeId === payload.collegeId);
  return NextResponse.json({ configs: all });
}

// POST — create a new auto-generate config
export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload || !['ACCOUNTS_HEAD', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const {
    userId, userName, userRole,
    basicSalary, allowances, pf, tax, taxMode, insurance,
    status, maxLeavesAllowed, deductionType, deductionValue,
    untilMonth, untilYear
  } = body;

  if (!userId || basicSalary === undefined || untilMonth === undefined || !untilYear) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const configs = readConfigs();
  const newConfig: AutoSalaryConfig = {
    id: `auto-${Date.now()}`,
    collegeId: payload.collegeId,
    userId,
    userName: userName || 'Employee',
    userRole: userRole || 'STAFF',
    basicSalary: parseFloat(basicSalary),
    allowances: parseFloat(allowances || 0),
    pf: parseFloat(pf || 0),
    tax: parseFloat(tax || 0),
    taxMode: taxMode || 'FLAT',
    insurance: parseFloat(insurance || 0),
    status: status || 'UNPAID',
    maxLeavesAllowed: parseInt(maxLeavesAllowed || 2),
    deductionType: deductionType || 'AUTO_PER_DAY',
    deductionValue: parseFloat(deductionValue || 0),
    untilMonth: parseInt(untilMonth),
    untilYear: parseInt(untilYear),
    lastGeneratedMonth: null,
    lastGeneratedYear: null,
    active: true,
    createdAt: new Date().toISOString(),
  };

  configs.push(newConfig);
  writeConfigs(configs);
  return NextResponse.json({ success: true, config: newConfig });
}

// DELETE — deactivate / remove an auto-config
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyJWT(token);
  if (!payload || !['ACCOUNTS_HEAD', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const configs = readConfigs().filter(c => c.id !== id);
  writeConfigs(configs);
  return NextResponse.json({ success: true });
}
