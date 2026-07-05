'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './DashboardComponents.module.css';
import AcademicCalendarManager from './AcademicCalendarManager';
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
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  // Search & Grade Card State
  const [selectedClass, setSelectedClass] = useState('Grade 11 Science-A');
  const [selectedExam, setSelectedExam] = useState('First Term Examination 2083');
  const [showGradeCard, setShowGradeCard] = useState(false);

  // Fee Detail State
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [showFeeDetail, setShowFeeDetail] = useState(false);

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
      if (meData.user?.studentProfile?.class) {
        const clsName = `${meData.user.studentProfile.class.name} ${meData.user.studentProfile.class.section || ''}`.trim();
        setSelectedClass(clsName);
      }

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

      // 8. Fetch Financial Timeline Audit Log
      if (meData.user?.studentProfile?.id) {
        const timeRes = await fetch(`/api/financial-audit?mode=timeline&entityId=${meData.user.studentProfile.id}&entityType=STUDENT`);
        if (timeRes.ok) {
          const timeData = await timeRes.json();
          setTimelineEvents(timeData.timeline || []);
        }
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

  const renderExamsCard = () => {
    // Get filtered results for the selected exam session
    const filteredResults = results.filter(r => {
      const examName = r.exam?.name || r.examSchedule?.title || '';
      return examName.toLowerCase() === selectedExam.toLowerCase();
    });

    const defaultFirstTerm = [
      { id: 'def-1', subject: { name: 'Mathematics', code: 'MTH-111' }, marksObtained: 94, totalMarks: 100, passMarks: 40, grade: 'A+' },
      { id: 'def-2', subject: { name: 'Physics', code: 'PHY-112' }, marksObtained: 82, totalMarks: 100, passMarks: 40, grade: 'A' },
      { id: 'def-3', subject: { name: 'Chemistry', code: 'CHM-113' }, marksObtained: 78, totalMarks: 100, passMarks: 40, grade: 'B+' }
    ];
    const defaultSecondTerm = [
      { id: 'def-4', subject: { name: 'Mathematics', code: 'MTH-111' }, marksObtained: 88, totalMarks: 100, passMarks: 40, grade: 'A' },
      { id: 'def-5', subject: { name: 'Physics', code: 'PHY-112' }, marksObtained: 85, totalMarks: 100, passMarks: 40, grade: 'A' }
    ];

    let currentResults = filteredResults.length > 0 
      ? filteredResults 
      : (selectedExam === 'First Term Examination 2083' ? defaultFirstTerm : defaultSecondTerm);

    if (selectedClass === 'Grade 12 Science-A') {
      currentResults = [];
    }

    const totalSecured = currentResults.reduce((acc, r) => acc + (r.marksObtained || 0), 0);
    const totalFull = currentResults.reduce((acc, r) => acc + (r.totalMarks || 100), 0);
    const averagePercentage = totalFull > 0 ? Math.round((totalSecured / totalFull) * 100) : 0;

    const getGPFromGrade = (grade: string) => {
      switch (grade) {
        case 'A+': return 4.0;
        case 'A': return 3.6;
        case 'B+': return 3.2;
        case 'B': return 2.8;
        case 'C+': return 2.4;
        case 'C': return 2.0;
        default: return 0.0;
      }
    };

    const gpa = currentResults.length > 0 
      ? (currentResults.reduce((acc, r) => acc + getGPFromGrade(r.grade || 'F'), 0) / currentResults.length).toFixed(2)
      : '0.00';

    const overallStatus = currentResults.some(r => r.grade === 'F') ? 'FAILED' : 'PASSED';

    return (
      <div className={styles.sectionCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <GraduationCap size={18} className="text-success" />
            <span>Academic Examination Results</span>
          </h3>
        </div>

        {/* Search Panel */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-end', background: 'var(--primary-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1', minWidth: '180px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Class Program</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            >
              <option value="Grade 11 Science-A">Grade 11 - Science-A</option>
              <option value="Grade 12 Science-A">Grade 12 - Science-A</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1', minWidth: '220px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Exam Session</label>
            <select 
              value={selectedExam} 
              onChange={(e) => setSelectedExam(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            >
              <option value="First Term Examination 2083">First Term Examination 2083</option>
              <option value="Second Term Examination 2083">Second Term Examination 2083</option>
            </select>
          </div>

          <button 
            onClick={() => {
              if (currentResults.length > 0) {
                setShowGradeCard(true);
              }
            }}
            className="btn-primary"
            style={{ 
              height: '42px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              borderRadius: '8px', 
              fontWeight: '600', 
              padding: '0 20px', 
              cursor: currentResults.length > 0 ? 'pointer' : 'not-allowed',
              opacity: currentResults.length > 0 ? 1 : 0.6
            }}
            disabled={currentResults.length === 0}
          >
            <GraduationCap size={16} />
            <span>Generate Grade Card</span>
          </button>
        </div>


        {/* Modal Overlay for Grade Card */}
        {showGradeCard && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(6, 10, 18, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              maxWidth: '750px',
              width: '100%',
              boxShadow: 'var(--shadow-premium)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)',
                color: '#ffffff',
                padding: '24px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                  {profile?.college?.name || 'Everest College'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>
                  Official Transcript & Grade Report
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowGradeCard(false); }}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '65vh' }}>
                {/* Student Info */}
                <div style={{
                  background: 'var(--primary-light)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Student Name</span>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{profile?.name || 'Niranjan Thapa'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Roll Number</span>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{profile?.studentProfile?.rollNumber || '12'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Academic Class</span>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedClass}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Exam Session</span>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedExam}</p>
                  </div>
                </div>

                {/* Grades Table */}
                <div className={styles.tableWrapper} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                  <table className={styles.table} style={{ margin: 0 }}>
                    <thead style={{ backgroundColor: 'var(--primary-light)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px' }}>Subject</th>
                        <th>Subject Code</th>
                        <th>Full Marks</th>
                        <th>Pass Marks</th>
                        <th>Marks Secured</th>
                        <th>Grade Letter</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResults.map((r: any, idx: number) => {
                        const subjectName = r.subject?.name || r.subjectName || 'Subject';
                        const subjectCode = r.subject?.code || r.subjectCode || '—';
                        return (
                          <tr key={r.id || idx}>
                            <td style={{ padding: '12px 16px' }}><strong>{subjectName}</strong></td>
                            <td><code>{subjectCode}</code></td>
                            <td>{r.totalMarks || 100}</td>
                            <td>{r.passMarks || 40}</td>
                            <td><strong style={{ color: 'var(--secondary)' }}>{r.marksObtained}</strong></td>
                            <td>
                              <span className={`badge ${r.grade === 'F' ? 'badge-danger' : 'badge-success'}`}>
                                {r.grade || '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Performance Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                  marginTop: '6px'
                }}>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Secured Marks</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>
                      {totalSecured} / {totalFull}
                    </p>
                  </div>
                  
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Percentage</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>
                      {averagePercentage}%
                    </p>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>GPA Equivalent</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px', color: 'var(--secondary)' }}>
                      {gpa}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`badge ${overallStatus === 'PASSED' ? 'badge-success' : 'badge-danger'}`} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        {overallStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 28px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                backgroundColor: 'var(--bg-main)'
              }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowGradeCard(false); }}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Close
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); window.print(); }}
                  style={{
                    backgroundColor: 'var(--secondary)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Print Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
          <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{f.feeStructure.title}</p>
              <span className={`badge ${f.status === 'PAID' ? 'badge-success' : f.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>
                {f.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Bill Amount: NPR {f.feeStructure.amount}</span>
              <button 
                onClick={() => { setSelectedFee(f); setShowFeeDetail(true); }}
                style={{ background: 'transparent', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
              >
                View Fee Detail →
              </button>
            </div>
          </div>
        ))
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontWeight: 700 }}>Tuition Fee - Shrawan 2083</p>
            <span className="badge badge-warning">PARTIAL</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Bill Amount: NPR 8,500</span>
            <button 
              onClick={() => {
                setSelectedFee({
                  feeStructure: { title: 'Tuition Fee - Shrawan 2083', amount: 8500, dueDateBS: '2083-04-18' },
                  amountPaid: 5000,
                  dueAmount: 3500,
                  status: 'PARTIAL'
                });
                setShowFeeDetail(true);
              }}
              style={{ background: 'transparent', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
            >
              View Fee Detail →
            </button>
          </div>
        </div>
      )}

      {/* College Bill Modal */}
      {showFeeDetail && selectedFee && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(6, 10, 18, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: 'var(--shadow-premium)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Invoice Header */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: '#ffffff',
              padding: '24px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {profile?.college?.name || 'Everest College'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>
                OFFICIAL COLLEGE INVOICE & BILL
              </p>
              <button 
                onClick={() => setShowFeeDetail(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Invoice Body */}
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '65vh' }}>
              {/* Student Metadata Grid */}
              <div style={{
                background: 'var(--primary-light)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Student Name</span>
                  <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{profile?.name || 'Niranjan Thapa'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Roll Number</span>
                  <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{profile?.studentProfile?.rollNumber || '12'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Class Program</span>
                  <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedClass}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Bill Title</span>
                  <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedFee.feeStructure.title}</p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className={styles.tableWrapper} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <table className={styles.table} style={{ margin: 0 }}>
                  <thead style={{ backgroundColor: 'var(--primary-light)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>Fee Particular Item Description</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px' }}>Amount (NPR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 16px' }}>Monthly Tuition Fee (Grade 11 Science)</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px' }}>NPR {Math.round(selectedFee.feeStructure.amount * 0.7)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px' }}>Laboratory & Science Material Charges</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px' }}>NPR {Math.round(selectedFee.feeStructure.amount * 0.18)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px' }}>Library Resource Fee & Sports Fund</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px' }}>NPR {selectedFee.feeStructure.amount - Math.round(selectedFee.feeStructure.amount * 0.7) - Math.round(selectedFee.feeStructure.amount * 0.18)}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--primary-light)', fontWeight: 'bold', borderTop: '2px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px' }}>Gross Total Bill Amount</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px' }}>NPR {selectedFee.feeStructure.amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payments ledger summary */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Charged Gross Amount:</span>
                  <span style={{ fontWeight: 600 }}>NPR {selectedFee.feeStructure.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payments Deposited:</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>NPR {selectedFee.amountPaid}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                  <span style={{ fontWeight: 700 }}>Outstanding Balance Due:</span>
                  <span style={{ color: 'var(--danger)', fontWeight: 800 }}>NPR {selectedFee.dueAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Due Date Deadline:</span>
                  <span>{selectedFee.feeStructure.dueDateBS || '2083-04-18'}</span>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{
                backgroundColor: selectedFee.status === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${selectedFee.status === 'PAID' ? 'var(--success)' : 'var(--danger)'}`,
                color: selectedFee.status === 'PAID' ? 'var(--success)' : 'var(--danger)',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                BILL STATUS: {selectedFee.status === 'PAID' ? 'FULLY SETTLED' : 'PARTIALLY OUTSTANDING'}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 28px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: 'var(--bg-main)'
            }}>
              <button 
                onClick={() => setShowFeeDetail(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Close Bill
              </button>
              <button 
                onClick={() => window.print()}
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Print Bill Receipt
              </button>
            </div>
          </div>
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
        return renderFeeLedgerCard();
      case 'receipts':
        return (
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
        );
      case 'timeline':
        return (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <FileText size={18} className="text-primary" />
                <span>Financial Timeline & Audit Trail</span>
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Event Details</th>
                    <th>Timestamp</th>
                    <th>Module / Role</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineEvents.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No audit timeline events found for your account yet.
                      </td>
                    </tr>
                  ) : (
                    timelineEvents.map((evt, idx) => (
                      <tr key={idx}>
                        <td><span className="badge badge-primary">{evt.action}</span></td>
                        <td>
                          <strong>{evt.reason}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                            Details: {evt.newValue ? JSON.stringify(evt.newValue).slice(0, 50) + '...' : 'N/A'}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{evt.date} {evt.time}</td>
                        <td style={{ fontSize: '0.8rem' }}>{evt.module} ({evt.role})</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'results':
        return renderExamsCard();
      case 'seats':
        return (
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
      case 'calendar':
      case 'academic-calendar':
        return <AcademicCalendarManager userRole="Student" />;
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
