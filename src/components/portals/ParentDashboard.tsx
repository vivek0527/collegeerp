'use client';

import React, { useEffect, useState } from 'react';
import styles from './DashboardComponents.module.css';
import { useDate } from '../DateContext';
import {
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  Bell,
  CheckCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function ParentDashboard({ subPage }: { subPage?: string }) {
  const { formatDate } = useDate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setProfile(meData.user);
        }
        const noticeRes = await fetch('/api/notices');
        if (noticeRes.ok) {
          const noticeData = await noticeRes.json();
          setNotices(noticeData.notices || []);
        }
        const feeRes = await fetch('/api/fees?mode=allocations');
        if (feeRes.ok) {
          const feeData = await feeRes.json();
          setFees(feeData.allocations || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !profile) {
    return (
      <div className={styles.container}>
        <p>Loading parent portal logs...</p>
      </div>
    );
  }

  const child = profile.parentProfile?.students[0];

  // Component cards as functions
  const renderExamsCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <GraduationCap size={18} className="text-primary" />
          <span>Your Child's Examination Results</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Exam Event</th>
              <th>Subject</th>
              <th>Full Marks</th>
              <th>Marks Obtained</th>
              <th>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>First Term Examination 2083</td>
              <td>Mathematics</td>
              <td>100</td>
              <td>84.5</td>
              <td><span className="badge badge-success">A</span></td>
              <td>Excellent analytical skills, active class participation.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAttendanceCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <UserCheck size={18} className="text-success" />
          <span>Attendance Log Registry</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Marked By</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2083-03-15 BS</td>
              <td>Mathematics</td>
              <td><span className="badge badge-success">PRESENT</span></td>
              <td>Mr. Santosh Dahal</td>
              <td>Regular</td>
            </tr>
            <tr>
              <td>2083-03-14 BS</td>
              <td>Mathematics</td>
              <td><span className="badge badge-success">PRESENT</span></td>
              <td>Mr. Santosh Dahal</td>
              <td>Regular</td>
            </tr>
            <tr>
              <td>2083-03-13 BS</td>
              <td>Mathematics</td>
              <td><span className="badge badge-danger">ABSENT</span></td>
              <td>Mr. Santosh Dahal</td>
              <td>Sick leave request filed by parent</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNoticesCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Bell size={18} className="text-warning" />
          <span>Notice Board</span>
        </h3>
      </div>
      <div className={styles.noticeList}>
        {notices.length > 0 ? (
          notices.slice(0, 3).map((n) => (
            <div key={n.id} className={styles.noticeItem}>
              <div className={styles.noticeHeader}>
                <span className={styles.noticeTitle}>{n.title}</span>
                <span className={styles.noticeDate}>{formatDate(n.createdAt)}</span>
              </div>
              <p className={styles.noticeBody}>{n.content}</p>
              {n.attachmentUrl && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={n.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}
                  >
                    📎 Open Attachment File
                  </a>
                </div>
              )}
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', alignSelf: 'flex-end', marginTop: '4px', display: 'block' }}>
                By: {n.createdBy?.name || 'Administrator'} ({n.createdBy?.role || 'MANAGEMENT'})
              </span>
            </div>
          ))
        ) : (
          <div className={styles.noticeItem}>
            <div className={styles.noticeHeader}>
              <span className={styles.noticeTitle}>ERP Online</span>
              <span className={styles.noticeDate}>2026-07-01</span>
            </div>
            <p className={styles.noticeBody}>
              System seeding finished. Parents can now monitor results and attendance registry online.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeesCard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {fees.length > 0 ? (
        fees.map((f) => (
          <div key={f.id} className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <CreditCard size={18} className="text-danger" />
                <span>Child Financial Status - {f.feeStructure.title}</span>
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <p><strong>Fee Title:</strong> {f.feeStructure.title}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Charged Amount:</span>
                <span>NPR {f.feeStructure.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                <span className="text-success">NPR {f.amountPaid}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                <span style={{ fontWeight: 600 }}>Due Balance:</span>
                <span className="text-danger" style={{ fontWeight: 600 }}>NPR {f.dueAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>Due Date:</span>
                <span>{formatDate(f.feeStructure.dueDateAD, f.feeStructure.dueDateBS)}</span>
              </div>
              <span className={`badge ${f.status === 'PAID' ? 'badge-success' : f.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`} style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                {f.status === 'PAID' ? 'FULLY PAID' : f.status === 'PARTIAL' ? 'PARTIALLY PAID' : 'UNPAID / OVERDUE'}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <CreditCard size={18} className="text-danger" />
              <span>Child Financial Status</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <p><strong>Fee Plan: Shrawan Tuition 2083</strong></p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Charged Amount:</span>
              <span>NPR 8,500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
              <span className="text-success">NPR 5,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
              <span style={{ fontWeight: 600 }}>Due Balance:</span>
              <span className="text-danger" style={{ fontWeight: 600 }}>NPR 3,500</span>
            </div>
            <span className="badge badge-warning" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              PARTIAL PAYMENT RECEIVED
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderSubPageContent = () => {
    switch (subPage?.toLowerCase()) {
      case 'attendance':
        return renderAttendanceCard();
      case 'fees':
        return renderFeesCard();
      case 'exams':
        return renderExamsCard();
      case 'notices':
        return renderNoticesCard();
      default:
        return (
          <div className={styles.sectionCard}>
            <p>Guardian module "{subPage}" template placeholder.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.container + " fade-in"}>
      {!subPage ? (
        <>
          {/* Welcome */}
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeText}>
              <h2>Welcome, {profile.name}</h2>
              <p>Guardian Dashboard | Child Name: <strong>{child?.user?.name || 'Niranjan Thapa'}</strong></p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Child Attendance</span>
                <span className={styles.statValue}>80%</span>
                <span className={styles.statDesc}>4 of 5 days marked present</span>
              </div>
              <div className={`${styles.statIcon} ${styles.primaryIcon}`}>
                <UserCheck size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Pending Fee Dues</span>
                <span className={styles.statValue}>NPR 3,500</span>
                <span className={styles.statDesc}>Tuition Fee - Shrawan 2083</span>
              </div>
              <div className={`${styles.statIcon} ${styles.dangerIcon}`}>
                <CreditCard size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Academic Standings</span>
                <span className={styles.statValue}>A</span>
                <span className={styles.statDesc}>First Term Examination Grade</span>
              </div>
              <div className={`${styles.statIcon} ${styles.successIcon}`}>
                <GraduationCap size={22} />
              </div>
            </div>
          </div>

          <div className={styles.mainGrid}>
            {/* Left Side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderExamsCard()}
              {renderAttendanceCard()}
            </div>

            {/* Right Side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderNoticesCard()}
              {renderFeesCard()}
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
