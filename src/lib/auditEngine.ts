import fs from 'fs';
import path from 'path';
import prisma from './db';

export interface AuditEventPayload {
  moduleName: string; // e.g. 'RECEPTION', 'ACCOUNTS_OFFICER', 'ACCOUNTS_HEAD', 'PRINCIPAL', 'HR', 'EXAM', 'LIBRARY'
  entityType: string; // e.g. 'STUDENT', 'PAYMENT', 'SCHOLARSHIP', 'RECEIPT', 'REFUND', 'SALARY', 'FEE_STRUCTURE', 'DISCOUNT', 'FINE', 'EXAM_MARKS'
  entityId: string;
  referenceNumber?: string;
  studentId?: string;
  staffId?: string;
  createdBy: string; // User Name
  userRole: string; // e.g. 'ACCOUNTS_OFFICER', 'RECEPTION', 'PRINCIPAL', etc.
  department?: string;
  campus?: string;
  actionPerformed: string; // e.g. 'STUDENT_CREATED', 'PAYMENT_COLLECTED', 'SCHOLARSHIP_ASSIGNED', 'RECEIPT_LOCKED', 'REFUND_REQUESTED', 'REFUND_APPROVED', 'DISCOUNT_APPLIED', 'SALARY_PROCESSED', 'MARKS_UPDATED'
  previousValue?: any;
  newValue?: any;
  reason?: string;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'LOCKED' | 'SUSPICIOUS';
  ipAddress?: string;
  browser?: string;
  os?: string;
  device?: string;
  remarks?: string;
  attachments?: string[];
  collegeId?: string;
  amount?: number;
}

const mockAuditFilePath = path.join(process.cwd(), 'src', 'lib', 'mockFinancialAudit.json');

function readMockData() {
  try {
    if (fs.existsSync(mockAuditFilePath)) {
      const content = fs.readFileSync(mockAuditFilePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('AuditEngine: Error reading mock audit data:', e);
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
    console.error('AuditEngine: Error writing mock audit data:', e);
  }
}

export class AuditEngine {
  /**
   * Universal method to record structured audit events across both Prisma DB and Mock Fallback
   */
  static async recordEvent(payload: AuditEventPayload) {
    const timestampAD = new Date().toISOString();
    const dateStr = timestampAD.split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const auditId = `AUD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const eventRecord = {
      id: auditId,
      auditId,
      moduleName: payload.moduleName,
      entityType: payload.entityType,
      entityId: payload.entityId,
      referenceNumber: payload.referenceNumber || `REF-${Date.now()}`,
      studentId: payload.studentId || null,
      staffId: payload.staffId || null,
      user: payload.createdBy,
      createdBy: payload.createdBy,
      role: payload.userRole,
      userRole: payload.userRole,
      department: payload.department || 'General Administration',
      campus: payload.campus || 'Main Campus',
      action: payload.actionPerformed,
      actionPerformed: payload.actionPerformed,
      oldValue: payload.previousValue ? JSON.stringify(payload.previousValue) : null,
      previousValue: payload.previousValue || null,
      newValue: payload.newValue ? JSON.stringify(payload.newValue) : null,
      reason: payload.reason || payload.remarks || 'Automated audit event logged',
      approvalStatus: payload.approvalStatus || 'APPROVED',
      date: dateStr,
      time: timeStr,
      timezone: 'Asia/Kathmandu',
      ipAddress: payload.ipAddress || '192.168.1.100',
      browser: payload.browser || 'Chrome/NextJS Client',
      os: payload.os || 'macOS/Linux',
      device: payload.device || 'Desktop',
      remarks: payload.remarks || '',
      attachments: payload.attachments || [],
      amount: payload.amount || 0,
      createdAt: timestampAD
    };

    // 1. Write to Prisma DB if online
    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      try {
        await prisma.auditLog.create({
          data: {
            collegeId: payload.collegeId || 'college-default-id',
            userId: payload.staffId || 'system-user-id',
            action: payload.actionPerformed,
            details: `[${payload.moduleName}] ${payload.actionPerformed} on ${payload.entityType} (${payload.entityId}). Reason: ${payload.reason || 'N/A'}`
          }
        });
      } catch (err) {
        console.warn('Prisma audit log creation fallback to JSON mock mode:', err);
      }
    }

    // 2. Write to Mock Financial Audit JSON store (for offline mode & quick unified queries)
    const mockData = readMockData();
    if (!mockData.auditLogs) mockData.auditLogs = [];
    mockData.auditLogs.unshift(eventRecord);

    // 3. Automated Exception Engine Checks
    this.runExceptionDetection(mockData, eventRecord, payload);

    // 4. Automated Notification Dispatcher
    this.dispatchNotifications(mockData, eventRecord, payload);

    writeMockData(mockData);

    return eventRecord;
  }

  /**
   * Automated Exception Engine: Detects high-risk or suspicious actions
   */
  private static runExceptionDetection(mockData: any, eventRecord: any, payload: AuditEventPayload) {
    if (!mockData.suspiciousActivities) mockData.suspiciousActivities = [];

    const amount = payload.amount || 0;
    let isSuspicious = false;
    let riskLevel = 'LOW';
    let flagReason = '';

    // Rule 1: High Value Transaction (> NPR 50,000)
    if (amount > 50000 && payload.actionPerformed.includes('PAYMENT')) {
      isSuspicious = true;
      riskLevel = 'MEDIUM';
      flagReason = `High-value payment receipt of NPR ${amount.toLocaleString()} processed.`;
    }

    // Rule 2: Large Discount (> 20% or > NPR 10,000)
    if (payload.actionPerformed.includes('DISCOUNT') && (amount > 10000 || (payload.newValue?.discountPercent && payload.newValue.discountPercent > 20))) {
      isSuspicious = true;
      riskLevel = 'HIGH';
      flagReason = `Large fee discount applied: NPR ${amount} / ${payload.newValue?.discountPercent || 'High'}%. Requires Accounts Head audit.`;
    }

    // Rule 3: Deleted Payment / Cancelled Receipt
    if (payload.actionPerformed.includes('DELETE') || payload.actionPerformed.includes('CANCEL')) {
      isSuspicious = true;
      riskLevel = 'CRITICAL';
      flagReason = `Financial record deletion/cancellation performed on ${payload.entityType} (${payload.referenceNumber || payload.entityId}) by ${payload.createdBy}.`;
    }

    // Rule 4: Backdated Transaction
    if (payload.previousValue?.backdated || payload.reason?.toLowerCase().includes('backdate')) {
      isSuspicious = true;
      riskLevel = 'HIGH';
      flagReason = `Backdated financial transaction logged for date ${eventRecord.date}.`;
    }

    // Rule 5: Refund Request
    if (payload.actionPerformed.includes('REFUND')) {
      isSuspicious = true;
      riskLevel = 'HIGH';
      flagReason = `Refund request of NPR ${amount} initiated for Student ID ${payload.studentId || 'N/A'}.`;
    }

    if (isSuspicious) {
      const suspiciousEntry = {
        id: `SUSP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        transactionId: payload.referenceNumber || payload.entityId,
        studentName: payload.newValue?.studentName || payload.studentId || 'Student Record',
        amount: amount,
        reason: flagReason,
        detectedAt: `${eventRecord.date} ${eventRecord.time}`,
        riskLevel: riskLevel,
        status: 'PENDING_AUDIT',
        createdBy: payload.createdBy,
        userRole: payload.userRole
      };
      mockData.suspiciousActivities.unshift(suspiciousEntry);
    }
  }

  /**
   * Automated Notification Dispatcher for Accounts Head, Principal, and Vice Principal
   */
  private static dispatchNotifications(mockData: any, eventRecord: any, payload: AuditEventPayload) {
    if (!mockData.notifications) mockData.notifications = [];

    const criticalActions = ['REFUND_REQUESTED', 'LARGE_DISCOUNT', 'RECEIPT_CANCELLED', 'PAYMENT_DELETED', 'HIGH_VALUE_PAYMENT', 'SCHOLARSHIP_ASSIGNED'];
    
    if (criticalActions.some(action => payload.actionPerformed.toUpperCase().includes(action))) {
      const notification = {
        id: `NOTIF-${Date.now()}`,
        title: `Financial Audit Alert: ${payload.actionPerformed.replace(/_/g, ' ')}`,
        message: `Action '${payload.actionPerformed}' on ${payload.entityType} (${payload.referenceNumber || payload.entityId}) by ${payload.createdBy} (${payload.userRole}).`,
        targetRoles: ['ACCOUNTS_HEAD', 'PRINCIPAL', 'VICE_PRINCIPAL'],
        entityId: payload.entityId,
        entityType: payload.entityType,
        createdAt: eventRecord.createdAt,
        isRead: false
      };
      mockData.notifications.unshift(notification);
    }
  }

  /**
   * Fetch Universal Timeline history for any entity (Student, Payment, Scholarship, Refund, Salary)
   */
  static getUniversalTimeline(entityId: string, studentId?: string) {
    const mockData = readMockData();
    const allLogs = mockData.auditLogs || [];

    const filteredLogs = allLogs.filter((log: any) => {
      if (log.entityId === entityId) return true;
      if (log.studentId === entityId) return true;
      if (studentId && (log.studentId === studentId || log.entityId === studentId)) return true;
      if (log.referenceNumber && log.referenceNumber === entityId) return true;
      return false;
    });

    return filteredLogs.sort((a: any, b: any) => new Date(b.createdAt || a.date).getTime() - new Date(a.createdAt || b.date).getTime());
  }

  /**
   * Check if a receipt is locked
   */
  static isReceiptLocked(receiptNumberOrId: string): boolean {
    const mockData = readMockData();
    const receiptStates = mockData.receiptStates || [];
    const found = receiptStates.find((r: any) => r.receiptNumber === receiptNumberOrId || r.id === receiptNumberOrId);
    return found ? (found.status === 'LOCKED' || found.status === 'ARCHIVED') : false;
  }

  /**
   * Lock a receipt and record audit trail
   */
  static lockReceipt(receiptNumberOrId: string, lockedBy: string, reason: string) {
    const mockData = readMockData();
    if (!mockData.receiptStates) mockData.receiptStates = [];

    let found = mockData.receiptStates.find((r: any) => r.receiptNumber === receiptNumberOrId || r.id === receiptNumberOrId);
    if (!found) {
      found = { id: receiptNumberOrId, receiptNumber: receiptNumberOrId, status: 'LOCKED', lockedBy, lockedAt: new Date().toISOString(), reason };
      mockData.receiptStates.push(found);
    } else {
      found.status = 'LOCKED';
      found.lockedBy = lockedBy;
      found.lockedAt = new Date().toISOString();
      found.reason = reason;
    }

    writeMockData(mockData);

    this.recordEvent({
      moduleName: 'ACCOUNTS_HEAD',
      entityType: 'RECEIPT',
      entityId: receiptNumberOrId,
      referenceNumber: receiptNumberOrId,
      createdBy: lockedBy,
      userRole: 'ACCOUNTS_HEAD',
      actionPerformed: 'RECEIPT_LOCKED',
      reason: reason || 'Receipt locked by Accounts Head after audit verification.',
      approvalStatus: 'LOCKED'
    });

    return found;
  }
}
