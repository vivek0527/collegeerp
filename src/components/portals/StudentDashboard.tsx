'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './DashboardComponents.module.css';
import { useDate } from '../DateContext';
import {
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  Clock,
  Send,
  UserCheck,
  Bell,
} from 'lucide-react';

export default function StudentDashboard({ subPage }: { subPage?: string }) {
  const { formatDate } = useDate();
  const router = useRouter();

  // Data State
  const [profile, setProfile] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({ total: 5, present: 4, percentage: 80 });
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  // Form State
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Profile
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) return;
      const meData = await meRes.json();
      setProfile(meData.user);

      // 2. Fetch Attendance
      const attRes = await fetch('/api/attendance');
      if (attRes.ok) {
        const attData = await attRes.json();
        if (attData.stats) setAttendanceStats(attData.stats);
      }

      // 3. Fetch Fees
      const feeRes = await fetch('/api/fees?mode=allocations');
      if (feeRes.ok) {
        const feeData = await feeRes.json();
        setFees(feeData.allocations || []);
      }

      // 4. Fetch Results
      const resRes = await fetch('/api/exams?mode=results');
      if (resRes.ok) {
        const resData = await resRes.json();
        setResults(resData.results || []);
      }

      // 5. Fetch Notices
      const noticeRes = await fetch('/api/notices');
      if (noticeRes.ok) {
        const noticeData = await noticeRes.json();
        setNotices(noticeData.notices || []);
      }

      // 6. Fetch Complaints
      const compRes = await fetch('/api/complaints');
      if (compRes.ok) {
        const compData = await compRes.json();
        setComplaints(compData.complaints || []);
      }

      // 7. Fetch Study Materials
      const matsRes = await fetch('/api/study-materials');
      if (matsRes.ok) {
        const matsData = await matsRes.json();
        setMaterials(matsData.materials || []);
      }

    } catch (e) {
      console.error('Failed fetching student metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintTitle || !complaintDesc) return;

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: complaintTitle,
          description: complaintDesc,
          isAnonymous,
        }),
      });

      if (res.ok) {
        setFormMsg({ text: 'Safety complaint logged successfully with the principal.', type: 'success' });
        setComplaintTitle('');
        setComplaintDesc('');
        setIsAnonymous(false);
        // Refresh complaints
        const compRes = await fetch('/api/complaints');
        if (compRes.ok) {
          const compData = await compRes.json();
          setComplaints(compData.complaints || []);
        }
      } else {
        setFormMsg({ text: 'Failed to report complaint. Try again.', type: 'error' });
      }
    } catch (err) {
      setFormMsg({ text: 'Network connection failed.', type: 'error' });
    }
  };

  if (loading || !profile) {
    return (
      <div className={styles.container}>
        <p>Loading your campus records logs...</p>
      </div>
    );
  }

  const student = profile.studentProfile;
  const studentClass = student?.class;

  const renderTodaySchedule = () => (
    <div className={styles.sectionCard} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', padding: '24px' }}>
      <div className={styles.cardHeader} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '16px' }}>
        <h3 className={styles.cardTitle} style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
          Today's Schedule
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563EB', background: 'rgba(37, 99, 235, 0.06)', padding: '4px 8px', borderRadius: '4px', minWidth: '95px', textAlign: 'center' }}>09:00 - 09:45</span>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>Mathematics</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Mr. Santosh Dahal (Room 302)</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563EB', background: 'rgba(37, 99, 235, 0.06)', padding: '4px 8px', borderRadius: '4px', minWidth: '95px', textAlign: 'center' }}>09:45 - 10:30</span>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>Physics</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Physics Faculty (Room 304)</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#d97706', background: 'rgba(217, 119, 6, 0.06)', padding: '4px 8px', borderRadius: '4px', minWidth: '95px', textAlign: 'center' }}>10:30 - 11:00</span>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#d97706' }}>Recess Break</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Intermission</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563EB', background: 'rgba(37, 99, 235, 0.06)', padding: '4px 8px', borderRadius: '4px', minWidth: '95px', textAlign: 'center' }}>11:00 - 11:45</span>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>Chemistry</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Chemistry Faculty (Lab B)</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUpcomingExamCountdown = () => (
    <div className={styles.sectionCard} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', padding: '24px' }}>
      <div className={styles.cardHeader} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '12px' }}>
        <h3 className={styles.cardTitle} style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
          Upcoming Examination
        </h3>
      </div>
      <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Event</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}>First Term Exam</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Subject</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563EB' }}>Physics</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Seat Assignment</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}>Room 304 | Seat #B-19</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Exam Date</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#EF4444' }}>Tomorrow (16 Asar)</span>
        </div>
      </div>
    </div>
  );

  const renderNoticesHome = () => (
    <div className={styles.sectionCard} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', padding: '24px' }}>
      <div className={styles.cardHeader} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className={styles.cardTitle} style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
          Latest Announcements
        </h3>
        <Link href="/portal/student/notices" style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>
          View All
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {notices.length > 0 ? (
          notices.slice(0, 2).map((n) => (
            <div key={n.id} style={{ borderLeft: '3px solid #2563EB', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}>{n.title}</span>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>{n.content.substring(0, 70)}...</p>
            </div>
          ))
        ) : (
          <div style={{ borderLeft: '3px solid #2563EB', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}>Welcome to ORBYA ERP</span>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>Access assignments, routines, and academic reports from this platform.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeeSummaryHome = () => (
    <div className={styles.sectionCard} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', padding: '24px' }}>
      <div className={styles.cardHeader} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className={styles.cardTitle} style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
          Outstanding Tuition Bills
        </h3>
        <Link href="/portal/student/fees" style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>
          Billing Ledger
        </Link>
      </div>
      <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Due Balance</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#EF4444', marginTop: '2px' }}>
            NPR {fees.length > 0 ? fees.reduce((acc, curr) => acc + curr.dueAmount, 0) : '3,500'}
          </div>
        </div>
        <button 
          onClick={() => router.push('/portal/student/fees')}
          style={{ backgroundColor: '#2563EB', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)' }}
        >
          Pay Now
        </button>
      </div>
    </div>
  );

  const renderExamsCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <GraduationCap size={18} className="text-success" />
          <span>Academic Examination Results</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Exam Event</th>
              <th>Subject</th>
              <th>Full Marks</th>
              <th>Marks Secured</th>
              <th>Grade</th>
              <th>Result Date Status</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.examSchedule.title}</strong></td>
                  <td>{r.examSchedule.subject.name}</td>
                  <td>{r.examSchedule.fullMarks}</td>
                  <td>{r.marksObtained}</td>
                  <td><span className="badge badge-success">{r.grade}</span></td>
                  <td>{formatDate(r.createdAt)}</td>
                </tr>
              ))
            ) : (
              <>
                <tr>
                  <td><strong>First Term Exam</strong></td>
                  <td>Physics</td>
                  <td>100</td>
                  <td>82</td>
                  <td><span className="badge badge-success">A</span></td>
                  <td>16 Asar 2083</td>
                </tr>
                <tr>
                  <td><strong>First Term Exam</strong></td>
                  <td>Mathematics</td>
                  <td>100</td>
                  <td>94</td>
                  <td><span className="badge badge-success">A+</span></td>
                  <td>16 Asar 2083</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderComplaintsCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <AlertCircle size={18} className="text-danger" />
          <span>Safety & Student Complaint Registry</span>
        </h3>
      </div>

      <form onSubmit={handleComplaintSubmit} className={styles.form} style={{ marginBottom: '20px' }}>
        {formMsg.text && (
          <div className={`${styles.feedbackMessage} ${formMsg.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
            {formMsg.text}
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="comp-title">Incident Title / Nature</label>
          <input
            id="comp-title"
            type="text"
            placeholder="E.g., Bullying, Lab hazard, classroom query"
            value={complaintTitle}
            onChange={(e) => setComplaintTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="comp-desc">Description details</label>
          <textarea
            id="comp-desc"
            rows={4}
            placeholder="Provide precise details of the location, time, and incident description."
            value={complaintDesc}
            onChange={(e) => setComplaintDesc(e.target.value)}
            required
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span>File this report anonymously (hides your name from admin view)</span>
          </label>
        </div>

        <button type="submit" className="btn-primary" style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
          <Send size={16} />
          <span>File Safety Report</span>
        </button>
      </form>

      {/* List student's filed complaints */}
      {complaints.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Your Filed Safety Records</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Resolution Feedback</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>
                      <span className={`badge ${c.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.responseContent || 'Awaiting administrator audit.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
          notices.map((n) => (
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
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', alignSelf: 'flex-end' }}>
                By: {n.createdBy?.name || 'Administrator'} ({n.createdBy?.role || 'MANAGEMENT'})
              </span>
            </div>
          ))
        ) : (
          <div className={styles.noticeItem}>
            <div className={styles.noticeHeader}>
              <span className={styles.noticeTitle}>Welcome to the Digital Campus SaaS Platform!</span>
              <span className={styles.noticeDate}>2026-07-01</span>
            </div>
            <p className={styles.noticeBody}>
              We are thrilled to launch the new college management ERP. Students, teachers, and parents can now access assignments, routines, fees, and marks in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeeLedgerCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <CreditCard size={18} className="text-success" />
          <span>Fee Ledger Status</span>
        </h3>
      </div>
      {fees.length > 0 ? (
        fees.map((f) => (
          <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <p><strong>{f.feeStructure.title}</strong></p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Bill Amount:</span>
              <span>NPR {f.feeStructure.amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Paid:</span>
              <span className="text-success" style={{ fontWeight: 600 }}>NPR {f.amountPaid}</span>
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
              {f.status}
            </span>
          </div>
        ))
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
          <p><strong>Tuition Fee - Shrawan 2083</strong></p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Bill Amount:</span>
            <span>NPR 8,500</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Paid:</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>NPR 5,000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
            <span style={{ fontWeight: 600 }}>Due Balance:</span>
            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>NPR 3,500</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Due Date:</span>
            <span>2083-04-18 BS (2026-08-01 AD)</span>
          </div>
          <span className="badge badge-warning" style={{ alignSelf: 'flex-start' }}>
            PARTIAL
          </span>
        </div>
      )}
    </div>
  );

  const renderSubPageContent = () => {
    switch (subPage?.toLowerCase()) {
      case 'attendance':
        return (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <UserCheck size={18} className="text-primary" />
                <span>Attendance Log Audits</span>
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date (AD / BS)</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2026-07-01 / 16 Asar 2083</td>
                    <td><span className="badge badge-success">PRESENT</span></td>
                    <td>On time arrival</td>
                  </tr>
                  <tr>
                    <td>2026-06-30 / 15 Asar 2083</td>
                    <td><span className="badge badge-success">PRESENT</span></td>
                    <td>Regular class</td>
                  </tr>
                  <tr>
                    <td>2026-06-29 / 14 Asar 2083</td>
                    <td><span className="badge badge-danger">ABSENT</span></td>
                    <td>Sick leave filed</td>
                  </tr>
                  <tr>
                    <td>2026-06-28 / 13 Asar 2083</td>
                    <td><span className="badge badge-success">PRESENT</span></td>
                    <td>Regular class</td>
                  </tr>
                  <tr>
                    <td>2026-06-27 / 12 Asar 2083</td>
                    <td><span className="badge badge-success">PRESENT</span></td>
                    <td>Regular class</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'fees':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {renderFeeLedgerCard()}
            <div className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <CreditCard size={18} className="text-success" />
                  <span>Payment Receipts Log</span>
                </h3>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Receipt ID</th>
                      <th>Amount Paid</th>
                      <th>Method</th>
                      <th>Transaction Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>REC-83021</strong></td>
                      <td>NPR 5,000</td>
                      <td>eSewa Digital Wallet</td>
                      <td>12 Asar 2083</td>
                      <td><span className="badge badge-success">CONFIRMED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'exams':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {renderExamsCard()}
            <div className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Calendar size={18} className="text-warning" />
                  <span>Terminal Examination Seat Assignment</span>
                </h3>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Exam Code</th>
                      <th>Subject Name</th>
                      <th>Room Code / Floor</th>
                      <th>Seat Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>MTH-111</strong></td>
                      <td>Mathematics</td>
                      <td>Room 302 - Block B (3rd Floor)</td>
                      <td>Seat #B-42</td>
                    </tr>
                    <tr>
                      <td><strong>PHY-112</strong></td>
                      <td>Physics</td>
                      <td>Room 304 - Block B (3rd Floor)</td>
                      <td>Seat #B-19</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'materials':
        return (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <FileText size={18} className="text-primary" />
                <span>Reference Study Materials & Assignments</span>
              </h3>
            </div>
            <div className={styles.tableWrapper} style={{ marginTop: '12px' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Material / Reference Name</th>
                    <th>Description / Teacher Notes</th>
                    <th>Uploaded By</th>
                    <th>Published Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length > 0 ? (
                    materials.map((mat) => (
                      <tr key={mat.id}>
                        <td><span className="badge badge-primary">{mat.subject?.name || 'Subject'}</span></td>
                        <td><strong>{mat.title}</strong></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mat.description || 'No notes provided.'}</td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{mat.subject?.teacher?.user?.name || 'Subject Teacher'}</td>
                        <td style={{ fontSize: '0.8rem' }}>{new Date(mat.createdAt).toLocaleDateString()}</td>
                        <td>
                          <a
                            href={mat.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="badge badge-success"
                            style={{ textDecoration: 'none' }}
                          >
                            Open Reference
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                        No study materials published for your course subjects yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'notices':
        return renderNoticesCard();
      case 'complaints':
        return renderComplaintsCard();
      default:
        return (
          <div className={styles.sectionCard}>
            <p>Module "{subPage}" content placeholder.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.container + " fade-in"}>
      {!subPage ? (
        <>
          {/* Apple-style Premium Header Section â€” dashboard home only */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.8px', margin: 0 }}>
                Welcome back, {profile.name}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '4px 0 0 0', fontWeight: '500' }}>
                Class: {studentClass?.name || 'Grade 11'} - Section: {studentClass?.section || 'Science-A'} | Roll Number: {student?.rollNumber || '12'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Download ERP App
              </span>
              <button
                onClick={() => alert('Launching Google Play Store storefront...')}
                style={{ background: '#0B1F3A', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 10px rgba(11, 31, 58, 0.12)' }}
              >
                Google Play
              </button>
              <button
                onClick={() => alert('Launching iOS App Store storefront...')}
                style={{ background: '#0B1F3A', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 10px rgba(11, 31, 58, 0.12)' }}
              >
                App Store
              </button>
            </div>
          </div>

          {/* KPI Cards â€” dashboard home only */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', padding: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className={styles.statLabel} style={{ color: '#64748B', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Attendance Registry</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0' }}>
                  <span className={styles.statValue} style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A' }}>{attendanceStats.percentage}%</span>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>+5% improvement</span>
                </div>
                <span className={styles.statDesc} style={{ color: '#64748B', fontSize: '0.8rem' }}>{attendanceStats.present} of {attendanceStats.total} lecture days present</span>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${attendanceStats.percentage}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '10px', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>
              <div className={`${styles.statIcon} ${styles.successIcon}`} style={{ alignSelf: 'flex-start', background: 'rgba(16, 185, 129, 0.08)', color: '#10B981' }}>
                <UserCheck size={20} />
              </div>
            </div>

            <div className={styles.statCard} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', padding: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className={styles.statLabel} style={{ color: '#64748B', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Campus Ledger Balance</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0' }}>
                  <span className={styles.statValue} style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A' }}>
                    NPR {fees.length > 0 ? fees.reduce((acc, curr) => acc + curr.dueAmount, 0) : '3,500'}
                  </span>
                  <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B' }}>
                    {fees[0]?.status || 'PARTIAL'}
                  </span>
                </div>
                <span className={styles.statDesc} style={{ color: '#64748B', fontSize: '0.8rem' }}>Next invoice due within academic term</span>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', backgroundColor: '#F59E0B', borderRadius: '10px' }}></div>
                </div>
              </div>
              <div className={`${styles.statIcon} ${styles.warningIcon}`} style={{ alignSelf: 'flex-start', background: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B' }}>
                <CreditCard size={20} />
              </div>
            </div>

            <div className={styles.statCard} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', padding: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className={styles.statLabel} style={{ color: '#64748B', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Grade Report Average</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0' }}>
                  <span className={styles.statValue} style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A' }}>
                    {results.length > 0 ? results[0].grade : 'A'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>1st Term</span>
                </div>
                <span className={styles.statDesc} style={{ color: '#64748B', fontSize: '0.8rem' }}>Audited from official exam department</span>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: '90%', height: '100%', backgroundColor: '#2563EB', borderRadius: '10px' }}></div>
                </div>
              </div>
              <div className={`${styles.statIcon} ${styles.primaryIcon}`} style={{ alignSelf: 'flex-start', background: 'rgba(37, 99, 235, 0.08)', color: '#2563EB' }}>
                <GraduationCap size={20} />
              </div>
            </div>
          </div>

          {/* Dashboard main grid â€” summary cards */}
          <div className={styles.mainGrid}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderTodaySchedule()}
              {renderUpcomingExamCountdown()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderNoticesHome()}
              {renderFeeSummaryHome()}
            </div>
          </div>

          {/* Course Class Time Table */}
          <div className={styles.sectionCard} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', padding: '24px' }}>
            <div className={styles.cardHeader} style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle} style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
                Course Class Time Table and Room#
              </h3>
            </div>
            <div className={styles.tableWrapper} style={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <table className={styles.timetableTable}>
                <thead>
                  <tr>
                    <th style={{ backgroundColor: '#0B1F3A', color: '#fff', fontWeight: '700', textTransform: 'uppercase', padding: '12px 10px', fontSize: '0.75rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>PERIOD / DAY</th>
                    {['08:00â€“08:55','09:00â€“09:55','10:00â€“10:55','11:05â€“12:00','12:00â€“13:15','13:15â€“14:10','14:15â€“15:10','15:15â€“16:10','16:20â€“17:15'].map(t => (
                      <th key={t} style={{ backgroundColor: '#0B1F3A', color: '#fff', padding: '12px 10px', fontSize: '0.75rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>{t.replace('â€“', '\u00A0hr\u000A').replace('â€“','â€“')}{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'].map((day, dIdx) => (
                    <tr key={day}>
                      <td style={{ fontWeight: '700', color: '#0F172A', borderRight: '1px solid #E2E8F0', borderBottom: dIdx === 4 ? 'none' : '1px solid #E2E8F0', padding: '14px 10px', fontSize: '0.75rem' }}>{day}</td>
                      <td style={{ borderRight: '1px solid #E2E8F0', borderBottom: dIdx === 4 ? 'none' : '1px solid #E2E8F0', color: '#94A3B8', textAlign: 'center' }}>-</td>
                      <td style={{ borderRight: '1px solid #E2E8F0', borderBottom: dIdx === 4 ? 'none' : '1px solid #E2E8F0' }}><div style={{ fontWeight: '700', color: '#2563EB', fontSize: '0.8rem' }}>Mathematics</div><div style={{ fontSize: '0.65rem', color: '#64748B' }}>Mr. Santosh Dahal</div></td>
                      <td style={{ borderRight: '1px solid #E2E8F0', borderBottom: dIdx === 4 ? 'none' : '1px solid #E2E8F0' }}><div style={{ fontWeight: '700', color: '#2563EB', fontSize: '0.8rem' }}>Physics</div><div style={{ fontSize: '0.65rem', color: '#64748B' }}>Physics Faculty</div></td>
                      <td style={{ borderRight: '1px solid #E2E8F0', borderBottom: dIdx === 4 ? 'none' : '1px solid #E2E8F0' }}><div style={{ fontWeight: '700', color: '#2563EB', fontSize: '0.8rem' }}>Chemistry</div><div style={{ fontSize: '0.65rem', color: '#64748B' }}>Chemistry Faculty</div></td>
                      <td className={styles.lunchCol} style={{ borderRight: '1px solid #E2E8F0', borderBottom: dIdx === 4 ? 'none' : '1px solid #E2E8F0', fontWeight: '800', color: '#2563EB', backgroundColor: 'rgba(37,99,235,0.04)', fontSize: '0.95rem', textAlign: 'center' }}>{day.charAt(0)}</td>
                      {[0,1,2,3].map(i => <td key={i} style={{ borderRight: i < 3 ? '1px solid #E2E8F0' : undefined, borderBottom: dIdx === 4 ? 'none' : '1px solid #E2E8F0', color: '#94A3B8', textAlign: 'center' }}>-</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Sub-page content only */
        <div>{renderSubPageContent()}</div>
      )}
    </div>
  );
}
