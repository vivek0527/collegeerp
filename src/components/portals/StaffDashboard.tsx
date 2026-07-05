'use client';

import React, { useEffect, useState } from 'react';
import styles from './DashboardComponents.module.css';
import { useDate } from '../DateContext';
import {
  Users,
  Briefcase,
  Calendar,
  Library,
  BookOpen,
  PlusCircle,
  FileText,
  Clock,
  Bell,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import AcademicCalendarManager from './AcademicCalendarManager';

export default function StaffDashboard({ subPage }: { subPage?: string }) {
  const { formatDate } = useDate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [salaries, setSalaries] = useState<any[]>([]);

  // Form State
  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState('TERMINAL');
  const [examMsg, setExamMsg] = useState({ text: '', type: '' });


  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setProfile(meData.user);
        }

        const salRes = await fetch('/api/salaries');
        if (salRes.ok) {
          const salData = await salRes.json();
          setSalaries(salData.salarySlips || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName) return;

    setExamMsg({ text: 'Scheduling exam session...', type: 'info' });
    setTimeout(() => {
      setExamMsg({ text: `Exam event "${examName}" successfully scheduled and published to student portals!`, type: 'success' });
      setExamName('');
    }, 800);
  };

  if (loading || !profile) {
    return (
      <div className={styles.container}>
        <p>Loading staff platform controls...</p>
      </div>
    );
  }

  const role = profile.role;

  // HR Components
  const renderHREmployeeRegistry = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Users size={18} className="text-primary" />
          <span>Employee Registry</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Salary Term</th>
              <th>Salary Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>EMP-TCH-01</td>
              <td>Mr. Santosh Dahal</td>
              <td>teacher@emc.edu.np</td>
              <td>NPR 55,000</td>
              <td><span className="badge badge-success">PAID</span></td>
            </tr>
            <tr>
              <td>EMP-LIB-01</td>
              <td>Mrs. Sita Devkota</td>
              <td>librarian@emc.edu.np</td>
              <td>NPR 35,000</td>
              <td><span className="badge badge-success">PAID</span></td>
            </tr>
            <tr>
              <td>EMP-ACC-01</td>
              <td>Miss Laxmi Thapa</td>
              <td>accofficer@emc.edu.np</td>
              <td>NPR 40,000</td>
              <td><span className="badge badge-success">PAID</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHRAttendanceLogs = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <CheckCircle size={18} className="text-success" />
          <span>Faculties Daily Attendance Audit</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Assigned Department</th>
              <th>Arrival Time</th>
              <th>Check-in Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Mr. Santosh Dahal</strong></td>
              <td>Mathematics Teacher</td>
              <td>08:50 AM</td>
              <td><span className="badge badge-success">ON TIME</span></td>
            </tr>
            <tr>
              <td><strong>Mrs. Sita Devkota</strong></td>
              <td>Librarian</td>
              <td>08:45 AM</td>
              <td><span className="badge badge-success">ON TIME</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // Librarian Components
  const renderLibrarianCheckedOut = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <BookOpen size={18} className="text-primary" />
          <span>Checked Out Book Log</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Borrower Name</th>
              <th>Book Title</th>
              <th>ISBN / Acc Number</th>
              <th>Check Out Date</th>
              <th>Due Return Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Niranjan Thapa (Student)</td>
              <td>Fundamentals of Calculus (Vol II)</td>
              <td>ISBN-9782302482</td>
              <td>2083-03-01 BS</td>
              <td>2083-03-15 BS</td>
            </tr>
            <tr>
              <td>Alok Regmi (Student)</td>
              <td>Concepts of Classical Mechanics</td>
              <td>ISBN-9781293028</td>
              <td>2083-03-10 BS</td>
              <td>2083-03-24 BS</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // Exam Dept Components
  const renderExamSessions = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Calendar size={18} className="text-primary" />
          <span>Scheduled Examination Sessions</span>
        </h3>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Exam Name</th>
              <th>Exam Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>First Term Examination 2083</strong></td>
              <td>TERMINAL</td>
              <td>2083-04-01 BS</td>
              <td>2083-04-08 BS</td>
              <td><span className="badge badge-success">Seeded & Configured</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExamForm = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <PlusCircle size={18} className="text-success" />
          <span>Schedule New Examination</span>
        </h3>
      </div>

      <form onSubmit={handleCreateExam} className={styles.form}>
        {examMsg.text && (
          <div className={`${styles.feedbackMessage} ${examMsg.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
            {examMsg.text}
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="ex-name">Exam Term Name</label>
          <input
            id="ex-name"
            type="text"
            placeholder="E.g., Second Term Examination 2083"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="ex-type">Examination Type</label>
          <select
            id="ex-type"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
          >
            <option value="TERMINAL">Terminal / Semester Examination</option>
            <option value="FINAL">Final Examination</option>
            <option value="UNIT_TEST">Unit test / Periodic quiz</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
          <Calendar size={16} />
          <span>Publish Schedule</span>
        </button>
      </form>
    </div>
  );

  const renderNoticesCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Bell size={18} className="text-warning" />
          <span>Announcements Broadcaster Board</span>
        </h3>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        View general campus broad notices. Access the notice board via the top bar notices indicator menu.
      </p>
    </div>
  );

  const renderSeatPlansCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <PlusCircle size={18} className="text-primary" />
          <span>Seat Assignment Configuration</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Class Section</th>
              <th>Seating Layout Pattern</th>
              <th>Audited Rows</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Grade 11 Science-A</strong></td>
              <td>Alternate columns roll seating</td>
              <td>6 Rows x 6 Seats</td>
              <td><span className="badge badge-success">COMPLETED</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSalaryCard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {salaries.length > 0 ? (
        salaries.map((s) => (
          <div key={s.id} className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <DollarSign size={18} className="text-success" />
                <span>Salary Slip Statement - {s.payPeriod}</span>
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <p><strong>Employee:</strong> {s.user?.name || profile?.name} ({s.user?.role || role})</p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Basic Salary:</span>
                <span>NPR {s.basicSalary.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Allowances:</span>
                <span className="text-success">+NPR {s.allowances.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Deductions:</span>
                <span className="text-danger">-NPR {s.deductions.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                <span style={{ fontWeight: 600 }}>Net Disbursed Salary:</span>
                <span className="text-success" style={{ fontWeight: 700 }}>NPR {s.netSalary.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>Disbursal Period:</span>
                <span>{s.payPeriod}</span>
              </div>
              <span className={`badge ${s.status === 'PAID' ? 'badge-success' : 'badge-danger'}`} style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                {s.status === 'PAID' ? 'PAID & DISBURSED' : 'UNPAID / PENDING'}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <DollarSign size={18} className="text-success" />
              <span>Salary Ledger Status</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <p><strong>Salary Term: Asar 2083</strong></p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Basic Salary:</span>
              <span>NPR 40,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Allowances:</span>
              <span>NPR 2,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Deductions:</span>
              <span className="text-danger">NPR 500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
              <span style={{ fontWeight: 600 }}>Net Disbursed:</span>
              <span className="text-success" style={{ fontWeight: 600 }}>NPR 41,500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Paid Date:</span>
              <span>2083-03-16 BS</span>
            </div>
            <span className="badge badge-success" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              PAID & VERIFIED
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Render Sub-Page logic depending on active staff role
  const renderSubPageContent = () => {
    const sub = subPage?.toLowerCase();
    
    if (sub === 'notices') {
      return renderNoticesCard();
    }

    if (sub === 'calendar' || sub === 'academic-calendar') {
      return <AcademicCalendarManager userRole={role.replace('_', ' ')} />;
    }

    if (sub === 'salary') {
      return renderSalaryCard();
    }

    if (role === 'HR') {
      if (sub === 'attendance') return renderHRAttendanceLogs();
      return renderHREmployeeRegistry();
    }

    if (role === 'LIBRARIAN') {
      switch (sub) {
        case 'books':
          return renderLibrarianCheckedOut();
        default:
          return <div className={styles.sectionCard}><p>Library inventory operation: {subPage}</p></div>;
      }
    }

    if (role === 'EXAM_DEPT') {
      if (sub === 'seats') return renderSeatPlansCard();
      return renderExamSessions();
    }

    return <div className={styles.sectionCard}><p>Staff operation module placeholder.</p></div>;
  };

  return (
    <div className={styles.container + " fade-in"}>
      {!subPage ? (
        <>
          {/* Header */}
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeText}>
              <h2>Campus Administrative Operations</h2>
              <p>Logged in as: <strong>{profile.name}</strong> ({role.replace('_', ' ')})</p>
            </div>
          </div>

          {/* Role overview */}
          {role === 'HR' && (
            <>
              {/* HR Widgets */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Instructors Count</span>
                    <span className={styles.statValue}>28</span>
                    <span className={styles.statDesc}>Full-time faculties</span>
                  </div>
                  <div className={`${styles.statIcon} ${styles.primaryIcon}`}>
                    <Users size={22} />
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Support Staff Count</span>
                    <span className={styles.statValue}>14</span>
                    <span className={styles.statDesc}>Librarians, Cashiers, Cleaners</span>
                  </div>
                  <div className={`${styles.statIcon} ${styles.successIcon}`}>
                    <Briefcase size={22} />
                  </div>
                </div>
              </div>
              {renderHREmployeeRegistry()}
            </>
          )}

          {role === 'LIBRARIAN' && (
            <>
              {/* Librarian stats */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Library Catalog Count</span>
                    <span className={styles.statValue}>4,520</span>
                    <span className={styles.statDesc}>Books in collection</span>
                  </div>
                  <div className={`${styles.statIcon} ${styles.primaryIcon}`}>
                    <Library size={22} />
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Active Checked Outs</span>
                    <span className={styles.statValue}>18</span>
                    <span className={styles.statDesc}>Due for return this week</span>
                  </div>
                  <div className={`${styles.statIcon} ${styles.warningIcon}`}>
                    <BookOpen size={22} />
                  </div>
                </div>
              </div>
              {renderLibrarianCheckedOut()}
            </>
          )}

          {role === 'EXAM_DEPT' && (
            <div className={styles.mainGrid}>
              {renderExamSessions()}
              {renderExamForm()}
            </div>
          )}
        </>
      ) : (
        <div style={{ marginTop: '24px' }}>
          {renderSubPageContent()}
        </div>
      )}
    </div>
  );
}
