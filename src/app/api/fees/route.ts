import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { FeeStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('studentId');
    const mode = searchParams.get('mode'); // 'allocations' | 'history' | 'structures'

    let studentId = studentIdParam;

    // Student default profile lookup
    if (payload.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: payload.userId },
      });
      if (student) studentId = student.id;
    } else if (payload.role === 'PARENT') {
      if (!studentIdParam) {
        const parent = await prisma.parent.findUnique({
          where: { userId: payload.userId },
          include: { students: true },
        });
        if (parent && parent.students.length > 0) {
          studentId = parent.students[0].id;
        }
      }
    }

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      // 1. Fetch current allocated bills (for student/parent or officer verification)
      if (mode === 'allocations' || !mode) {
        if (!studentId && !['ADMIN', 'ACCOUNTS_HEAD', 'ACCOUNTS_OFFICER', 'PRINCIPAL'].includes(payload.role)) {
          return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
        }

        const allocations = await prisma.feeAllocation.findMany({
          where: {
            collegeId: payload.collegeId,
            ...(studentId && { studentId }),
          },
          include: {
            feeStructure: true,
            student: {
              select: {
                rollNumber: true,
                user: { select: { name: true } },
                class: { select: { name: true, section: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ allocations });
      }

      // 2. Fetch payment receipt transaction history
      if (mode === 'history') {
        if (!studentId && !['ADMIN', 'ACCOUNTS_HEAD', 'ACCOUNTS_OFFICER', 'PRINCIPAL'].includes(payload.role)) {
          return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
        }

        const payments = await prisma.payment.findMany({
          where: {
            collegeId: payload.collegeId,
            feeAllocation: {
              ...(studentId && { studentId }),
            },
          },
          include: {
            feeAllocation: {
              include: { feeStructure: true },
            },
            verifiedBy: { select: { name: true } },
          },
          orderBy: { paymentDateAD: 'desc' },
        });

        return NextResponse.json({ payments });
      }

      // 3. Fetch generic fee structures by class (for building billing layouts)
      if (mode === 'structures') {
        const structures = await prisma.feeStructure.findMany({
          where: { collegeId: payload.collegeId },
          include: { class: true },
          orderBy: { dueDateAD: 'desc' },
        });
        return NextResponse.json({ structures });
      }
    } else {
      // C. Offline local JSON mode query
      const STRUCT_PATH = path.join(process.cwd(), 'src', 'lib', 'mockFeeStructures.json');
      const ALLOC_PATH = path.join(process.cwd(), 'src', 'lib', 'mockFeeAllocations.json');

      if (mode === 'structures') {
        let structures = [];
        if (fs.existsSync(STRUCT_PATH)) {
          structures = JSON.parse(fs.readFileSync(STRUCT_PATH, 'utf-8'));
        } else {
          structures = [
            {
              id: 'mock-fee-struct-seed',
              title: 'Tuition Fee - Shrawan 2083',
              amount: 8500,
              dueDateAD: new Date(2026, 7, 1).toISOString(),
              dueDateBS: '2083-04-18',
              classId: 'mock-class-id'
            }
          ];
          fs.writeFileSync(STRUCT_PATH, JSON.stringify(structures, null, 2));
        }
        return NextResponse.json({ structures });
      }

      if (mode === 'allocations' || !mode) {
        let allocations = [];
        if (fs.existsSync(ALLOC_PATH)) {
          allocations = JSON.parse(fs.readFileSync(ALLOC_PATH, 'utf-8'));
        } else {
          allocations = [
            {
              id: 'mock-alloc-seed',
              collegeId: payload.collegeId,
              studentId: 'mock-student-profile-id',
              feeStructureId: 'mock-fee-struct-seed',
              amountPaid: 5000.0,
              dueAmount: 3500.0,
              status: 'PARTIAL',
              createdAt: new Date().toISOString(),
              feeStructure: {
                id: 'mock-fee-struct-seed',
                title: 'Tuition Fee - Shrawan 2083',
                amount: 8500,
                dueDateAD: new Date(2026, 7, 1).toISOString(),
                dueDateBS: '2083-04-18'
              },
              student: {
                rollNumber: '12',
                user: { name: 'Niranjan Thapa' },
                class: { name: 'Grade 11', section: 'Science-A' }
              }
            }
          ];
          fs.writeFileSync(ALLOC_PATH, JSON.stringify(allocations, null, 2));
        }

        // Filter by studentId if query is made from student/parent portal
        if (studentId) {
          allocations = allocations.filter((a: any) => a.studentId === studentId);
        }

        return NextResponse.json({ allocations });
      }

      if (mode === 'history') {
        return NextResponse.json({ payments: [] });
      }
    }

    return NextResponse.json({ error: 'Invalid mode parameter' }, { status: 400 });
  } catch (error) {
    console.error('Fees query error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['ACCOUNTS_HEAD', 'ACCOUNTS_OFFICER', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    // A. Action: Create Fee Structure
    if (action === 'create_structure') {
      const { title, amount, dueDateBS, classId } = body;
      if (!title || amount === undefined || !dueDateBS) {
        return NextResponse.json({ error: 'Missing title, amount, or dueDateBS' }, { status: 400 });
      }

      const parsedAmount = parseFloat(amount);
      const dueDateAD = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      if (isDbOnline) {
        const structure = await prisma.feeStructure.create({
          data: {
            collegeId: payload.collegeId,
            title,
            amount: parsedAmount,
            dueDateAD,
            dueDateBS,
            classId: classId && classId !== 'ALL' ? classId : null,
          }
        });

        // Fetch students in this class
        const students = await prisma.student.findMany({
          where: {
            collegeId: payload.collegeId,
            ...(classId && classId !== 'ALL' && { classId }),
          }
        });

        // Allocate this fee structure to matching students
        if (students.length > 0) {
          const allocationsData = students.map(student => ({
            collegeId: payload.collegeId,
            studentId: student.id,
            feeStructureId: structure.id,
            amountPaid: 0.0,
            dueAmount: parsedAmount,
            status: FeeStatus.UNPAID
          }));

          await prisma.feeAllocation.createMany({
            data: allocationsData
          });
        }

        // Audit Log
        await prisma.auditLog.create({
          data: {
            collegeId: payload.collegeId,
            userId: payload.userId,
            action: 'CREATE_FEE_STRUCTURE',
            details: `Created Fee Structure: "${title}" of NPR ${parsedAmount} for class ${classId || 'ALL'}`
          }
        });

        return NextResponse.json({ success: true, structure });
      } else {
        // Fallback local file mode
        const STRUCT_PATH = path.join(process.cwd(), 'src', 'lib', 'mockFeeStructures.json');
        const ALLOC_PATH = path.join(process.cwd(), 'src', 'lib', 'mockFeeAllocations.json');

        // Load structures
        let structures: any[] = [];
        if (fs.existsSync(STRUCT_PATH)) {
          structures = JSON.parse(fs.readFileSync(STRUCT_PATH, 'utf-8'));
        } else {
          structures = [
            {
              id: 'mock-fee-struct-seed',
              title: 'Tuition Fee - Shrawan 2083',
              amount: 8500,
              dueDateAD: new Date(2026, 7, 1).toISOString(),
              dueDateBS: '2083-04-18',
              classId: 'mock-class-id'
            }
          ];
        }

        const newStruct = {
          id: `struct-local-${Date.now()}`,
          title,
          amount: parsedAmount,
          dueDateAD: dueDateAD.toISOString(),
          dueDateBS,
          classId: classId && classId !== 'ALL' ? classId : 'mock-class-id'
        };
        structures.push(newStruct);
        fs.writeFileSync(STRUCT_PATH, JSON.stringify(structures, null, 2));

        // Generate local allocations for mock students
        let allocations: any[] = [];
        if (fs.existsSync(ALLOC_PATH)) {
          allocations = JSON.parse(fs.readFileSync(ALLOC_PATH, 'utf-8'));
        }

        // Mock students
        const mockStudents = [
          { id: 'mock-student-profile-id', name: 'Niranjan Thapa', rollNumber: '12', class: { name: 'Grade 11', section: 'Science-A' } },
          { id: 'stud-2', name: 'Alok Regmi', rollNumber: '03', class: { name: 'Grade 11', section: 'Science-A' } },
          { id: 'stud-3', name: 'Priya Adhikari', rollNumber: '24', class: { name: 'Grade 11', section: 'Science-A' } }
        ];

        mockStudents.forEach(st => {
          allocations.push({
            id: `alloc-local-${st.id}-${Date.now()}`,
            collegeId: payload.collegeId,
            studentId: st.id,
            feeStructureId: newStruct.id,
            amountPaid: 0.0,
            dueAmount: parsedAmount,
            status: 'UNPAID',
            createdAt: new Date().toISOString(),
            feeStructure: newStruct,
            student: {
              rollNumber: st.rollNumber,
              user: { name: st.name },
              class: { name: st.class.name, section: st.class.section }
            }
          });
        });

        fs.writeFileSync(ALLOC_PATH, JSON.stringify(allocations, null, 2));
        return NextResponse.json({ success: true, structure: newStruct });
      }
    }

    // B. Action: Process Fee Collection (Receipt Generation)
    const { feeAllocationId, amountPaid, paymentMethod, paymentDateBS, transactionId } = body;

    if (!feeAllocationId || !amountPaid || !paymentMethod || !paymentDateBS) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (isDbOnline) {
      const allocation = await prisma.feeAllocation.findUnique({
        where: { id: feeAllocationId },
        include: { feeStructure: true },
      });

      if (!allocation) {
        return NextResponse.json({ error: 'Allocation record not found' }, { status: 404 });
      }

      const payAmt = parseFloat(amountPaid);
      const newAmountPaid = allocation.amountPaid + payAmt;
      const newDueAmount = Math.max(0, allocation.dueAmount - payAmt);
      const newStatus = newDueAmount === 0 ? FeeStatus.PAID : FeeStatus.PARTIAL;

      const receiptNumber = `REC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const [payment] = await prisma.$transaction([
        prisma.payment.create({
          data: {
            collegeId: payload.collegeId,
            feeAllocationId: feeAllocationId,
            amount: payAmt,
            paymentDateAD: new Date(),
            paymentDateBS,
            paymentMethod,
            transactionId,
            receiptNumber,
            verifiedById: payload.userId,
          },
        }),
        prisma.feeAllocation.update({
          where: { id: feeAllocationId },
          data: {
            amountPaid: newAmountPaid,
            dueAmount: newDueAmount,
            status: newStatus,
          },
        }),
      ]);

      await prisma.auditLog.create({
        data: {
          collegeId: payload.collegeId,
          userId: payload.userId,
          action: 'COLLECT_FEE',
          details: `Collected NPR ${payAmt} for bill "${allocation.feeStructure.title}", Receipt: ${receiptNumber}`,
        },
      });

      return NextResponse.json({ success: true, payment });
    } else {
      // Local fallback mode for payment receipting
      const ALLOC_PATH = path.join(process.cwd(), 'src', 'lib', 'mockFeeAllocations.json');
      if (!fs.existsSync(ALLOC_PATH)) {
        return NextResponse.json({ error: 'No allocations found in mock mode.' }, { status: 404 });
      }

      let allocations = JSON.parse(fs.readFileSync(ALLOC_PATH, 'utf-8'));
      const idx = allocations.findIndex((a: any) => a.id === feeAllocationId);
      if (idx === -1) {
        return NextResponse.json({ error: 'Allocation not found in mock list.' }, { status: 404 });
      }

      const allocation = allocations[idx];
      const payAmt = parseFloat(amountPaid);
      allocation.amountPaid += payAmt;
      allocation.dueAmount = Math.max(0, allocation.dueAmount - payAmt);
      allocation.status = allocation.dueAmount === 0 ? 'PAID' : 'PARTIAL';

      allocations[idx] = allocation;
      fs.writeFileSync(ALLOC_PATH, JSON.stringify(allocations, null, 2));

      return NextResponse.json({
        success: true,
        payment: {
          receiptNumber: `REC-MOCK-${Date.now()}`,
          amount: payAmt,
          paymentDateBS,
          paymentMethod
        }
      });
    }
  } catch (error) {
    console.error('Record payment error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
