'use client';

import React, { useEffect, useState } from 'react';
import styles from './DashboardComponents.module.css';
import { useDate } from '../DateContext';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle,
  FileText,
  User,
  Trash2,
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

  const renderPaymentDeskCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <CreditCard size={18} className="text-success" />
          <span>Receive Payment Desk</span>
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
            onChange={(e) => setSelectedAllocationId(e.target.value)}
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
  );

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

  const renderSubPageContent = () => {
    switch (subPage?.toLowerCase()) {
      case 'structures':
        return renderStructuresCard();
      case 'payments':
        return renderPaymentDeskCard();
      case 'salaries':
        return renderSalariesCard();
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
      {!subPage ? (
        <>
          {/* Header */}
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeText}>
              <h2>Campus Cashier & Billing</h2>
              <p>Logged in as: <strong>{profile.name}</strong> ({profile.role.replace('_', ' ')})</p>
            </div>
          </div>

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

          <div className={styles.mainGrid}>
            {/* Left Side: Student Fee Ledger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderAllocationsCard()}
            </div>

            {/* Right Side: Fee Collector Console */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderPaymentDeskCard()}
            </div>
          </div>
        </>
      ) : (
        <div style={{ marginTop: '24px' }}>
          {renderSubPageContent()}
        </div>
      )}
    </div>
  );
}
