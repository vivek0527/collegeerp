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
import AcademicCalendarManager from './AcademicCalendarManager';

export default function ParentDashboard({ subPage }: { subPage?: string }) {
  const { formatDate } = useDate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);

  // Search & Grade Card State
  const [results, setResults] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('Grade 11 Science-A');
  const [selectedExam, setSelectedExam] = useState('First Term Examination 2083');
  const [showGradeCard, setShowGradeCard] = useState(false);
  // Fee Detail State
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [showFeeDetail, setShowFeeDetail] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch('/api/auth/me');
        let childId = '';
        if (meRes.ok) {
          const meData = await meRes.json();
          setProfile(meData.user);
          
          if (meData.user?.parentProfile?.students?.[0]) {
            const childObj = meData.user.parentProfile.students[0];
            childId = childObj.id;
            if (childObj.class) {
              const clsName = `${childObj.class.name} ${childObj.class.section || ''}`.trim();
              setSelectedClass(clsName);
            }
          }
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
        const resRes = await fetch(`/api/exams?mode=results${childId ? `&studentId=${childId}` : ''}`);
        if (resRes.ok) {
          const resData = await resRes.json();
          setResults(resData.results || []);
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
            <GraduationCap size={18} className="text-primary" />
            <span>Your Child's Examination Results</span>
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
                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{child?.user?.name || 'Niranjan Thapa'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Roll Number</span>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{child?.rollNumber || '12'}</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {fees.length > 0 ? (
        fees.map((f) => (
          <div key={f.id} className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <CreditCard size={18} className="text-danger" />
                <span>Child Financial Status - {f.feeStructure.title}</span>
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>{f.feeStructure.title}</span>
                <span className={`badge ${f.status === 'PAID' ? 'badge-success' : f.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>
                  {f.status === 'PAID' ? 'FULLY PAID' : f.status === 'PARTIAL' ? 'PARTIALLY PAID' : 'UNPAID / OVERDUE'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bill Amount: NPR {f.feeStructure.amount}</span>
                <button 
                  onClick={() => { setSelectedFee(f); setShowFeeDetail(true); }}
                  style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                >
                  View Fee Detail →
                </button>
              </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Tuition Fee - Shrawan 2083</span>
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
                style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
              >
                View Fee Detail →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* College Bill Modal for Parent */}
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
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color: '#ffffff',
              padding: '24px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {profile?.college?.name || 'Everest College'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>
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
                  <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{child?.user?.name || 'Niranjan Thapa'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Roll Number</span>
                  <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{child?.rollNumber || '12'}</p>
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
                  backgroundColor: '#dc2626',
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
        return renderAttendanceCard();
      case 'fees':
        return renderFeesCard();
      case 'results':
        return renderExamsCard();
      case 'seats':
        return (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                    <Calendar size={18} className="text-warning" />
                    <span>Child's Terminal Examination Seat Assignment</span>
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
      case 'notices':
        return renderNoticesCard();
      case 'calendar':
      case 'routine':
      case 'events':
      case 'academic-calendar':
        return <AcademicCalendarManager userRole="Parent" />;
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
