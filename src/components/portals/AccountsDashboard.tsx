'use client';

import React, { useEffect, useState } from 'react';
import styles from './DashboardComponents.module.css';
import { useDate } from '../DateContext';
import AcademicCalendarManager from './AcademicCalendarManager';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle,
  FileText,
  User,
  Trash2,
  Users,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Download,
  CheckSquare,
  XCircle,
  HelpCircle,
  Lock,
  PieChart,
  BarChart3,
  Eye,
  RefreshCw,
  FileCheck,
  Layers,
  Filter,
  AlertOctagon,
  Check,
} from 'lucide-react';

export default function AccountsDashboard({ subPage }: { subPage?: string }) {
  const { formatDate } = useDate();
  
  // Data State
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [feeAllocations, setFeeAllocations] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [autoConfigs, setAutoConfigs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Advanced search/filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL');
  const activeTab = subPage?.toLowerCase() || 'dashboard';

  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Financial Audit Module States
  const [auditSubTab, setAuditSubTab] = useState('dashboard');
  const [auditMetrics, setAuditMetrics] = useState<any>(null);
  const [auditTransactions, setAuditTransactions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [cashRecons, setCashRecons] = useState<any[]>([]);
  const [bankRecons, setBankRecons] = useState<any[]>([]);
  const [scholarshipAudits, setScholarshipAudits] = useState<any[]>([]);
  const [refundAudits, setRefundAudits] = useState<any[]>([]);
  const [suspiciousList, setSuspiciousList] = useState<any[]>([]);
  const [vaultDocs, setVaultDocs] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any>(null);

  // Audit filter states
  const [auditSearch, setAuditSearch] = useState('');
  const [auditDeptFilter, setAuditDeptFilter] = useState('ALL');
  const [auditMethodFilter, setAuditMethodFilter] = useState('ALL');
  const [auditVerifFilter, setAuditVerifFilter] = useState('ALL');

  // Approval Modal state
  const [selectedAuditTx, setSelectedAuditTx] = useState<any>(null);
  const [auditRemarksText, setAuditRemarksText] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Form State
  const [selectedAllocationId, setSelectedAllocationId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDateBS, setPaymentDateBS] = useState('2083-03-17');
  
  // Student Fee Structure Creation form states
  const [structTitle, setStructTitle] = useState('');
  const [structAmount, setStructAmount] = useState('');
  const [structDueDateBS, setStructDueDateBS] = useState('2083-04-18');
  const [structClassId, setStructClassId] = useState('ALL');
  const [structMsg, setStructMsg] = useState({ text: '', type: '' });

  // Nepali months list
  const NEPALI_MONTHS = [
    'Baishakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  // Nepali BS years range (current ± 5)
  const currentBSYear = 2083;
  const BS_YEARS = Array.from({ length: 11 }, (_, i) => currentBSYear - 5 + i);
  // Days per month for navigation (approximate for UI)
  const DAYS_IN_MONTH = [31, 31, 32, 32, 31, 31, 30, 29, 30, 29, 30, 30];

  // Employee Salary Slip Creation form states
  const [salUserId, setSalUserId] = useState('mock-teacher-id');
  const [salBasic, setSalBasic] = useState('55000');
  const [salAllowances, setSalAllowances] = useState('3500');
  const [salPF, setSalPF] = useState('0');          // Provident Fund
  const [salTax, setSalTax] = useState('0');         // Income Tax / TDS value
  const [salTaxMode, setSalTaxMode] = useState<'FLAT' | 'PERCENT'>('FLAT'); // flat NPR or % of basic
  const [salInsurance, setSalInsurance] = useState('0'); // Insurance Premium
  const [salStatus, setSalStatus] = useState('PAID');
  const [salMaxLeaves, setSalMaxLeaves] = useState('2');
  const [salActualLeaves, setSalActualLeaves] = useState('0');
  const [salDeductionType, setSalDeductionType] = useState('AUTO_PER_DAY');
  const [salDeductionValue, setSalDeductionValue] = useState('0');
  const [salMsg, setSalMsg] = useState({ text: '', type: '' });

  // Auto-generate monthly settings
  const [salAutoGenerate, setSalAutoGenerate] = useState(false);
  const [salAutoUntilMonth, setSalAutoUntilMonth] = useState(11); // Chaitra
  const [salAutoUntilYear, setSalAutoUntilYear] = useState(2083);

  // Pay Period Picker states (Nepali calendar)
  const [salPeriodMode, setSalPeriodMode] = useState<'MONTH' | 'RANGE'>('MONTH');
  const [salPeriodMonth, setSalPeriodMonth] = useState(2); // 0-indexed → Asar
  const [salPeriodYear, setSalPeriodYear] = useState(2083);
  const [salPeriodFromDay, setSalPeriodFromDay] = useState('1');
  const [salPeriodToDay, setSalPeriodToDay] = useState('');

  // Compute the payPeriod string to send to API
  const computedPayPeriod = (() => {
    if (salPeriodMode === 'MONTH') {
      return `${NEPALI_MONTHS[salPeriodMonth]} ${salPeriodYear}`;
    }
    // RANGE mode
    const mm = String(salPeriodMonth + 1).padStart(2, '0');
    const from = `${salPeriodYear}-${mm}-${String(salPeriodFromDay || '1').padStart(2, '0')}`;
    const to = salPeriodToDay ? `${salPeriodYear}-${mm}-${String(salPeriodToDay).padStart(2, '0')}` : null;
    return to ? `${from} to ${to}` : from;
  })();

  // Salary filtration states
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterPeriod, setFilterPeriod] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Search states
  const [feeQuery, setFeeQuery] = useState('');

  const [formMsg, setFormMsg] = useState({ text: '', type: '' });

  const loadFinancialData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setProfile(meData.user);
      }

      // Fetch structures
      const structRes = await fetch('/api/fees?mode=structures');
      if (structRes.ok) {
        const structData = await structRes.json();
        setFeeStructures(structData.structures || []);
      }

      // Fetch allocations (bills assigned to students)
      const allocRes = await fetch('/api/fees?mode=allocations');
      if (allocRes.ok) {
        const allocData = await allocRes.json();
        setFeeAllocations(allocData.allocations || []);
      }

      // Fetch payment receipt history
      const historyRes = await fetch('/api/fees?mode=history');
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setPayments(historyData.payments || []);
      }

      // Fetch salaries payroll
      const salRes = await fetch('/api/salaries');
      if (salRes.ok) {
        const salData = await salRes.json();
        setSalaries(salData.salarySlips || []);
      }

      // Trigger auto-generation for current month
      await fetch('/api/salaries/generate-monthly', { method: 'POST' });

      // Reload salaries after auto-gen
      const salRes2 = await fetch('/api/salaries');
      if (salRes2.ok) {
        const salData2 = await salRes2.json();
        setSalaries(salData2.salarySlips || []);
      }

      // Load auto-configs
      const configRes = await fetch('/api/salaries/auto-config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setAutoConfigs(configData.configs || []);
      }

      // Fetch Financial Audit Data
      const auditDashRes = await fetch('/api/financial-audit?mode=dashboard');
      if (auditDashRes.ok) {
        const d = await auditDashRes.json();
        setAuditMetrics(d.metrics || null);
      }
      const auditTxRes = await fetch('/api/financial-audit?mode=transactions');
      if (auditTxRes.ok) {
        const d = await auditTxRes.json();
        setAuditTransactions(d.transactions || []);
      }
      const auditLogRes = await fetch('/api/financial-audit?mode=audit-logs');
      if (auditLogRes.ok) {
        const d = await auditLogRes.json();
        setAuditLogs(d.auditLogs || []);
      }
      const cashReconRes = await fetch('/api/financial-audit?mode=cash-recon');
      if (cashReconRes.ok) {
        const d = await cashReconRes.json();
        setCashRecons(d.reconciliations || []);
      }
      const bankReconRes = await fetch('/api/financial-audit?mode=bank-recon');
      if (bankReconRes.ok) {
        const d = await bankReconRes.json();
        setBankRecons(d.reconciliations || []);
      }
      const schRes = await fetch('/api/financial-audit?mode=scholarship-audit');
      if (schRes.ok) {
        const d = await schRes.json();
        setScholarshipAudits(d.scholarships || []);
      }
      const refRes = await fetch('/api/financial-audit?mode=refund-audit');
      if (refRes.ok) {
        const d = await refRes.json();
        setRefundAudits(d.refunds || []);
      }
      const suspRes = await fetch('/api/financial-audit?mode=suspicious');
      if (suspRes.ok) {
        const d = await suspRes.json();
        setSuspiciousList(d.suspiciousActivities || []);
      }
      const vaultRes = await fetch('/api/financial-audit?mode=vault');
      if (vaultRes.ok) {
        const d = await vaultRes.json();
        setVaultDocs(d.vaultDocuments || []);
      }
      const compRes = await fetch('/api/financial-audit?mode=compliance');
      if (compRes.ok) {
        const d = await compRes.json();
        setComplianceData(d.complianceSummary || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!structTitle || !structAmount || !structDueDateBS) {
      setStructMsg({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setStructMsg({ text: 'Creating fee structure...', type: 'info' });

    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_structure',
          title: structTitle,
          amount: structAmount,
          dueDateBS: structDueDateBS,
          classId: structClassId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStructMsg({ text: 'Fee structure created and allocated successfully!', type: 'success' });
        setStructTitle('');
        setStructAmount('');
        // Reload structures and allocations
        const structRes = await fetch('/api/fees?mode=structures');
        if (structRes.ok) {
          const structData = await structRes.json();
          setFeeStructures(structData.structures || []);
        }
        const allocRes = await fetch('/api/fees?mode=allocations');
        if (allocRes.ok) {
          const allocData = await allocRes.json();
          setFeeAllocations(allocData.allocations || []);
        }
      } else {
        setStructMsg({ text: data.error || 'Failed to create fee structure.', type: 'error' });
      }
    } catch {
      setStructMsg({ text: 'Network error. Please try again.', type: 'error' });
    }
  };

  const handleCreateSalarySlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salUserId || !salBasic || !computedPayPeriod) {
      setSalMsg({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setSalMsg({ text: 'Creating salary slip...', type: 'info' });

    // Map mock names/roles for offline mode convenience
    let name = 'Dr. Ram Prasad Adhikari';
    let role = 'PRINCIPAL';
    if (salUserId === 'mock-teacher-id') {
      name = 'Mr. Santosh Dahal';
      role = 'TEACHER';
    } else if (salUserId === 'mock-staff-profile-id') {
      name = 'Mrs. Sita Devkota';
      role = 'LIBRARIAN';
    } else if (salUserId === 'mock-vp-id') {
      name = 'Mrs. Geeta Adhikari';
      role = 'VICE_PRINCIPAL';
    } else if (salUserId === 'mock-hr-id') {
      name = 'Dr. Binod Prasad';
      role = 'HR';
    }

    try {
      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: salUserId,
          basicSalary: salBasic,
          allowances: salAllowances,
          deductions: String((
            parseFloat(salPF || '0') +
            (salTaxMode === 'PERCENT'
              ? Math.round(parseFloat(salBasic || '0') * (parseFloat(salTax || '0') / 100))
              : parseFloat(salTax || '0')) +
            parseFloat(salInsurance || '0')
          )),
          payPeriod: computedPayPeriod,
          status: salStatus,
          maxLeavesAllowed: salMaxLeaves,
          actualLeaves: salActualLeaves,
          deductionType: salDeductionType,
          deductionValue: salDeductionValue,
          daysInMonth: DAYS_IN_MONTH[salPeriodMonth],
          userName: name,
          userRole: role
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSalMsg({ text: 'Salary slip created successfully!', type: 'success' });

        // If auto-generate is enabled, also save the config
        if (salAutoGenerate) {
          await fetch('/api/salaries/auto-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: salUserId,
              userName: name,
              userRole: role,
              basicSalary: salBasic,
              allowances: salAllowances,
              pf: salPF,
              tax: salTax,
              taxMode: salTaxMode,
              insurance: salInsurance,
              status: salStatus,
              maxLeavesAllowed: salMaxLeaves,
              deductionType: salDeductionType,
              deductionValue: salDeductionValue,
              untilMonth: salAutoUntilMonth,
              untilYear: salAutoUntilYear,
            }),
          });
          // Reload auto-configs
          const configRes = await fetch('/api/salaries/auto-config');
          if (configRes.ok) {
            const configData = await configRes.json();
            setAutoConfigs(configData.configs || []);
          }
          setSalMsg({ text: 'Salary slip created & auto-generate schedule saved!', type: 'success' });
        }

        // Reload salaries
        const salRes = await fetch('/api/salaries');
        if (salRes.ok) {
          const salData = await salRes.json();
          setSalaries(salData.salarySlips || []);
        }
      } else {
        setSalMsg({ text: data.error || 'Failed to create salary slip.', type: 'error' });
      }
    } catch {
      setSalMsg({ text: 'Network error. Please try again.', type: 'error' });
    }
  };

  const handleDeleteSalarySlip = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary slip?')) return;

    try {
      const res = await fetch(`/api/salaries?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSalaries(prev => prev.filter(s => s.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete salary slip.');
      }
    } catch {
      alert('Network error. Failed to delete salary slip.');
    }
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocationId || !paymentAmount || !paymentDateBS) return;

    setFormMsg({ text: 'Processing receipt...', type: 'info' });

    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeAllocationId: selectedAllocationId,
          amountPaid: paymentAmount,
          paymentMethod,
          paymentDateBS,
          transactionId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFormMsg({ text: `Receipt generated successfully: ${data.payment.receiptNumber}`, type: 'success' });
        setPaymentAmount('');
        setTransactionId('');
        // Reload allocations
        const allocRes = await fetch('/api/fees?mode=allocations');
        if (allocRes.ok) {
          const allocData = await allocRes.json();
          setFeeAllocations(allocData.allocations || []);
        }
        // Reload history payments
        const historyRes = await fetch('/api/fees?mode=history');
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setPayments(historyData.payments || []);
        }
      } else {
        setFormMsg({ text: data.error || 'Failed to process payment.', type: 'error' });
      }
    } catch (err) {
      setFormMsg({ text: 'Network failure processing billing.', type: 'error' });
    }
  };

  if (loading || !profile) {
    return (
      <div className={styles.container}>
        <p>Loading Accounts Dashboard...</p>
      </div>
    );
  }

  // Cards as reusable function components
  const renderAllocationsCard = () => {
    const filteredAllocations = feeAllocations.filter((a) => {
      const query = feeQuery.toLowerCase();
      return (
        a.student.user.name.toLowerCase().includes(query) ||
        a.student.class.name.toLowerCase().includes(query) ||
        a.feeStructure.title.toLowerCase().includes(query)
      );
    });

    return (
      <div className={styles.sectionCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <FileText size={18} className="text-primary" />
            <span>Student Fee Allocations & Bills</span>
          </h3>
        </div>

        {/* Dynamic Search Box */}
        <div style={{ marginBottom: '4px' }}>
          <input
            type="text"
            placeholder="Search student bills by student name or class..."
            value={feeQuery}
            onChange={(e) => setFeeQuery(e.target.value)}
            style={{
              padding: '8px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '0.85rem',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll / Section</th>
                <th>Fee Title</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Due Amount</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.length > 0 ? (
                filteredAllocations.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.student.user.name}</strong></td>
                    <td>Roll {a.student.rollNumber} | {a.student.class.name}</td>
                    <td>{a.feeStructure.title}</td>
                    <td>NPR {a.feeStructure.amount}</td>
                    <td className="text-success">NPR {a.amountPaid}</td>
                    <td className="text-danger" style={{ fontWeight: 600 }}>NPR {a.dueAmount}</td>
                    <td>
                      <span className={`badge ${a.status === 'PAID' ? 'badge-success' : a.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                    No matching student billing accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCollectPaymentConsole = (showOnlyRecent10 = true) => {
    const sortedPayments = [...payments].sort((a, b) => {
      return new Date(b.paymentDateAD || 0).getTime() - new Date(a.paymentDateAD || 0).getTime();
    });
    const recentPayments = showOnlyRecent10 ? sortedPayments.slice(0, 10) : sortedPayments;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Form counter card */}
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <CreditCard size={18} className="text-success" />
              <span>Collect Fee Counter Console</span>
            </h3>
          </div>

          <form onSubmit={handleCollectionSubmit} className={styles.form}>
            {formMsg.text && (
              <div className={`${styles.feedbackMessage} ${formMsg.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
                {formMsg.text}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="pay-alloc">Select Student Account Bill</label>
              <select
                id="pay-alloc"
                value={selectedAllocationId}
                onChange={(e) => {
                  setSelectedAllocationId(e.target.value);
                  const alloc = feeAllocations.find(a => a.id === e.target.value);
                  if (alloc) {
                    setPaymentAmount(String(alloc.dueAmount));
                  } else {
                    setPaymentAmount('');
                  }
                }}
                required
              >
                <option value="">-- Choose Allocation --</option>
                {feeAllocations.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.student.user.name} ({a.feeStructure.title}) - Due: NPR {a.dueAmount}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="pay-amount">Amount Collected (NPR)</label>
              <input
                id="pay-amount"
                type="number"
                placeholder="Enter NPR collection value"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="pay-method">Payment Method</label>
              <select
                id="pay-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="ONLINE">ONLINE / E-Banking</option>
                <option value="CASH">CASH Counter Payment</option>
                <option value="ESEWA">eSewa Mobile Wallet</option>
                <option value="KHALTI">Khalti Mobile Wallet</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="pay-tx">Transaction / Reference ID (Optional)</label>
              <input
                id="pay-tx"
                type="text"
                placeholder="E.g. TXN-1293024823"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="pay-date">Payment Date (BS Format)</label>
              <input
                id="pay-date"
                type="text"
                value={paymentDateBS}
                onChange={(e) => setPaymentDateBS(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
              <CheckCircle size={16} />
              <span>Process Fee Collection</span>
            </button>
          </form>
        </div>

        {/* Recent 10 bills / receipts list */}
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <h3 className={styles.cardTitle}>
              <TrendingUp size={18} className="text-success" />
              <span>Recent 10 Bills / Receipts Created</span>
            </h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Student Name</th>
                  <th>Fee Title</th>
                  <th>Amount Paid</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length > 0 ? (
                  recentPayments.map((p: any) => (
                    <tr key={p.id}>
                      <td><strong>{p.receiptNumber}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.feeAllocation?.student?.user?.name || 'Student'}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class: {p.feeAllocation?.student?.class?.name}</span>
                      </td>
                      <td>{p.feeAllocation?.feeStructure?.title || 'Tuition Fee'}</td>
                      <td className="text-success" style={{ fontWeight: 700 }}>NPR {p.amount}</td>
                      <td>
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{p.paymentMethod}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                      No recent billing transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderBillingRegistry = () => {
    // 1. Filter allocations based on searchQuery, filterClass, filterPaymentStatus
    const filteredAllocations = feeAllocations.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        a.student.user.name.toLowerCase().includes(q) ||
        a.student.rollNumber.toLowerCase().includes(q) ||
        a.student.class.name.toLowerCase().includes(q) ||
        (a.student.class.section && a.student.class.section.toLowerCase().includes(q)) ||
        a.feeStructure.title.toLowerCase().includes(q);

      const matchesClass = filterClass === 'ALL' || a.student.class.name === filterClass;
      const matchesStatus = filterPaymentStatus === 'ALL' || a.status === filterPaymentStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });

    // 2. Filter payments based on searchQuery, filterClass
    const filteredPayments = payments.filter((p) => {
      const q = searchQuery.toLowerCase();
      const studentName = p.feeAllocation?.student?.user?.name || '';
      const rollNumber = p.feeAllocation?.student?.rollNumber || '';
      const className = p.feeAllocation?.student?.class?.name || '';
      const feeTitle = p.feeAllocation?.feeStructure?.title || '';
      const receiptId = p.receiptNumber || '';

      const matchesSearch = 
        studentName.toLowerCase().includes(q) ||
        rollNumber.toLowerCase().includes(q) ||
        className.toLowerCase().includes(q) ||
        feeTitle.toLowerCase().includes(q) ||
        receiptId.toLowerCase().includes(q);

      const matchesClass = filterClass === 'ALL' || className === filterClass;

      return matchesSearch && matchesClass;
    });

    // Extract unique classes for filter options
    const uniqueClasses = Array.from(new Set(feeAllocations.map(a => a.student.class.name)));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        
        {/* Master Filters Toolbar */}
        <div className={styles.sectionCard} style={{ padding: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} className="text-primary" />
            <span>Search & Billing Filters</span>
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {/* Search Input */}
            <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Search Student, Roll, Class or Title</label>
              <input
                type="text"
                placeholder="Type name, roll number, class or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
            {/* Class Filter */}
            <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter by Class Program</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            {/* Status Filter */}
            <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Payment Status</label>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Fully Settled</option>
                <option value="PARTIAL">Partially Paid</option>
                <option value="UNPAID">Outstanding / Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Split Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
          
          {/* Section A: Payment Receipts Logs */}
          <div className={styles.sectionCard} style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <div className={styles.cardHeader} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle}>
                <TrendingUp size={18} className="text-success" />
                <span>All Receipts & Payment Log</span>
              </h3>
            </div>
            <div className={styles.tableWrapper} style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Student Name</th>
                    <th>Fee Bill Title</th>
                    <th>Amount Paid</th>
                    <th>Date / Method</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((p: any) => (
                      <tr key={p.id}>
                        <td><strong>{p.receiptNumber}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.feeAllocation?.student?.user?.name || 'Student'}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class: {p.feeAllocation?.student?.class?.name}</span>
                        </td>
                        <td>{p.feeAllocation?.feeStructure?.title || 'Tuition Fee'}</td>
                        <td className="text-success" style={{ fontWeight: 700 }}>NPR {p.amount}</td>
                        <td>
                          <div>{p.paymentDateBS}</div>
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{p.paymentMethod}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
                        No payment receipt logs matched filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Structured Student Dues */}
          <div className={styles.sectionCard} style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <div className={styles.cardHeader} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle}>
                <Users size={18} className="text-primary" />
                <span>Student Fee Ledgers & Dues</span>
              </h3>
            </div>
            <div className={styles.tableWrapper} style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll / Class</th>
                    <th>Total / Due</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllocations.length > 0 ? (
                    filteredAllocations.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.student.user.name}</strong></td>
                        <td>
                          <div>Roll {a.student.rollNumber}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.student.class.name}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>Total: NPR {a.feeStructure.amount}</div>
                          <span className="text-danger" style={{ fontWeight: 600, fontSize: '0.8rem' }}>Due: NPR {a.dueAmount}</span>
                        </td>
                        <td>
                          <span className={`badge ${a.status === 'PAID' ? 'badge-success' : a.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                            {a.status}
                          </span>
                        </td>
                        <td>
                          {a.status !== 'PAID' ? (
                            <button
                              onClick={() => {
                                setSelectedAllocationId(a.id);
                                setPaymentAmount(String(a.dueAmount));
                                setShowCollectionModal(true);
                              }}
                              style={{
                                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                color: '#2563eb',
                                border: '1px solid rgba(37, 99, 235, 0.2)',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                                e.currentTarget.style.color = '#2563eb';
                              }}
                            >
                              Collect
                            </button>
                          ) : (
                            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.75rem' }}>Settled</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
                        No class records matched filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStructuresCard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Creation form */}
      <div className={styles.sectionCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <FileText size={18} className="text-primary" />
            <span>Generate New Student Billing Fee Structure</span>
          </h3>
        </div>
        <form onSubmit={handleCreateStructure} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          {structMsg.text && (
            <div style={{
              padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
              background: structMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              color: structMsg.type === 'success' ? '#16A34A' : '#EF4444',
              border: `1px solid ${structMsg.type === 'success' ? '#DCFCE7' : '#FEE2E2'}`
            }}>
              {structMsg.text}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Fee Structure Title *</label>
              <input
                type="text"
                placeholder="e.g. Tuition Fee - Shrawan 2083"
                value={structTitle}
                onChange={(e) => setStructTitle(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Billing Amount (NPR) *</label>
              <input
                type="number"
                placeholder="e.g. 8500"
                value={structAmount}
                onChange={(e) => setStructAmount(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Target Class Section *</label>
              <select
                value={structClassId}
                onChange={(e) => setStructClassId(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: '#fff', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Enrolled Classes</option>
                <option value="mock-class-id">Grade 11 Science-A</option>
                <option value="mock-class-id-2">Grade 11 Science-B</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Payment Due Date (BS Format) *</label>
              <input
                type="text"
                value={structDueDateBS}
                onChange={(e) => setStructDueDateBS(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: '8px', fontWeight: 700 }}>
            Create and Allocate Student Bills
          </button>
        </form>
      </div>

      {/* Listing */}
      <div className={styles.sectionCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <FileText size={18} className="text-primary" />
            <span>Configured Fee Structures</span>
          </h3>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Structure Title</th>
                <th>Billing Amount</th>
                <th>Target Scope</th>
                <th>Due Date (AD / BS)</th>
              </tr>
            </thead>
            <tbody>
              {feeStructures.length > 0 ? (
                feeStructures.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.title}</strong></td>
                    <td>NPR {s.amount}</td>
                    <td><span className="badge badge-primary">{s.class?.name ? `${s.class.name} ${s.class.section || ''}` : 'All Classes'}</span></td>
                    <td>{formatDate(s.dueDateAD, s.dueDateBS)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td><strong>Tuition Fee - Shrawan 2083</strong></td>
                  <td>NPR 8,500</td>
                  <td>Grade 11 Science-A</td>
                  <td>2083-04-18 BS (2026-08-01 AD)</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSalariesCard = () => {
    // Dynamic lists filtering
    const filteredSalaries = salaries.filter((s) => {
      const roleMatch = filterRole === 'ALL' || (s.user?.role || '').toUpperCase() === filterRole.toUpperCase();
      const periodMatch = filterPeriod === 'ALL' || s.payPeriod === filterPeriod;
      const statusMatch = filterStatus === 'ALL' || s.status === filterStatus;
      return roleMatch && periodMatch && statusMatch;
    });

    // Unique periods lists for filter option seeding
    const uniquePeriods = Array.from(new Set(salaries.map((s) => s.payPeriod)));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Creation form */}
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <DollarSign size={18} className="text-success" />
              <span>Configure Monthly Payroll & Leave Policies</span>
            </h3>
          </div>
          <form onSubmit={handleCreateSalarySlip} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {salMsg.text && (
              <div style={{
                padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
                background: salMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                color: salMsg.type === 'success' ? '#16A34A' : '#EF4444',
                border: `1px solid ${salMsg.type === 'success' ? '#DCFCE7' : '#FEE2E2'}`
              }}>
                {salMsg.text}
              </div>
            )}
            
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', margin: '4px 0' }}>
              1. Salary Base & Allowances
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Select Faculty / Employee *</label>
                <select
                  value={salUserId}
                  onChange={(e) => setSalUserId(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="mock-teacher-id">Mr. Santosh Dahal (Teacher)</option>
                  <option value="mock-staff-profile-id">Mrs. Sita Devkota (Librarian)</option>
                  <option value="mock-hr-id">Dr. Binod Prasad (HR Manager)</option>
                  <option value="mock-vp-id">Mrs. Geeta Adhikari (Vice Principal)</option>
                  <option value="mock-principal-id">Dr. Ram Prasad Adhikari (Principal)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Basic Salary (NPR) *</label>
                <input
                  type="number"
                  value={salBasic}
                  onChange={(e) => setSalBasic(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Allowances (NPR)</label>
                <input
                  type="number"
                  value={salAllowances}
                  onChange={(e) => setSalAllowances(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>PF — Provident Fund (NPR)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={salPF}
                  onChange={(e) => setSalPF(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              {/* ─── Income Tax / TDS with flat/% toggle ─── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Income Tax / TDS</label>

                {/* Mode toggle pills */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSalTaxMode('FLAT')}
                    style={{
                      padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: 700,
                      background: salTaxMode === 'FLAT' ? '#6366F1' : '#E2E8F0',
                      color: salTaxMode === 'FLAT' ? '#fff' : '#475569',
                      transition: 'all 0.2s'
                    }}
                  >
                    NPR (Flat)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalTaxMode('PERCENT')}
                    style={{
                      padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: 700,
                      background: salTaxMode === 'PERCENT' ? '#6366F1' : '#E2E8F0',
                      color: salTaxMode === 'PERCENT' ? '#fff' : '#475569',
                      transition: 'all 0.2s'
                    }}
                  >
                    % of Basic
                  </button>
                </div>

                {/* Input with unit label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={salTax}
                    onChange={(e) => setSalTax(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', flex: 1 }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap' }}>
                    {salTaxMode === 'PERCENT' ? '%' : 'NPR'}
                  </span>
                </div>

                {/* Live NPR preview when in % mode */}
                {salTaxMode === 'PERCENT' && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '5px 10px', borderRadius: '20px',
                    background: '#FEF3C7', border: '1px solid #FDE68A',
                    fontSize: '0.78rem', fontWeight: 700, color: '#92400E'
                  }}>
                    = NPR {Math.round(parseFloat(salBasic || '0') * (parseFloat(salTax || '0') / 100)).toLocaleString()} deducted
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Insurance Premium (NPR)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={salInsurance}
                  onChange={(e) => setSalInsurance(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              {/* ─── Nepali Pay Period Picker ─── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Pay Period *</label>

                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setSalPeriodMode('MONTH')}
                    style={{
                      padding: '5px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                      background: salPeriodMode === 'MONTH' ? 'var(--primary)' : '#E2E8F0',
                      color: salPeriodMode === 'MONTH' ? '#fff' : '#475569',
                      transition: 'all 0.2s'
                    }}
                  >
                    📅 Full Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalPeriodMode('RANGE')}
                    style={{
                      padding: '5px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                      background: salPeriodMode === 'RANGE' ? 'var(--primary)' : '#E2E8F0',
                      color: salPeriodMode === 'RANGE' ? '#fff' : '#475569',
                      transition: 'all 0.2s'
                    }}
                  >
                    📆 Specific Date Range
                  </button>
                </div>

                {/* Month + Year row (common) */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    value={salPeriodMonth}
                    onChange={(e) => setSalPeriodMonth(Number(e.target.value))}
                    style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.85rem', fontWeight: 600, flex: '1 1 140px' }}
                  >
                    {NEPALI_MONTHS.map((m, i) => (
                      <option key={m} value={i}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={salPeriodYear}
                    onChange={(e) => setSalPeriodYear(Number(e.target.value))}
                    style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.85rem', fontWeight: 600, flex: '1 1 100px' }}
                  >
                    {BS_YEARS.map((y) => (
                      <option key={y} value={y}>{y} BS</option>
                    ))}
                  </select>

                  {/* Date range from / to (only in RANGE mode) */}
                  {salPeriodMode === 'RANGE' && (
                    <>
                      <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>Day from</span>
                      <select
                        value={salPeriodFromDay}
                        onChange={(e) => setSalPeriodFromDay(e.target.value)}
                        style={{ padding: '9px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.85rem', flex: '0 0 80px' }}
                      >
                        {Array.from({ length: DAYS_IN_MONTH[salPeriodMonth] }, (_, d) => d + 1).map((d) => (
                          <option key={d} value={String(d)}>{d}</option>
                        ))}
                      </select>

                      <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>to</span>
                      <select
                        value={salPeriodToDay}
                        onChange={(e) => setSalPeriodToDay(e.target.value)}
                        style={{ padding: '9px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.85rem', flex: '0 0 80px' }}
                      >
                        <option value="">(end of month)</option>
                        {Array.from({ length: DAYS_IN_MONTH[salPeriodMonth] }, (_, d) => d + 1)
                          .filter((d) => d >= Number(salPeriodFromDay))
                          .map((d) => (
                            <option key={d} value={String(d)}>{d}</option>
                          ))}
                      </select>
                    </>
                  )}
                </div>

                {/* Live preview */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '20px',
                  background: 'linear-gradient(135deg, #EFF6FF, #E0F2FE)',
                  border: '1px solid #BAE6FD', fontSize: '0.8rem', fontWeight: 700, color: '#0369A1'
                }}>
                  ✅ Period: <span style={{ fontFamily: 'monospace' }}>{computedPayPeriod}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Disbursal Status *</label>
                <select
                  value={salStatus}
                  onChange={(e) => setSalStatus(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="PAID">PAID / Disbursed</option>
                  <option value="UNPAID">UNPAID / Awaiting</option>
                </select>
              </div>
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', margin: '12px 0 4px 0' }}>
              2. Leave Deduction Settings (Monthly Basis)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Max Monthly Leaves Allowed *</label>
                <input
                  type="number"
                  value={salMaxLeaves}
                  onChange={(e) => setSalMaxLeaves(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Actual Leaves Taken *</label>
                <input
                  type="number"
                  value={salActualLeaves}
                  onChange={(e) => setSalActualLeaves(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Leave Deduction Type *</label>
                <select
                  value={salDeductionType}
                  onChange={(e) => setSalDeductionType(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="AUTO_PER_DAY">Per-Day (Basic Salary / {DAYS_IN_MONTH[salPeriodMonth]})</option>
                  <option value="PERCENTAGE">Percentage of Basic Salary</option>
                  <option value="FLAT_AMOUNT">Flat Amount per Extra Day</option>
                </select>
              </div>

              {salDeductionType !== 'AUTO_PER_DAY' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                    Deduction Value ({salDeductionType === 'PERCENTAGE' ? '%' : 'NPR'}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={salDeductionValue}
                    onChange={(e) => setSalDeductionValue(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              )}
            </div>

            {/* ─── Auto-Generate Section ─── */}
            <div style={{
              padding: '16px', borderRadius: '10px', marginTop: '4px',
              border: `2px solid ${salAutoGenerate ? '#6366F1' : '#E2E8F0'}`,
              background: salAutoGenerate ? '#EEF2FF' : '#F8FAFC',
              transition: 'all 0.2s'
            }}>
              {/* Toggle row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
                    🔄 Auto-Generate Every Month
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    System will automatically create this salary slip each month
                  </div>
                </div>
                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => setSalAutoGenerate(p => !p)}
                  style={{
                    position: 'relative', width: '52px', height: '28px', borderRadius: '14px',
                    border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: salAutoGenerate ? '#6366F1' : '#CBD5E1',
                    transition: 'background 0.25s'
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '4px',
                    left: salAutoGenerate ? '26px' : '4px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    transition: 'left 0.25s'
                  }} />
                </button>
              </div>

              {/* Until picker — visible only when toggle is ON */}
              {salAutoGenerate && (
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4338CA' }}>
                    Generate automatically until:
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={salAutoUntilMonth}
                      onChange={(e) => setSalAutoUntilMonth(Number(e.target.value))}
                      style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #C7D2FE', background: '#fff', fontSize: '0.85rem', fontWeight: 600, flex: '1 1 140px' }}
                    >
                      {NEPALI_MONTHS.map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={salAutoUntilYear}
                      onChange={(e) => setSalAutoUntilYear(Number(e.target.value))}
                      style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #C7D2FE', background: '#fff', fontSize: '0.85rem', fontWeight: 600, flex: '1 1 100px' }}
                    >
                      {BS_YEARS.map((y) => (
                        <option key={y} value={y}>{y} BS</option>
                      ))}
                    </select>
                    <div style={{
                      padding: '6px 12px', borderRadius: '20px',
                      background: '#E0E7FF', fontSize: '0.78rem', fontWeight: 700, color: '#4338CA',
                      whiteSpace: 'nowrap'
                    }}>
                      Until {NEPALI_MONTHS[salAutoUntilMonth]} {salAutoUntilYear}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.73rem', color: '#6366F1', margin: 0 }}>
                    ℹ️ Leave deductions will default to 0 in auto-generated slips. You can edit them manually.
                  </p>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, marginTop: '8px' }}>
              {salAutoGenerate ? '🔄 Save & Enable Auto-Generate' : 'Publish and Disburse Salary'}
            </button>
          </form>
        </div>

        {/* Active Auto-Generate Schedules */}
        {autoConfigs.filter(c => c.active).length > 0 && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <DollarSign size={18} style={{ color: '#6366F1' }} />
                <span>Active Monthly Auto-Generate Schedules</span>
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Basic Salary</th>
                    <th>Allowances</th>
                    <th>Deduction Type</th>
                    <th>Runs Until</th>
                    <th>Last Generated</th>
                    <th style={{ textAlign: 'right' }}>Cancel</th>
                  </tr>
                </thead>
                <tbody>
                  {autoConfigs.filter(c => c.active).map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.userName}</strong></td>
                      <td><span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{c.userRole}</span></td>
                      <td>NPR {Number(c.basicSalary).toLocaleString()}</td>
                      <td>NPR {Number(c.allowances).toLocaleString()}</td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {c.deductionType === 'AUTO_PER_DAY' ? 'Per-Day' : c.deductionType === 'PERCENTAGE' ? `${c.deductionValue}%` : `NPR ${c.deductionValue} flat`}
                      </td>
                      <td style={{ fontWeight: 700, color: '#6366F1' }}>
                        {NEPALI_MONTHS[c.untilMonth]} {c.untilYear}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {c.lastGeneratedMonth !== null
                          ? `${NEPALI_MONTHS[c.lastGeneratedMonth]} ${c.lastGeneratedYear}`
                          : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm('Cancel this auto-generate schedule?')) return;
                            await fetch(`/api/salaries/auto-config?id=${c.id}`, { method: 'DELETE' });
                            setAutoConfigs(prev => prev.filter(x => x.id !== c.id));
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px' }}
                          title="Cancel auto-generate"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dynamic Month and Category Registry Filter console */}
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 className={styles.cardTitle}>
              <DollarSign size={18} className="text-success" />
              <span>Employee Salary Registry Log Book</span>
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <option value="ALL">All Categories / Roles</option>
                <option value="TEACHER">TEACHERS</option>
                <option value="LIBRARIAN">LIBRARIANS</option>
                <option value="HR">HR MANAGERS</option>
                <option value="VICE_PRINCIPAL">VICE PRINCIPALS</option>
                <option value="PRINCIPAL">PRINCIPALS</option>
              </select>

              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <option value="ALL">All Months / Terms</option>
                {uniquePeriods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">✅ PAID</option>
                <option value="UNPAID">⏳ UNPAID</option>
              </select>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Category</th>
                  <th>Basic Salary</th>
                  <th>Allow/Deduct</th>
                  <th>Leave Details (Allowed / Taken)</th>
                  <th>Leave Cut</th>
                  <th>Net Disbursed</th>
                  <th>Period / Term</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalaries.length > 0 ? (
                  filteredSalaries.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.user?.name || 'Faculty Member'}</strong></td>
                      <td>
                        <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                          {s.user?.role || 'STAFF'}
                        </span>
                      </td>
                      <td>NPR {s.basicSalary.toLocaleString()}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        +{s.allowances.toLocaleString()} / -{s.deductions.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {s.actualLeaves} leaves taken (Max {s.maxLeavesAllowed} allowed)
                      </td>
                      <td className="text-danger" style={{ fontWeight: 600 }}>
                        {s.leaveCutAmount > 0 ? `-NPR ${s.leaveCutAmount.toLocaleString()}` : 'NPR 0'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                        NPR {s.netSalary.toLocaleString()}
                      </td>
                      <td><strong>{s.payPeriod}</strong></td>
                      <td>
                        <span className={`badge ${s.status === 'PAID' ? 'badge-success' : 'badge-danger'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteSalarySlip(s.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px' }}
                          title="Delete salary record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
                      No matching employee payroll files match your active search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCollectionModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '20px'
    }}>
      <div className={styles.sectionCard} style={{ maxWidth: '550px', width: '100%', position: 'relative', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
        <button
          onClick={() => setShowCollectionModal(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            lineHeight: 1
          }}
        >
          &times;
        </button>
        <div className={styles.cardHeader} style={{ marginBottom: '16px' }}>
          <h3 className={styles.cardTitle}>
            <CreditCard size={18} className="text-success" />
            <span>Collect Student Fee Counter Console</span>
          </h3>
        </div>
        
        <form onSubmit={async (e) => {
          await handleCollectionSubmit(e);
          setShowCollectionModal(false);
        }} className={styles.form}>
          {formMsg.text && (
            <div className={`${styles.feedbackMessage} ${formMsg.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
              {formMsg.text}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="modal-pay-alloc">Select Student Account Bill</label>
            <select
              id="modal-pay-alloc"
              value={selectedAllocationId}
              onChange={(e) => {
                setSelectedAllocationId(e.target.value);
                const alloc = feeAllocations.find(a => a.id === e.target.value);
                if (alloc) {
                  setPaymentAmount(String(alloc.dueAmount));
                } else {
                  setPaymentAmount('');
                }
              }}
              required
            >
              <option value="">-- Choose Allocation --</option>
              {feeAllocations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.student.user.name} ({a.feeStructure.title}) - Due: NPR {a.dueAmount}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="modal-pay-amount">Amount Collected (NPR)</label>
            <input
              id="modal-pay-amount"
              type="number"
              placeholder="Enter NPR collection value"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="modal-pay-method">Payment Method</label>
            <select
              id="modal-pay-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="ONLINE">ONLINE / E-Banking</option>
              <option value="CASH">CASH Counter Payment</option>
              <option value="ESEWA">eSewa Mobile Wallet</option>
              <option value="KHALTI">Khalti Mobile Wallet</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="modal-pay-tx">Transaction / Reference ID (Optional)</label>
            <input
              id="modal-pay-tx"
              type="text"
              placeholder="E.g. TXN-1293024823"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="modal-pay-date">Payment Date (BS Format)</label>
            <input
              id="modal-pay-date"
              type="text"
              value={paymentDateBS}
              onChange={(e) => setPaymentDateBS(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowCollectionModal(false)} style={{ padding: '8px 16px', borderRadius: '6px' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <CheckCircle size={16} />
              <span>Process Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFinancialAuditCenter = () => {
    const filteredAuditTx = auditTransactions.filter((t) => {
      const q = auditSearch.toLowerCase();
      const matchesSearch =
        !auditSearch ||
        (t.studentName || '').toLowerCase().includes(q) ||
        (t.studentId || '').toLowerCase().includes(q) ||
        (t.receiptNumber || '').toLowerCase().includes(q) ||
        (t.id || '').toLowerCase().includes(q);

      const matchesDept = auditDeptFilter === 'ALL' || t.department === auditDeptFilter;
      const matchesMethod = auditMethodFilter === 'ALL' || t.paymentMethod === auditMethodFilter;
      const matchesVerif = auditVerifFilter === 'ALL' || t.verificationStatus === auditVerifFilter;

      return matchesSearch && matchesDept && matchesMethod && matchesVerif;
    });

    const pendingVerificationCount = auditTransactions.filter(t => t.verificationStatus === 'PENDING_VERIFICATION' || t.verificationStatus === 'UNDER_REVIEW').length;

    const handleVerifyAction = async (txId: string, status: string) => {
      try {
        const res = await fetch('/api/financial-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'VERIFY_TRANSACTION',
            transactionId: txId,
            status,
            remarks: auditRemarksText,
            userRole: profile?.role || 'ACCOUNTS_HEAD'
          })
        });
        if (res.ok) {
          setShowApprovalModal(false);
          setAuditRemarksText('');
          loadFinancialData();
        }
      } catch (err) {
        console.error('Audit verification failed:', err);
      }
    };

    const handleExport = (type: string, dataName: string) => {
      alert(`Exporting ${dataName} as ${type.toUpperCase()} file... Download will start automatically.`);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Header Title & Audit Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-card)', padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <ShieldCheck size={24} className="text-primary" />
              <span>Financial Audit & Maker-Checker Verification Center</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Internal Financial Control, Reconciliations, Audit Trail Logs & Risk Analysis | Auditor: <strong>{profile?.name || 'Accounts Head'}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-warning" style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
              {pendingVerificationCount} Pending Approvals
            </span>
            <button onClick={loadFinancialData} className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} />
              <span>Refresh Audit</span>
            </button>
          </div>
        </div>

        {/* 13 Audit Sub-Tabs Bar (Clean Emoji-Free) */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1.5px solid var(--border-color, #e2e8f0)', paddingBottom: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'dashboard', label: 'Audit Dashboard' },
            { key: 'transactions', label: 'Transaction Audit' },
            { key: 'approvals', label: 'Approval Center' },
            { key: 'audit-logs', label: 'Audit Trail Logs' },
            { key: 'reports', label: 'Financial Reports' },
            { key: 'cash-recon', label: 'Cash Reconciliation' },
            { key: 'bank-recon', label: 'Bank Reconciliation' },
            { key: 'scholarships', label: 'Scholarship Audit' },
            { key: 'refunds', label: 'Refund Audit' },
            { key: 'analytics', label: 'Financial Analytics' },
            { key: 'compliance', label: 'Compliance & Alerts' },
            { key: 'vault', label: 'Document Vault' },
            { key: 'suspicious', label: 'Suspicious Activities' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setAuditSubTab(tab.key)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: auditSubTab === tab.key ? '#2563eb' : 'transparent',
                color: auditSubTab === tab.key ? '#ffffff' : '#64748b'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SUB-VIEW 1: AUDIT DASHBOARD */}
        {auditSubTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Revenue Today</span>
                  <span className={styles.statValue}>NPR {auditMetrics?.totalRevenueToday?.toLocaleString() || '48,500'}</span>
                  <span className={styles.statDesc}>Gross daily receipts</span>
                </div>
                <div className={`${styles.statIcon} ${styles.successIcon}`}><TrendingUp size={20} /></div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Revenue This Month</span>
                  <span className={styles.statValue}>NPR {auditMetrics?.totalRevenueThisMonth?.toLocaleString() || '245,000'}</span>
                  <span className={styles.statDesc}>Total monthly fees</span>
                </div>
                <div className={`${styles.statIcon} ${styles.primaryIcon}`}><DollarSign size={20} /></div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Outstanding Fees</span>
                  <span className={styles.statValue}>NPR {auditMetrics?.outstandingFees?.toLocaleString() || '84,500'}</span>
                  <span className={styles.statDesc}>Pending balances</span>
                </div>
                <div className={`${styles.statIcon} ${styles.dangerIcon}`}><CreditCard size={20} /></div>
              </div>
            </div>

            {/* Target vs Achievement Progress & Department Revenue */}
            <div className={styles.mainGrid}>
              <div className={styles.sectionCard}>
                <h3 className={styles.cardTitle}>
                  <BarChart3 size={18} className="text-primary" />
                  <span>Collection Target & Achievement</span>
                </h3>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>Target: <strong>NPR 3,000,000</strong></span>
                    <span>Achievement: <strong>{auditMetrics?.collectionAchievement || 68}%</strong></span>
                  </div>
                  <div style={{ width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${auditMetrics?.collectionAchievement || 68}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '6px' }} />
                  </div>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <h3 className={styles.cardTitle}>
                  <PieChart size={18} className="text-success" />
                  <span>Payment Method Distribution</span>
                </h3>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash Counter Collection:</span>
                    <strong>NPR {auditMetrics?.cashCollection?.toLocaleString() || '18,500'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Online / Digital Transfer:</span>
                    <strong>NPR {auditMetrics?.onlinePayments?.toLocaleString() || '226,500'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 2: TRANSACTION AUDIT */}
        {auditSubTab === 'transactions' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader} style={{ flexWrap: 'wrap', gap: '12px' }}>
              <h3 className={styles.cardTitle}>
                <FileText size={18} className="text-primary" />
                <span>Comprehensive Transaction Audit Registry</span>
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleExport('csv', 'Transaction Audit')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Export CSV</button>
                <button onClick={() => handleExport('excel', 'Transaction Audit')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Export Excel</button>
              </div>
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '12px', background: 'var(--bg-hover)', borderRadius: '8px', marginBottom: '16px' }}>
              <input type="text" placeholder="Search Student Name, ID, Receipt..." value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', minWidth: '220px', fontSize: '0.85rem' }} />
              <select value={auditDeptFilter} onChange={(e) => setAuditDeptFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <option value="ALL">All Departments</option>
                <option value="Science">Science</option>
                <option value="Management">Management</option>
                <option value="Humanities">Humanities</option>
              </select>
              <select value={auditMethodFilter} onChange={(e) => setAuditMethodFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <option value="ALL">All Payment Methods</option>
                <option value="CASH">CASH</option>
                <option value="ONLINE">ONLINE / E-Banking</option>
                <option value="BANK_TRANSFER">BANK_TRANSFER</option>
              </select>
              <select value={auditVerifFilter} onChange={(e) => setAuditVerifFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <option value="ALL">All Verification Statuses</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            {/* Transactions Table */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Receipt ID</th>
                    <th>Student Details</th>
                    <th>Dept / Program</th>
                    <th>Payment Method</th>
                    <th>Bill Amount</th>
                    <th>Discount</th>
                    <th>Scholarship</th>
                    <th>Collector</th>
                    <th>Verification Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditTx.map((tx) => (
                    <tr key={tx.id}>
                      <td><strong>{tx.receiptNumber}</strong></td>
                      <td>
                        <div><strong>{tx.studentName}</strong></div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.studentId}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{tx.program}</td>
                      <td><span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{tx.paymentMethod}</span></td>
                      <td><strong>NPR {tx.amount.toLocaleString()}</strong></td>
                      <td className="text-danger" style={{ fontSize: '0.8rem' }}>{tx.discount > 0 ? `NPR ${tx.discount}` : '-'}</td>
                      <td className="text-success" style={{ fontSize: '0.8rem' }}>{tx.scholarship > 0 ? `NPR ${tx.scholarship}` : '-'}</td>
                      <td style={{ fontSize: '0.8rem' }}>{tx.collector}</td>
                      <td>
                        <span className={`badge ${tx.verificationStatus === 'VERIFIED' ? 'badge-success' : tx.verificationStatus === 'PENDING_VERIFICATION' ? 'badge-warning' : tx.verificationStatus === 'REJECTED' ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                          {tx.verificationStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => { setSelectedAuditTx(tx); setShowApprovalModal(true); }}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Audit Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: APPROVAL CENTER (MAKER-CHECKER) */}
        {auditSubTab === 'approvals' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <CheckSquare size={18} className="text-warning" />
                <span>Maker-Checker Approval Workspace</span>
              </h3>
            </div>
            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', color: '#92400e', marginBottom: '16px' }}>
              <strong>Maker-Checker Constraint Active:</strong> Transactions initiated by Accounts Officers require mandatory Accounts Head review and secondary audit clearance.
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Initiated By (Maker)</th>
                    <th>Date</th>
                    <th>Audit Action (Checker)</th>
                  </tr>
                </thead>
                <tbody>
                  {auditTransactions.filter(t => t.verificationStatus === 'PENDING_VERIFICATION' || t.verificationStatus === 'UNDER_REVIEW').map(tx => (
                    <tr key={tx.id}>
                      <td><strong>{tx.receiptNumber}</strong></td>
                      <td>{tx.studentName} ({tx.studentId})</td>
                      <td><strong>NPR {tx.amount.toLocaleString()}</strong></td>
                      <td><span className="badge badge-primary">{tx.paymentMethod}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{tx.collector}</td>
                      <td style={{ fontSize: '0.8rem' }}>{tx.transactionDate}</td>
                      <td style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleVerifyAction(tx.id, 'VERIFIED')} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: '#10b981' }}>Approve</button>
                        <button onClick={() => handleVerifyAction(tx.id, 'REJECTED')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', color: '#ef4444' }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 4: AUDIT TRAIL LOGS */}
        {auditSubTab === 'audit-logs' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Lock size={18} className="text-primary" />
                <span>Immutable System Audit Trail Logs</span>
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User & Role</th>
                    <th>Action Executed</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                    <th>Timestamp</th>
                    <th>IP / Device</th>
                    <th>Reason / Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div><strong>{log.user}</strong></div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.role}</div>
                      </td>
                      <td><span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{log.action}</span></td>
                      <td style={{ fontSize: '0.8rem', color: '#ef4444' }}>{log.oldValue}</td>
                      <td style={{ fontSize: '0.8rem', color: '#10b981' }}>{log.newValue}</td>
                      <td style={{ fontSize: '0.75rem' }}>{log.date} {log.time}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.ipAddress} ({log.os})</td>
                      <td style={{ fontSize: '0.8rem' }}>{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 5: FINANCIAL REPORTS */}
        {auditSubTab === 'reports' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <FileSpreadsheet size={18} className="text-success" />
                <span>Financial Audit Reports & Export Center</span>
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '12px' }}>
              {['Daily Collection Report', 'Weekly Audit Statement', 'Monthly Revenue Report', 'Quarterly Financial Summary', 'Yearly Audit Ledger', 'Outstanding Fees Report', 'Refund Audit Summary', 'Scholarship Distribution Report'].map((rName) => (
                <div key={rName} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <strong>{rName}</strong>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleExport('pdf', rName)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>PDF</button>
                    <button onClick={() => handleExport('excel', rName)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Excel</button>
                    <button onClick={() => handleExport('csv', rName)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>CSV</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-VIEW 6: CASH RECONCILIATION */}
        {auditSubTab === 'cash-recon' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <DollarSign size={18} className="text-success" />
                <span>Daily Cash Counter Reconciliation</span>
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Cashier / Collector</th>
                    <th>Collected (NPR)</th>
                    <th>Deposited (NPR)</th>
                    <th>Expected (NPR)</th>
                    <th>Actual (NPR)</th>
                    <th>Difference</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cashRecons.map((cr) => (
                    <tr key={cr.id}>
                      <td><strong>{cr.date}</strong></td>
                      <td>{cr.collector}</td>
                      <td>NPR {(cr.cashCollected || 0).toLocaleString()}</td>
                      <td>NPR {(cr.cashDeposited || 0).toLocaleString()}</td>
                      <td>NPR {(cr.expectedCash || 0).toLocaleString()}</td>
                      <td>NPR {(cr.actualCash || 0).toLocaleString()}</td>
                      <td className={cr.difference === 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>
                        {cr.difference === 0 ? 'NPR 0' : `NPR ${cr.difference}`}
                      </td>
                      <td>
                        <span className={`badge ${cr.status === 'BALANCED' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                          {cr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 7: BANK RECONCILIATION */}
        {auditSubTab === 'bank-recon' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Layers size={18} className="text-primary" />
                <span>Bank Statement Reconciliation Matrix</span>
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Bank Account Name</th>
                    <th>Statement Date</th>
                    <th>Bank Amount (NPR)</th>
                    <th>System Ledger Amount (NPR)</th>
                    <th>Unmatched Items</th>
                    <th>Reconciliation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bankRecons.map((br) => (
                    <tr key={br.id}>
                      <td><strong>{br.bankName}</strong></td>
                      <td>{br.statementDate}</td>
                      <td>NPR {(br.bankAmount || 0).toLocaleString()}</td>
                      <td>NPR {(br.systemAmount || 0).toLocaleString()}</td>
                      <td>{br.unmatchedCount || 0} items</td>
                      <td>
                        <span className={`badge ${br.status === 'MATCHED' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                          {br.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 8: SCHOLARSHIP AUDIT */}
        {auditSubTab === 'scholarships' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <FileCheck size={18} className="text-primary" />
                <span>Scholarship & Grant Allocation Audit</span>
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Scholarship Type</th>
                    <th>Amount (NPR)</th>
                    <th>Approver</th>
                    <th>Audit Reason</th>
                    <th>Date Granted</th>
                  </tr>
                </thead>
                <tbody>
                  {scholarshipAudits.map((sc) => (
                    <tr key={sc.id}>
                      <td><strong>{sc.studentName}</strong> ({sc.studentId})</td>
                      <td><span className="badge badge-primary">{sc.scholarshipType}</span></td>
                      <td><strong>NPR {(sc.amount || 0).toLocaleString()}</strong></td>
                      <td>{sc.approver}</td>
                      <td style={{ fontSize: '0.8rem' }}>{sc.reason}</td>
                      <td style={{ fontSize: '0.8rem' }}>{sc.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 9: REFUND AUDIT */}
        {auditSubTab === 'refunds' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <RefreshCw size={18} className="text-danger" />
                <span>Refund Request Audit Registry</span>
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Refund Amount (NPR)</th>
                    <th>Reason</th>
                    <th>Approval Status</th>
                    <th>Approver</th>
                    <th>Refund Date</th>
                  </tr>
                </thead>
                <tbody>
                  {refundAudits.map((rf) => (
                    <tr key={rf.id}>
                      <td><strong>{rf.studentName}</strong> ({rf.studentId})</td>
                      <td><strong>NPR {(rf.refundAmount || 0).toLocaleString()}</strong></td>
                      <td style={{ fontSize: '0.8rem' }}>{rf.reason}</td>
                      <td>
                        <span className={`badge ${rf.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                          {rf.approvalStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{rf.approver || 'Pending'}</td>
                      <td style={{ fontSize: '0.8rem' }}>{rf.refundDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 10: FINANCIAL ANALYTICS */}
        {auditSubTab === 'analytics' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <BarChart3 size={18} className="text-primary" />
                <span>Enterprise Financial Analytics</span>
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '12px' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem' }}>Revenue Growth Rate</h4>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>+14.2% YoY</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Compared to previous academic period</p>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem' }}>Fee Recovery Rate</h4>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>91.8%</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Outstanding fee recovery velocity</p>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 11: COMPLIANCE DASHBOARD */}
        {auditSubTab === 'compliance' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <AlertOctagon size={18} className="text-warning" />
                <span>Institutional Financial Compliance Monitor</span>
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '12px' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', background: '#fffbe6' }}>
                <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>Unverified Transactions</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
                  {complianceData?.unverifiedTransactions || 1}
                </div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', background: '#fef2f2' }}>
                <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>Suspicious Flags</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991b1b', marginTop: '4px' }}>
                  {complianceData?.suspiciousActivities || 3}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 12: DOCUMENT VAULT */}
        {auditSubTab === 'vault' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Lock size={18} className="text-primary" />
                <span>Financial Document Vault & Invoices Store</span>
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Document Title</th>
                    <th>Category</th>
                    <th>Uploaded By</th>
                    <th>Upload Date</th>
                    <th>File Size</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vaultDocs.map((vd) => (
                    <tr key={vd.id}>
                      <td><strong>{vd.title}</strong></td>
                      <td><span className="badge badge-primary">{vd.category}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{vd.uploadedBy}</td>
                      <td style={{ fontSize: '0.8rem' }}>{vd.uploadDate}</td>
                      <td style={{ fontSize: '0.8rem' }}>{vd.fileSize}</td>
                      <td><button onClick={() => alert(`Accessing document vault file: ${vd.title}`)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>View Proof</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 13: SUSPICIOUS ACTIVITY MONITOR */}
        {auditSubTab === 'suspicious' && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <AlertTriangle size={18} className="text-danger" />
                <span>Automated Exception & Suspicious Activity Monitor</span>
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Anomaly Type</th>
                    <th>Description Details</th>
                    <th>Student Involved</th>
                    <th>Flagged Date</th>
                    <th>Risk Level</th>
                    <th>Action Status</th>
                  </tr>
                </thead>
                <tbody>
                  {suspiciousList.map((sa) => (
                    <tr key={sa.id}>
                      <td><strong>{sa.type}</strong></td>
                      <td style={{ fontSize: '0.85rem' }}>{sa.description}</td>
                      <td>{sa.studentName}</td>
                      <td style={{ fontSize: '0.8rem' }}>{sa.date}</td>
                      <td>
                        <span className={`badge ${sa.riskLevel === 'CRITICAL' ? 'badge-danger' : sa.riskLevel === 'HIGH' ? 'badge-danger' : sa.riskLevel === 'MEDIUM' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                          {sa.riskLevel} RISK
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{sa.actionTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* APPROVAL MODAL */}
        {showApprovalModal && selectedAuditTx && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', maxWidth: '500px', width: '100%', border: '1px solid var(--border-color)' }}>
              <h3>Transaction Audit Verification</h3>
              <p>Receipt Number: <strong>{selectedAuditTx.receiptNumber}</strong> | Student: <strong>{selectedAuditTx.studentName}</strong></p>
              <p>Amount: <strong>NPR {selectedAuditTx.amount.toLocaleString()}</strong> ({selectedAuditTx.paymentMethod})</p>
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Audit Remarks / Clarification</label>
                <textarea value={auditRemarksText} onChange={(e) => setAuditRemarksText(e.target.value)} placeholder="Enter auditor remarks..." style={{ width: '100%', height: '80px', marginTop: '6px', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => setShowApprovalModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={() => handleVerifyAction(selectedAuditTx.id, 'REJECTED')} className="btn-secondary" style={{ color: '#ef4444' }}>Reject</button>
                <button onClick={() => handleVerifyAction(selectedAuditTx.id, 'VERIFIED')} className="btn-primary">Approve Transaction</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSubPageContent = () => {
    switch (subPage?.toLowerCase()) {
      case 'structures':
        return renderStructuresCard();
      case 'payments':
        return renderBillingRegistry();
      case 'salaries':
        return renderSalariesCard();
      case 'audit':
        return renderFinancialAuditCenter();
      default:
        return (
          <div className={styles.sectionCard}>
            <p>Finance module "{subPage}" template placeholder.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.container + " fade-in"}>
      {/* Welcome Header */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h2>Campus Cashier & Billing</h2>
          <p>Logged in as: <strong>{profile.name}</strong> ({profile.role.replace('_', ' ')})</p>
        </div>
      </div>

      {/* Render selected tab panel */}
      {activeTab === 'dashboard' && (
        <>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Monthly Collections</span>
                <span className={styles.statValue}>NPR 245,000</span>
                <span className={styles.statDesc}>Gross tuition fee receipt logs</span>
              </div>
              <div className={`${styles.statIcon} ${styles.successIcon}`}>
                <TrendingUp size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Pending Bills Dues</span>
                <span className={styles.statValue}>NPR 84,500</span>
                <span className={styles.statDesc}>Across all class sections</span>
              </div>
              <div className={`${styles.statIcon} ${styles.dangerIcon}`}>
                <CreditCard size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Average Salary Payroll</span>
                <span className={styles.statValue}>NPR 185,000</span>
                <span className={styles.statDesc}>Teachers & staff combined</span>
              </div>
              <div className={`${styles.statIcon} ${styles.primaryIcon}`}>
                <DollarSign size={22} />
              </div>
            </div>
          </div>

          {/* Stretched allocations list for a roomier, gorgeous overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            {renderAllocationsCard()}
          </div>
        </>
      )}

      {activeTab === 'collect' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {renderCollectPaymentConsole(true)}
        </div>
      )}

      {activeTab === 'payments' && renderBillingRegistry()}
      {activeTab === 'structures' && renderStructuresCard()}
      {activeTab === 'salaries' && renderSalariesCard()}
      {activeTab === 'audit' && renderFinancialAuditCenter()}
      {activeTab === 'calendar' && <AcademicCalendarManager userRole={profile.role || 'Accounts'} />}

      {showCollectionModal && renderCollectionModal()}
    </div>
  );
}
