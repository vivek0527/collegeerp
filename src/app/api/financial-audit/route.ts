import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { AuditEngine } from '@/lib/auditEngine';
import fs from 'fs';
import path from 'path';

const mockAuditFilePath = path.join(process.cwd(), 'src', 'lib', 'mockFinancialAudit.json');

function readMockData() {
  try {
    if (fs.existsSync(mockAuditFilePath)) {
      const content = fs.readFileSync(mockAuditFilePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading mock audit data:', e);
  }
  return {
    transactions: [],
    auditLogs: [],
    cashReconciliations: [],
    bankReconciliations: [],
    scholarships: [],
    refunds: [],
    suspiciousActivities: [],
    vaultDocuments: [],
    notifications: [],
    receiptStates: []
  };
}

function writeMockData(data: any) {
  try {
    fs.writeFileSync(mockAuditFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing mock audit data:', e);
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'dashboard';
    const entityId = searchParams.get('entityId');
    const studentId = searchParams.get('studentId');

    const mockData = readMockData();

    // 1. Universal Timeline Mode
    if (mode === 'timeline') {
      const targetId = entityId || studentId || payload.userId;
      const timeline = AuditEngine.getUniversalTimeline(targetId, studentId || undefined);
      return NextResponse.json({ timeline, entityId: targetId });
    }

    // 2. Real-time Notifications Mode
    if (mode === 'notifications') {
      const notifs = (mockData.notifications || []).filter((n: any) =>
        !n.targetRoles || n.targetRoles.includes(payload.role) || payload.role === 'ADMIN'
      );
      return NextResponse.json({ notifications: notifs });
    }

    // 3. Check Receipt Lock Status
    if (mode === 'receipt-lock') {
      const isLocked = AuditEngine.isReceiptLocked(entityId || '');
      return NextResponse.json({ isLocked, entityId });
    }

    if (mode === 'transactions') {
      return NextResponse.json({ transactions: mockData.transactions || [] });
    } else if (mode === 'approvals') {
      const pending = (mockData.transactions || []).filter(
        (t: any) => t.verificationStatus === 'PENDING_VERIFICATION' || t.verificationStatus === 'UNDER_REVIEW'
      );
      return NextResponse.json({ pendingApprovals: pending });
    } else if (mode === 'audit-logs') {
      return NextResponse.json({ auditLogs: mockData.auditLogs || [] });
    } else if (mode === 'cash-recon') {
      return NextResponse.json({ reconciliations: mockData.cashReconciliations || [] });
    } else if (mode === 'bank-recon') {
      return NextResponse.json({ reconciliations: mockData.bankReconciliations || [] });
    } else if (mode === 'scholarship-audit') {
      return NextResponse.json({ scholarships: mockData.scholarships || [] });
    } else if (mode === 'refund-audit') {
      return NextResponse.json({ refunds: mockData.refunds || [] });
    } else if (mode === 'suspicious') {
      return NextResponse.json({ suspiciousActivities: mockData.suspiciousActivities || [] });
    } else if (mode === 'vault') {
      return NextResponse.json({ vaultDocuments: mockData.vaultDocuments || [] });
    } else if (mode === 'compliance') {
      const pendingCount = (mockData.transactions || []).filter((t: any) => t.verificationStatus === 'PENDING_VERIFICATION').length;
      const suspiciousCount = (mockData.suspiciousActivities || []).filter((s: any) => s.status !== 'RESOLVED').length;
      const unverifiedCount = (mockData.cashReconciliations || []).filter((c: any) => c.status === 'DISCREPANCY').length;
      return NextResponse.json({
        complianceSummary: {
          pendingAudits: pendingCount,
          missingReceipts: 0,
          unverifiedTransactions: pendingCount,
          suspiciousActivities: suspiciousCount,
          overdueApprovals: 1,
          financialAlerts: unverifiedCount
        }
      });
    }

    // Default mode: dashboard analytics metrics
    const txList = mockData.transactions || [];
    const totalCollected = txList.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
    const totalDiscounts = txList.reduce((acc: number, t: any) => acc + (t.discount || 0), 0);
    const totalScholarships = (mockData.scholarships || []).reduce((acc: number, s: any) => acc + (s.amount || 0), 0);

    return NextResponse.json({
      metrics: {
        totalRevenueToday: 48500,
        totalRevenueThisMonth: totalCollected + 150000,
        totalRevenueThisYear: 2450000,
        totalFeesCollected: totalCollected,
        outstandingFees: 84500,
        pendingPayments: 18500,
        refundRequests: (mockData.refunds || []).length,
        pendingApprovalsCount: txList.filter((t: any) => t.verificationStatus === 'PENDING_VERIFICATION').length,
        scholarshipsGiven: totalScholarships,
        cashCollection: txList.filter((t: any) => t.paymentMethod === 'CASH').reduce((acc: number, t: any) => acc + t.amount, 0),
        onlinePayments: txList.filter((t: any) => t.paymentMethod !== 'CASH').reduce((acc: number, t: any) => acc + t.amount, 0),
        departmentRevenue: [
          { name: 'Science Dept', revenue: 1450000 },
          { name: 'Management Dept', revenue: 780000 },
          { name: 'Humanities Dept', revenue: 220000 }
        ],
        collectionTarget: 3000000,
        collectionAchievement: Math.round(((totalCollected + 150000) / 3000000) * 100)
      }
    });
  } catch (error: any) {
    console.error('Financial Audit GET API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, transactionId, receiptNumber, status, remarks, oldStatus, newStatus, reason, adjustmentAmount, adjustmentReason, scholarshipId, refundId, notifId } = body;

    const mockData = readMockData();

    // 1. Action: Maker-Checker Transaction Verification
    if (action === 'VERIFY_TRANSACTION') {
      const tx = mockData.transactions.find((t: any) => t.id === transactionId || t.receiptNumber === transactionId);
      if (tx) {
        tx.verificationStatus = status;
        tx.verifiedBy = payload.name || 'Accounts Head';
        tx.verifiedAt = new Date().toISOString().split('T')[0];
        if (remarks) tx.remarks = remarks;

        // Emit audit event via Central AuditEngine
        await AuditEngine.recordEvent({
          moduleName: 'ACCOUNTS_HEAD',
          entityType: 'TRANSACTION',
          entityId: tx.receiptNumber || tx.id,
          referenceNumber: tx.receiptNumber,
          studentId: tx.studentId,
          createdBy: payload.name || 'Accounts Head',
          userRole: payload.role || 'ACCOUNTS_HEAD',
          actionPerformed: `TRANSACTION_${status}`,
          previousValue: oldStatus || 'PENDING_VERIFICATION',
          newValue: status,
          reason: reason || remarks || 'Maker-checker audit action applied.',
          approvalStatus: status === 'VERIFIED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'UNDER_REVIEW',
          amount: tx.amount
        });

        writeMockData(mockData);
        return NextResponse.json({ success: true, transaction: tx });
      }
      return NextResponse.json({ error: 'Transaction record not found' }, { status: 404 });
    }

    // 2. Action: Lock Receipt
    if (action === 'LOCK_RECEIPT') {
      const recNo = receiptNumber || transactionId;
      if (!recNo) return NextResponse.json({ error: 'Missing receipt number' }, { status: 400 });

      const lockResult = AuditEngine.lockReceipt(recNo, payload.name || 'Accounts Head', reason || 'Locked after audit verification.');
      return NextResponse.json({ success: true, receiptState: lockResult });
    }

    // 3. Action: Create Adjustment Entry for Locked Receipts
    if (action === 'CREATE_ADJUSTMENT') {
      const recNo = receiptNumber || transactionId;
      if (!recNo) return NextResponse.json({ error: 'Missing receipt number' }, { status: 400 });

      const adjAmount = Number(adjustmentAmount) || 0;
      const adjustmentRecord = {
        id: `ADJ-${Date.now()}`,
        receiptNumber: recNo,
        amount: adjAmount,
        reason: adjustmentReason || 'Financial correction entry applied to locked receipt.',
        createdBy: payload.name || 'Accounts Head',
        createdAt: new Date().toISOString()
      };

      await AuditEngine.recordEvent({
        moduleName: 'ACCOUNTS_HEAD',
        entityType: 'ADJUSTMENT_ENTRY',
        entityId: recNo,
        referenceNumber: recNo,
        createdBy: payload.name || 'Accounts Head',
        userRole: payload.role || 'ACCOUNTS_HEAD',
        actionPerformed: 'ADJUSTMENT_CREATED',
        newValue: adjustmentRecord,
        reason: adjustmentReason || 'Additive adjustment entry logged for locked receipt.',
        amount: adjAmount
      });

      return NextResponse.json({ success: true, adjustment: adjustmentRecord });
    }

    // 4. Action: Approve/Reject Scholarship Workflow
    if (action === 'APPROVE_SCHOLARSHIP' || action === 'REJECT_SCHOLARSHIP') {
      const sch = mockData.scholarships.find((s: any) => s.id === scholarshipId);
      if (sch) {
        sch.status = action === 'APPROVE_SCHOLARSHIP' ? 'APPROVED' : 'REJECTED';
        sch.approvedBy = payload.name || 'Principal / Accounts Head';
        writeMockData(mockData);

        await AuditEngine.recordEvent({
          moduleName: payload.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'ACCOUNTS_HEAD',
          entityType: 'SCHOLARSHIP',
          entityId: sch.id,
          studentId: sch.studentId,
          createdBy: payload.name || 'Authorized Approver',
          userRole: payload.role,
          actionPerformed: sch.status === 'APPROVED' ? 'SCHOLARSHIP_APPROVED' : 'SCHOLARSHIP_REJECTED',
          previousValue: 'PENDING_APPROVAL',
          newValue: sch.status,
          reason: remarks || 'Scholarship workflow status updated.',
          amount: sch.amount
        });

        return NextResponse.json({ success: true, scholarship: sch });
      }
      return NextResponse.json({ error: 'Scholarship record not found' }, { status: 404 });
    }

    // 5. Action: Approve/Reject Refund Workflow
    if (action === 'APPROVE_REFUND' || action === 'REJECT_REFUND') {
      const ref = mockData.refunds.find((r: any) => r.id === refundId);
      if (ref) {
        ref.status = action === 'APPROVE_REFUND' ? 'APPROVED' : 'REJECTED';
        ref.approvedBy = payload.name || 'Accounts Head';
        writeMockData(mockData);

        await AuditEngine.recordEvent({
          moduleName: 'ACCOUNTS_HEAD',
          entityType: 'REFUND',
          entityId: ref.id,
          referenceNumber: ref.receiptNumber,
          studentId: ref.studentId,
          createdBy: payload.name || 'Accounts Head',
          userRole: payload.role || 'ACCOUNTS_HEAD',
          actionPerformed: ref.status === 'APPROVED' ? 'REFUND_APPROVED' : 'REFUND_REJECTED',
          previousValue: 'PENDING_APPROVAL',
          newValue: ref.status,
          reason: remarks || 'Refund request verified and decision recorded.',
          amount: ref.amount
        });

        return NextResponse.json({ success: true, refund: ref });
      }
      return NextResponse.json({ error: 'Refund request record not found' }, { status: 404 });
    }

    // 6. Action: Add Daily Cash Reconciliation
    if (action === 'ADD_CASH_RECON') {
      const newRecon = {
        id: `recon-${Date.now()}`,
        date: body.date || new Date().toISOString().split('T')[0],
        collector: body.collector || 'Kamal Sharma',
        cashCollected: Number(body.cashCollected) || 0,
        cashDeposited: Number(body.cashDeposited) || 0,
        expectedCash: Number(body.expectedCash) || 0,
        actualCash: Number(body.actualCash) || 0,
        difference: (Number(body.actualCash) || 0) - (Number(body.expectedCash) || 0),
        status: (Number(body.actualCash) || 0) === (Number(body.expectedCash) || 0) ? 'BALANCED' : 'DISCREPANCY',
        verifiedBy: payload.name || 'Accounts Head',
        verifiedAt: new Date().toLocaleString()
      };
      mockData.cashReconciliations.unshift(newRecon);
      writeMockData(mockData);

      await AuditEngine.recordEvent({
        moduleName: 'ACCOUNTS_HEAD',
        entityType: 'CASH_RECONCILIATION',
        entityId: newRecon.id,
        createdBy: payload.name || 'Accounts Head',
        userRole: payload.role || 'ACCOUNTS_HEAD',
        actionPerformed: 'CASH_RECONCILIATION_LOGGED',
        newValue: newRecon,
        amount: newRecon.actualCash
      });

      return NextResponse.json({ success: true, reconciliation: newRecon });
    }

    // 7. Action: Mark Notification Read
    if (action === 'MARK_NOTIFICATION_READ') {
      const notif = mockData.notifications.find((n: any) => n.id === notifId);
      if (notif) {
        notif.isRead = true;
        writeMockData(mockData);
        return NextResponse.json({ success: true, notification: notif });
      }
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    console.error('Financial Audit POST API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
