'use client';

import React, { useEffect, useState } from 'react';
import styles from './DashboardComponents.module.css';
import { useDate } from '../DateContext';
import {
  User,
  GraduationCap,
  Calendar,
  BookOpen,
  CheckCircle,
  FileText,
  UserCheck,
  Send,
  DollarSign,
  Briefcase,
  Bell,
  Trash2,
  Upload,
} from 'lucide-react';

export default function TeacherDashboard({ subPage }: { subPage?: string }) {
  const { formatDate } = useDate();
  
  // Data State
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<any[]>([]);
  
  // Interactive Attendance States
  const [selectedClass, setSelectedClass] = useState('Grade 11 Science-A');
  const [attendanceDate, setAttendanceDate] = useState('2083-03-17');
  const [attendanceSheet, setAttendanceSheet] = useState<any[]>([
    { studentId: 'stud-1', name: 'Niranjan Thapa', rollNumber: '12', status: 'PRESENT', remarks: '' },
    { studentId: 'stud-2', name: 'Alok Regmi', rollNumber: '03', status: 'PRESENT', remarks: '' },
    { studentId: 'stud-3', name: 'Priya Adhikari', rollNumber: '24', status: 'PRESENT', remarks: '' },
  ]);
  const [attMsg, setAttMsg] = useState({ text: '', type: '' });
  
  // Interactive Marks States
  const [selectedStudent, setSelectedStudent] = useState('Niranjan Thapa');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [marks, setMarks] = useState('');
  const [remarks, setRemarks] = useState('');
  const [gradeMsg, setGradeMsg] = useState({ text: '', type: '' });

  // Study Materials States
  const [materials, setMaterials] = useState<any[]>([]);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDesc, setMaterialDesc] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [materialSubjectId, setMaterialSubjectId] = useState('mock-subject-id');
  const [uploadMsg, setUploadMsg] = useState({ text: '', type: '' });
  const [uploadingMat, setUploadingMat] = useState(false);

  // Salary slip state
  const [salaries, setSalaries] = useState<any[]>([]);

  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadMsg({ text: 'File size must be less than 5MB.', type: 'error' });
      return;
    }

    setFileName(file.name);
    setUploadMsg({ text: '', type: '' });

    // Prefill title from file name
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    const base = file.name.replace(ext, '').replace(/[-_]/g, ' ');
    setMaterialTitle(base.charAt(0).toUpperCase() + base.slice(1));

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle || !fileData || !materialSubjectId) {
      setUploadMsg({ text: 'Please select a file and fill in all required fields.', type: 'error' });
      return;
    }

    setUploadingMat(true);
    setUploadMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/study-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: materialTitle,
          description: materialDesc,
          fileData,
          fileName,
          subjectId: materialSubjectId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUploadMsg({ text: 'Study material uploaded successfully!', type: 'success' });
        setMaterialTitle('');
        setMaterialDesc('');
        setFileData(null);
        setFileName('');
        // Re-fetch materials list
        const matsRes = await fetch('/api/study-materials');
        if (matsRes.ok) {
          const matsData = await matsRes.json();
          setMaterials(matsData.materials || []);
        }
      } else {
        setUploadMsg({ text: data.error || 'Failed to upload study material.', type: 'error' });
      }
    } catch {
      setUploadMsg({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setUploadingMat(false);
    }
  };

  const handleMaterialDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study material?')) return;

    try {
      const res = await fetch(`/api/study-materials?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMaterials(prev => prev.filter(m => m.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete material.');
      }
    } catch {
      alert('Network error. Failed to delete.');
    }
  };

  const fetchTeacherData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setProfile(meData.user);
        // Prefill subject ID from profile if available
        const firstSub = meData.user.teacherProfile?.subjects?.[0]?.id;
        if (firstSub) setMaterialSubjectId(firstSub);
      }

      const noticeRes = await fetch('/api/notices');
      if (noticeRes.ok) {
        const noticeData = await noticeRes.json();
        setNotices(noticeData.notices || []);
      }

      const matsRes = await fetch('/api/study-materials');
      if (matsRes.ok) {
        const matsData = await matsRes.json();
        setMaterials(matsData.materials || []);
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
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const handleStatusChange = (idx: number, status: string) => {
    const updated = [...attendanceSheet];
    updated[idx].status = status;
    setAttendanceSheet(updated);
  };

  const handleRemarksChange = (idx: number, text: string) => {
    const updated = [...attendanceSheet];
    updated[idx].remarks = text;
    setAttendanceSheet(updated);
  };

  const submitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttMsg({ text: 'Submitting attendance...', type: 'info' });
    
    // Simulate API call to /api/attendance
    setTimeout(() => {
      setAttMsg({ text: 'Attendance sheet submitted successfully!', type: 'success' });
    }, 800);
  };

  const submitGrades = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marks) return;
    setGradeMsg({ text: 'Submitting grades...', type: 'info' });

    // Simulate API call to /api/exams action: enterResult
    setTimeout(() => {
      setGradeMsg({ text: `Marks of ${marks} submitted for ${selectedStudent} under ${selectedSubject}!`, type: 'success' });
      setMarks('');
      setRemarks('');
    }, 800);
  };

  if (loading || !profile) {
    return (
      <div className={styles.container}>
        <p>Loading teacher records...</p>
      </div>
    );
  }

  const teacher = profile.teacherProfile;

  // Reusable components as render functions
  const renderAttendanceCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <UserCheck size={18} className="text-primary" />
          <span>Classroom Daily Attendance Console</span>
        </h3>
      </div>
      
      <form onSubmit={submitAttendance} className={styles.form}>
        {attMsg.text && (
          <div className={`${styles.feedbackMessage} ${attMsg.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
            {attMsg.text}
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="att-class">Select Target Class</label>
            <select
              id="att-class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="Grade 11 Science-A">Grade 11 Science-A (Room 102)</option>
              <option value="Grade 11 Science-B">Grade 11 Science-B (Room 104)</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="att-date">Attendance Date (BS Calendar)</label>
            <input
              id="att-date"
              type="text"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
        </div>

        {/* Student spreadsheet sheet */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Attendance Status</th>
                <th>Attendance Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendanceSheet.map((studentItem, idx) => (
                <tr key={studentItem.studentId}>
                  <td>{studentItem.rollNumber}</td>
                  <td><strong>{studentItem.name}</strong></td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="radio"
                          name={`status-${studentItem.studentId}`}
                          checked={studentItem.status === 'PRESENT'}
                          onChange={() => handleStatusChange(idx, 'PRESENT')}
                        />
                        <span>Present</span>
                      </label>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="radio"
                          name={`status-${studentItem.studentId}`}
                          checked={studentItem.status === 'ABSENT'}
                          onChange={() => handleStatusChange(idx, 'ABSENT')}
                        />
                        <span style={{ color: 'var(--danger)' }}>Absent</span>
                      </label>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Sick leave, late arrival, etc."
                      value={studentItem.remarks}
                      onChange={(e) => handleRemarksChange(idx, e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '0.8rem', width: '100%' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="submit" className="btn-primary" style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
          <CheckCircle size={16} />
          <span>Submit Attendance Sheets</span>
        </button>
      </form>
    </div>
  );

  const renderMarksCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <GraduationCap size={18} className="text-success" />
          <span>Student Grade Book & Marks Recording</span>
        </h3>
      </div>
      
      <form onSubmit={submitGrades} className={styles.form}>
        {gradeMsg.text && (
          <div className={`${styles.feedbackMessage} ${gradeMsg.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
            {gradeMsg.text}
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="grade-student">Select Student</label>
            <select
              id="grade-student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="Niranjan Thapa">Niranjan Thapa (Roll: 12)</option>
              <option value="Alok Regmi">Alok Regmi (Roll: 03)</option>
              <option value="Priya Adhikari">Priya Adhikari (Roll: 24)</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="grade-subject">Select Subject</label>
            <select
              id="grade-subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="Mathematics">Mathematics (MTH-111)</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="grade-marks">Marks Obtained (Out of 100)</label>
            <input
              id="grade-marks"
              type="number"
              step="0.1"
              placeholder="Enter marks, e.g. 84.5"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="grade-remarks">Academic Remarks</label>
            <input
              id="grade-remarks"
              type="text"
              placeholder="E.g. Analytical thinker, needs practice"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
          <Send size={16} />
          <span>Save Grades & Publish</span>
        </button>
      </form>
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
              <span className={styles.noticeTitle}>ERP Platform Online</span>
              <span className={styles.noticeDate}>2026-07-01</span>
            </div>
            <p className={styles.noticeBody}>
              System seeding finished. Teachers can now manage attendance and submit marks directly.
            </p>
          </div>
        )}
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
              <p><strong>Employee:</strong> {s.user?.name || profile?.name} ({s.user?.role || 'Teacher'})</p>
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
              <span>NPR 55,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Allowances:</span>
              <span>NPR 3,500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Deductions:</span>
              <span className="text-danger">NPR 1,200</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
              <span style={{ fontWeight: 600 }}>Net Disbursed:</span>
              <span className="text-success" style={{ fontWeight: 600 }}>NPR 57,300</span>
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

  const renderClassesCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Briefcase size={18} className="text-primary" />
          <span>Assigned Academic Sessions</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Class Section</th>
              <th>Subject</th>
              <th>Timing Schedule</th>
              <th>Room Assignment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Grade 11 Science-A</strong></td>
              <td>Mathematics (MTH-111)</td>
              <td>Mon - Fri | 09:00 - 09:45</td>
              <td>Room 102 (Block B, 1st Floor)</td>
            </tr>
            <tr>
              <td><strong>Grade 11 Science-B</strong></td>
              <td>Mathematics (MTH-111)</td>
              <td>Mon - Fri | 11:00 - 11:45</td>
              <td>Room 104 (Block B, 1st Floor)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUploadsCard = () => {
    const subjects = profile?.teacherProfile?.subjects || [];
    const allSubjects = subjects.length > 0 ? subjects : [
      { id: 'mock-subject-id', name: 'Mathematics', code: 'MTH-111' },
      { id: 'mock-subject-physics', name: 'Physics', code: 'PHY-112' },
      { id: 'mock-subject-chemistry', name: 'Chemistry', code: 'CHM-113' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <Upload size={18} className="text-primary" />
              <span>Publish Course References & Study Materials</span>
            </h3>
          </div>
          <form onSubmit={handleMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Select Course Subject *</label>
                <select
                  value={materialSubjectId}
                  onChange={(e) => setMaterialSubjectId(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: '#fff', fontSize: '0.85rem' }}
                >
                  {allSubjects.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Material Reference Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Calculus Derivatives Sheet"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Select File from Device *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid #E2E8F0',
                    textAlign: 'center',
                    flexShrink: 0
                  }}>
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                      onChange={handleMaterialFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '0.82rem', color: fileName ? '#0F172A' : '#94A3B8', fontWeight: fileName ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                    {fileName || 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Description / Teacher Notes</label>
              <textarea
                placeholder="Optional instructions or details for students registered under your course..."
                value={materialDesc}
                onChange={(e) => setMaterialDesc(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', minHeight: '60px', resize: 'vertical' }}
              />
            </div>

            {uploadMsg.text && (
              <div style={{
                padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
                background: uploadMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                color: uploadMsg.type === 'success' ? '#16A34A' : '#EF4444',
                border: `1px solid ${uploadMsg.type === 'success' ? '#DCFCE7' : '#FEE2E2'}`
              }}>
                {uploadMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={uploadingMat}
              style={{
                alignSelf: 'flex-start', padding: '10px 24px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #0B1F3A 0%, #2563EB 100%)',
                color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700,
                cursor: uploadingMat ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.1)'
              }}
            >
              {uploadingMat ? 'Publishing...' : 'Publish Material'}
            </button>
          </form>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <FileText size={18} className="text-primary" />
              <span>Your Published Materials</span>
            </h3>
          </div>
          <div className={styles.tableWrapper} style={{ marginTop: '12px' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Material / Reference Name</th>
                  <th>Description</th>
                  <th>Date Published</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.length > 0 ? (
                  materials.map((mat) => (
                    <tr key={mat.id}>
                      <td><span className="badge badge-primary">{mat.subject?.name || 'Mathematics'}</span></td>
                      <td>
                        <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                          {mat.title}
                        </a>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mat.description || 'No description'}</td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(mat.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleMaterialDelete(mat.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px' }}
                          title="Delete material"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                      No materials published yet. Use the form above to upload study references for your classes.
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
      case 'classes':
        return renderClassesCard();
      case 'attendance':
        return renderAttendanceCard();
      case 'marks':
        return renderMarksCard();
      case 'salary':
        return renderSalaryCard();
      case 'notices':
        return renderNoticesCard();
      case 'uploads':
        return renderUploadsCard();
      default:
        return (
          <div className={styles.sectionCard}>
            <p>Teacher module "{subPage}" template placeholder.</p>
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
              <h2>Respected Teacher, {profile.name}</h2>
              <p>Employee ID: {teacher?.employeeId || 'EMP-TCH-01'} | Department: Mathematics & Sciences</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Assigned Subjects</span>
                <span className={styles.statValue}>1</span>
                <span className={styles.statDesc}>Mathematics (MTH-111)</span>
              </div>
              <div className={`${styles.statIcon} ${styles.primaryIcon}`}>
                <BookOpen size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Assigned Classrooms</span>
                <span className={styles.statValue}>1</span>
                <span className={styles.statDesc}>Grade 11 Science-A (In Charge)</span>
              </div>
              <div className={`${styles.statIcon} ${styles.successIcon}`}>
                <Briefcase size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Current Net Salary</span>
                <span className={styles.statValue}>NPR {teacher?.salary ? teacher.salary.toLocaleString() : '55,000'}</span>
                <span className={styles.statDesc}>Status: Paid (Asar 2083)</span>
              </div>
              <div className={`${styles.statIcon} ${styles.warningIcon}`}>
                <DollarSign size={22} />
              </div>
            </div>
          </div>

          <div className={styles.mainGrid}>
            {/* Left Side Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderAttendanceCard()}
              {renderMarksCard()}
            </div>

            {/* Right Side Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderNoticesCard()}
              {renderSalaryCard()}
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
