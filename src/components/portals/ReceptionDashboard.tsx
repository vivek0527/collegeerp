'use client';

import React, { useEffect, useState } from 'react';
import styles from './DashboardComponents.module.css';
import {
  UserPlus, Users, UserCheck, PhoneCall,
  CheckCircle, XCircle, Clock, Eye, Loader,
  RefreshCw, LayoutDashboard, Copy, Search, ShieldCheck, Activity
} from 'lucide-react';
import AcademicCalendarManager from './AcademicCalendarManager';

const CLASSES = [
  'Grade 11 Science-A', 'Grade 11 Science-B',
  'Grade 11 Commerce-A', 'Grade 11 Commerce-B',
  'Grade 11 Arts', 'Grade 12 Science-A', 'Grade 12 Science-B',
  'Grade 12 Commerce-A', 'Grade 12 Commerce-B', 'Grade 12 Arts',
];

type Tab = 'register' | 'students' | 'attendance' | 'absent' | 'calendar';

export default function ReceptionDashboard({ subPage }: { subPage?: string }) {
  const activeTab: Tab =
    subPage === 'students' ? 'students'
    : subPage === 'attendance' ? 'attendance'
    : subPage === 'absent' ? 'absent'
    : subPage === 'calendar' ? 'calendar'
    : 'register';

  const [profile, setProfile] = useState<any>(null);

  // Students list
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Attendance
  const [attendance, setAttendance] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Absent
  const [absentList, setAbsentList] = useState<any[]>([]);
  const [absentLoading, setAbsentLoading] = useState(false);
  const [absentSearchQuery, setAbsentSearchQuery] = useState('');

  // Registration form
  const [regMsg, setRegMsg] = useState({ text: '', type: '' });
  const [regLoading, setRegLoading] = useState(false);
  // Student fields
  const [sName, setSName] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [sRoll, setSRoll] = useState('');
  const [sAdmNo, setSAdmNo] = useState('');
  const [sClass, setSClass] = useState(CLASSES[0]);
  const [sDob, setSdob] = useState('');
  // Parent fields
  const [pName, setPName] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pPassword, setPPassword] = useState('');
  const [pOccupation, setPOccupation] = useState('');
  
  // Financial (Scholarship)
  const [schemes, setSchemes] = useState<any[]>([]);
  const [sSchemeId, setSSchemeId] = useState('');
  const [sScholarshipRemarks, setSScholarshipRemarks] = useState('');

  // Portal status & new fields
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(true);
  const [activeAy, setActiveAy] = useState('2083-2084 BS');
  const [departments, setDepartments] = useState<any[]>([]);
  const [sessionDepts, setSessionDepts] = useState<any[]>([]);
  const [sDept, setSDept] = useState('Computer Science & IT (BSc CSIT)');
  const [sShift, setSShift] = useState('Day');
  const [sSeeGpa, setSSeeGpa] = useState('');
  const [sEntranceMark, setSEntranceMark] = useState('');

  // Attendance filter
  const [attFilter, setAttFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setProfile(d.user));
    
    // Fetch Academic Sessions & Department Admission switches
    fetch('/api/academic-sessions')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.sessions) {
          const active = d.sessions.find((s: any) => s.isActive) || d.sessions[0];
          if (active) {
            setIsAdmissionOpen(active.isAdmissionOpen !== false);
            if (active.sessionName) setActiveAy(active.sessionName);
            if (active.departments && active.departments.length > 0) {
              setSessionDepts(active.departments);
              const openDept = active.departments.find((dep: any) => dep.isAdmissionOpen) || active.departments[0];
              if (openDept) setSDept(openDept.name);
            }
          }
        }
      });

    // Fetch Dynamic Departments
    fetch('/api/departments')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.departments && d.departments.length > 0) {
          setDepartments(d.departments);
          setSDept(d.departments[0].name);
        }
      });

    // Fetch Scholarship Schemes
    fetch('/api/scholarship-schemes').then(r => r.ok ? r.json() : null).then(d => d && setSchemes(d.schemes || []));

    loadAttendance();
    loadAbsent();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') loadStudents();
    if (activeTab === 'attendance') loadAttendance();
    if (activeTab === 'absent') loadAbsent();
  }, [activeTab]);

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await fetch('/api/reception/register');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (e) { console.error(e); }
    setStudentsLoading(false);
  };

  const loadAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const res = await fetch('/api/reception/attendance');
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.attendance || []);
        setAttendanceSummary(data.summary || null);
      }
    } catch (e) { console.error(e); }
    setAttendanceLoading(false);
  };

  const loadAbsent = async () => {
    setAbsentLoading(true);
    try {
      const res = await fetch('/api/reception/attendance?absent=true');
      if (res.ok) {
        const data = await res.json();
        setAbsentList(data.attendance || []);
      }
    } catch (e) { console.error(e); }
    setAbsentLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sEmail === pEmail) {
      setRegMsg({ text: 'Student and parent must have different email addresses.', type: 'error' });
      return;
    }
    setRegLoading(true);
    setRegMsg({ text: 'Registering...', type: 'info' });
    try {
      const res = await fetch('/api/reception/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: sName, studentEmail: sEmail, studentPhone: sPhone,
          studentPassword: sPassword, admissionNumber: sAdmNo,
          dateOfBirthBS: sDob,
          department: sDept, shift: sShift, seeGpa: sSeeGpa, entranceMark: sEntranceMark,
          academicYear: activeAy,
          parentName: pName, parentEmail: pEmail, parentPhone: pPhone,
          parentPassword: pPassword, parentOccupation: pOccupation,
          scholarshipSchemeId: sSchemeId, scholarshipRemarks: sScholarshipRemarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegMsg({ text: `✅ Registration successful! Student: ${sEmail} | Parent: ${pEmail}`, type: 'success' });
        // Reset form
        setSName(''); setSEmail(''); setSPhone(''); setSPassword('');
        setSAdmNo(''); setSdob(''); setSSeeGpa(''); setSEntranceMark('');
        setPName(''); setPEmail(''); setPPhone(''); setPPassword(''); setPOccupation('');
        setSSchemeId(''); setSScholarshipRemarks('');
        loadStudents();
      } else {
        setRegMsg({ text: data.error || 'Registration failed.', type: 'error' });
      }
    } catch {
      setRegMsg({ text: 'Network error. Please try again.', type: 'error' });
    }
    setRegLoading(false);
  };

  // Strong Password Generator Helper
  const generateStrongPassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()_+-=';
    const all = uppercase + lowercase + numbers + symbols;

    let pwd = '';
    pwd += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    pwd += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));

    for (let i = 4; i < 12; i++) {
      pwd += all.charAt(Math.floor(Math.random() * all.length));
    }

    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const [showSPwd, setShowSPwd] = useState(false);
  const [showPPwd, setShowPPwd] = useState(false);

  const statusColor = (s: string) =>
    s === 'PRESENT' ? '#16A34A'
    : s === 'ABSENT' ? '#DC2626'
    : s === 'LATE' ? '#D97706'
    : '#64748B';

  const statusBg = (s: string) =>
    s === 'PRESENT' ? '#F0FDF4'
    : s === 'ABSENT' ? '#FEF2F2'
    : s === 'LATE' ? '#FFFBEB'
    : '#F8FAFC';

  const StatusIcon = ({ s }: { s: string }) =>
    s === 'PRESENT' ? <CheckCircle size={14} color="#16A34A" />
    : s === 'ABSENT' ? <XCircle size={14} color="#DC2626" />
    : s === 'LATE' ? <Clock size={14} color="#D97706" />
    : <Eye size={14} color="#64748B" />;

  const filteredAttendance = attFilter === 'ALL' ? attendance
    : attendance.filter(a => a.status === attFilter);

  const inputStyle: React.CSSProperties = {
    padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #E2E8F0', outline: 'none',
    fontSize: '0.85rem', width: '100%', boxSizing: 'border-box'
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block'
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'register', label: 'Register Student', icon: <UserPlus size={16} /> },
    { id: 'students', label: 'All Students', icon: <Users size={16} /> },
    { id: 'attendance', label: 'Attendance Monitor', icon: <UserCheck size={16} /> },
    { id: 'absent', label: 'Absent Today', icon: <PhoneCall size={16} /> },
  ];

  const studentQuery = studentSearchQuery.toLowerCase().trim();
  const filteredStudents = students.filter(s => {
    if (!studentQuery) return true;
    const sName = (s.user?.name || s.studentName || '').toLowerCase();
    const roll = (s.rollNumber || '').toLowerCase();
    const adm = (s.admissionNumber || '').toLowerCase();
    const cls = `${s.class?.name || ''} ${s.class?.section || ''}`.toLowerCase();
    const sEmail = (s.user?.email || s.studentEmail || '').toLowerCase();
    const pName = (s.parent?.user?.name || s.parentName || '').toLowerCase();
    const pPhone = (s.parent?.phone || s.parentPhone || '').toLowerCase();
    const pEmail = (s.parent?.user?.email || s.parentEmail || '').toLowerCase();
    return sName.includes(studentQuery) || roll.includes(studentQuery) || adm.includes(studentQuery) ||
           cls.includes(studentQuery) || sEmail.includes(studentQuery) || pName.includes(studentQuery) ||
           pPhone.includes(studentQuery) || pEmail.includes(studentQuery);
  });

  const absentQuery = absentSearchQuery.toLowerCase().trim();
  const filteredAbsent = absentList.filter(a => {
    if (!absentQuery) return true;
    return (a.studentName || '').toLowerCase().includes(absentQuery) ||
           (a.rollNumber || '').toLowerCase().includes(absentQuery) ||
           (a.parentName || '').toLowerCase().includes(absentQuery) ||
           (a.parentPhone || '').toLowerCase().includes(absentQuery);
  });
  const groupedAbsent = filteredAbsent.reduce((acc, curr) => {
    const cName = curr.className || 'Unknown Class';
    if (!acc[cName]) acc[cName] = [];
    acc[cName].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div className={styles.headerInfo}>
          <h2 className={styles.portalTitle}>
            <LayoutDashboard size={22} />
            Reception Portal
          </h2>
          <p className={styles.portalSubtitle}>
            {profile?.name || 'Receptionist'} — Student Admission &amp; Monitoring Desk
          </p>
        </div>
      </div>


      {/* ─── Tab: Register Student ─── */}
      {activeTab === 'register' && (
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <UserPlus size={18} className="text-primary" />
              <span>New Student Admission Registration</span>
            </h3>
          </div>

          {!isAdmissionOpen ? (
            <div style={{
              padding: '24px', borderRadius: '12px', background: '#FEF2F2', border: '2px solid #FCA5A5',
              color: '#991B1B', fontWeight: 800, fontSize: '1.05rem', margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center'
            }}>
              <XCircle size={48} color="#DC2626" />
              <span>THE ADMISSION PORTAL IS CURRENTLY LOCKED</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#DC2626', maxWidth: '600px' }}>
                Executive Management (Principal/VP/Chairman) has turned OFF the admissions for the active session ({activeAy}). New student registrations cannot be processed at this time.
              </span>
            </div>
          ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
            {regMsg.text && (
              <div style={{
                padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                background: regMsg.type === 'success' ? '#F0FDF4' : regMsg.type === 'error' ? '#FEF2F2' : '#EFF6FF',
                color: regMsg.type === 'success' ? '#16A34A' : regMsg.type === 'error' ? '#DC2626' : '#2563EB',
                border: `1px solid ${regMsg.type === 'success' ? '#DCFCE7' : regMsg.type === 'error' ? '#FEE2E2' : '#BFDBFE'}`
              }}>
                {regMsg.text}
              </div>
            )}

            {/* Student Section */}
            <div style={{
              padding: '16px', borderRadius: '10px',
              border: '2px solid #E0E7FF', background: '#F5F3FF'
            }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4338CA', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎓 Student Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input style={inputStyle} value={sName} onChange={e => setSName(e.target.value)} placeholder="Niranjan Thapa" required />
                </div>
                <div>
                  <label style={labelStyle}>Student Email *</label>
                  <input type="email" style={inputStyle} value={sEmail} onChange={e => setSEmail(e.target.value)} placeholder="student@example.com" required />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input style={inputStyle} value={sPhone} onChange={e => setSPhone(e.target.value)} placeholder="+977-9801234567" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Password * <span style={{ fontWeight: 400, color: '#94A3B8' }}>(student)</span></label>
                    <button
                      type="button"
                      onClick={() => setSPassword(generateStrongPassword())}
                      style={{ background: 'none', border: 'none', color: '#4338CA', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      ⚡ Auto-Generate
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSPwd ? 'text' : 'password'}
                      style={{ ...inputStyle, paddingRight: '36px' }}
                      value={sPassword}
                      onChange={e => setSPassword(e.target.value)}
                      placeholder="min. 8 characters"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSPwd(!showSPwd)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Admission Number *</label>
                  <input style={inputStyle} value={sAdmNo} onChange={e => setSAdmNo(e.target.value)} placeholder="ADM-2083-001" required />
                </div>
                <div>
                  <label style={labelStyle}>Offered Department / Program *</label>
                  <select style={inputStyle} value={sDept} onChange={e => setSDept(e.target.value)}>
                    {sessionDepts.length > 0 ? (
                      sessionDepts.map((d: any) => (
                        <option key={d.id} value={d.name} disabled={!d.isAdmissionOpen}>
                          {d.name} ({d.duration || '4 Years'}) {d.isAdmissionOpen ? '— ADMISSION OPEN' : '— PORTAL CLOSED (OFF)'}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Computer Science & IT (BSc CSIT)">Computer Science &amp; IT (BSc CSIT) — ADMISSION OPEN</option>
                        <option value="Business Administration (BBA)">Business Administration (BBA) — ADMISSION OPEN</option>
                        <option value="Computer Applications (BCA)" disabled>Computer Applications (BCA) — PORTAL CLOSED (OFF)</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Shift *</label>
                  <select style={inputStyle} value={sShift} onChange={e => setSShift(e.target.value)}>
                    <option value="Day">Day Shift</option>
                    <option value="Morning">Morning Shift</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>SEE GPA (10th) *</label>
                  <input style={inputStyle} type="number" step="0.01" min="0" max="4.0" value={sSeeGpa} onChange={e => setSSeeGpa(e.target.value)} placeholder="e.g. 3.85" required />
                </div>
                <div>
                  <label style={labelStyle}>Entrance Mark *</label>
                  <input style={inputStyle} type="number" min="0" max="100" value={sEntranceMark} onChange={e => setSEntranceMark(e.target.value)} placeholder="e.g. 85" required />
                </div>
                <div>
                  <label style={labelStyle}>Date of Birth (BS)</label>
                  <input style={inputStyle} value={sDob} onChange={e => setSdob(e.target.value)} placeholder="2066-05-12" />
                </div>
              </div>
            </div>

            {/* Parent Section */}
            <div style={{
              padding: '16px', borderRadius: '10px',
              border: '2px solid #DCFCE7', background: '#F0FDF4'
            }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#15803D', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                👨‍👩‍👧 Parent / Guardian Information
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4ADE80', background: '#14532D', padding: '2px 8px', borderRadius: '20px', marginLeft: '4px' }}>
                  Separate Login
                </span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Parent Name *</label>
                  <input style={inputStyle} value={pName} onChange={e => setPName(e.target.value)} placeholder="Ram Bahadur Thapa" required />
                </div>
                <div>
                  <label style={labelStyle}>Parent Email * <span style={{ fontWeight: 400, color: '#94A3B8' }}>(different from student)</span></label>
                  <input type="email" style={inputStyle} value={pEmail} onChange={e => setPEmail(e.target.value)} placeholder="parent@example.com" required />
                </div>
                <div>
                  <label style={labelStyle}>Parent Phone *</label>
                  <input style={inputStyle} value={pPhone} onChange={e => setPPhone(e.target.value)} placeholder="+977-9841234567" required />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Password * <span style={{ fontWeight: 400, color: '#94A3B8' }}>(parent)</span></label>
                    <button
                      type="button"
                      onClick={() => setPPassword(generateStrongPassword())}
                      style={{ background: 'none', border: 'none', color: '#15803D', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      ⚡ Auto-Generate
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPPwd ? 'text' : 'password'}
                      style={{ ...inputStyle, paddingRight: '36px' }}
                      value={pPassword}
                      onChange={e => setPPassword(e.target.value)}
                      placeholder="min. 8 characters"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPPwd(!showPPwd)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Occupation</label>
                  <input style={inputStyle} value={pOccupation} onChange={e => setPOccupation(e.target.value)} placeholder="Government Officer" />
                </div>
              </div>
            </div>

            {/* Initial Financial / Scholarship Section */}
            <div style={{
              padding: '16px', borderRadius: '10px',
              border: '2px solid #E0E7FF', background: '#EEF2FF',
              marginTop: '20px', marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#3730A3', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎓 Initial Financial Grants & Scholarships
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6366F1', background: '#E0E7FF', padding: '2px 8px', borderRadius: '20px', marginLeft: '4px' }}>
                  Auto-Audited
                </span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Select Authorized Scheme</label>
                  <select style={inputStyle} value={sSchemeId} onChange={e => setSSchemeId(e.target.value)}>
                    <option value="">No Scholarship (Full Fee)</option>
                    {schemes.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.discountType === 'PERCENTAGE' ? `${s.discountValue}% Off` : `NPR ${s.discountValue}`})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Scholarship Remarks / Justification</label>
                  <input style={inputStyle} value={sScholarshipRemarks} onChange={e => setSScholarshipRemarks(e.target.value)} placeholder="e.g. Approved by Principal via letter..." />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="btn-primary"
              style={{ alignSelf: 'flex-start', padding: '12px 28px', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {regLoading ? <Loader size={16} className="spin" /> : <UserPlus size={16} />}
              {regLoading ? 'Registering...' : 'Complete Admission Registration'}
            </button>
          </form>
          )}
        </div>
      )}

      {/* ─── Tab: All Students ─── */}
      {activeTab === 'students' && (
        <div className={styles.sectionCard}>
            <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 className={styles.cardTitle}>
                <Users size={18} className="text-primary" />
                <span>All Registered Students</span>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#EEF2FF', color: '#4338CA', fontWeight: 700, marginLeft: '6px' }}>
                  {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
                </span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Search Input */}
                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={e => setStudentSearchQuery(e.target.value)}
                    placeholder="Search by name, roll, class, parent..."
                    style={{
                      padding: '7px 12px 7px 36px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      fontSize: '0.82rem',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                  {studentSearchQuery && (
                    <button
                      onClick={() => setStudentSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button onClick={loadStudents} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            </div>
            {studentsLoading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>Loading students...</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Roll No</th>
                      <th>Admission No</th>
                      <th>Class</th>
                      <th>Student Email</th>
                      <th>Parent Name</th>
                      <th>Parent Phone</th>
                      <th>Parent Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? filteredStudents.map((s, i) => (
                      <tr key={s.id || i}>
                        <td><strong>{s.user?.name || s.studentName}</strong></td>
                        <td>{s.rollNumber}</td>
                        <td style={{ fontSize: '0.8rem', color: '#6366F1', fontWeight: 600 }}>{s.admissionNumber}</td>
                        <td>{s.class?.name} {s.class?.section}</td>
                        <td style={{ fontSize: '0.8rem' }}>{s.user?.email}</td>
                        <td>{s.parent?.user?.name || s.parentName || '—'}</td>
                        <td style={{ fontWeight: 600, color: '#16A34A' }}>
                          {s.parent?.phone || s.parentPhone || '—'}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{s.parent?.user?.email || s.parentEmail || '—'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', color: '#9CA3AF', padding: '28px' }}>
                          {studentSearchQuery ? `No students matching "${studentSearchQuery}"` : 'No students registered yet. Use the Register tab to add students.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      )}

      {/* ─── Tab: Attendance Monitor ─── */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Cards */}
          {attendanceSummary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Total', value: attendanceSummary.total, color: '#6366F1', bg: '#EEF2FF' },
                { label: 'Present', value: attendanceSummary.present, color: '#16A34A', bg: '#F0FDF4' },
                { label: 'Absent', value: attendanceSummary.absent, color: '#DC2626', bg: '#FEF2F2' },
                { label: 'Late', value: attendanceSummary.late, color: '#D97706', bg: '#FFFBEB' },
                { label: 'Excused', value: attendanceSummary.excused, color: '#64748B', bg: '#F8FAFC' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '14px 16px', borderRadius: '10px',
                  background: item.bg, textAlign: 'center',
                  border: `1px solid ${item.color}22`
                }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.sectionCard}>
            <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 className={styles.cardTitle}>
                <UserCheck size={18} className="text-primary" />
                <span>Today's Attendance</span>
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={attFilter}
                  onChange={e => setAttFilter(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PRESENT">✅ Present</option>
                  <option value="ABSENT">❌ Absent</option>
                  <option value="LATE">⏰ Late</option>
                  <option value="EXCUSED">📋 Excused</option>
                </select>
                <button onClick={loadAttendance} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            </div>
            {attendanceLoading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>Loading attendance...</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Roll No</th>
                      <th>Class</th>
                      <th>Status</th>
                      <th>Parent Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.length > 0 ? filteredAttendance.map((a, i) => (
                      <tr key={i}>
                        <td><strong>{a.studentName}</strong></td>
                        <td>{a.rollNumber}</td>
                        <td style={{ fontSize: '0.8rem' }}>{a.className}</td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '0.75rem', fontWeight: 700,
                            color: statusColor(a.status), background: statusBg(a.status)
                          }}>
                            <StatusIcon s={a.status} /> {a.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                          {a.parentName} — <strong style={{ color: '#16A34A' }}>{a.parentPhone}</strong>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#9CA3AF', padding: '28px' }}>
                          No attendance records found for the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tab: Absent Today ─── */}
      {activeTab === 'absent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '14px 18px', borderRadius: '10px',
            background: '#FEF2F2', border: '1px solid #FECACA',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
          }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#DC2626' }}>
                ❌ {absentList.length} Students Absent Today
              </div>
              <div style={{ fontSize: '0.78rem', color: '#B91C1C', marginTop: '2px' }}>
                Contact parents immediately to notify absence
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Search Input */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#F87171' }} />
                <input
                  type="text"
                  value={absentSearchQuery}
                  onChange={e => setAbsentSearchQuery(e.target.value)}
                  placeholder="Search absent students..."
                  style={{
                    padding: '7px 12px 7px 36px',
                    borderRadius: '8px',
                    border: '1px solid #FCA5A5',
                    outline: 'none',
                    fontSize: '0.82rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button onClick={loadAbsent} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #FCA5A5', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {absentLoading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>Loading absent list...</div>
          ) : absentList.length === 0 ? (
            <div className={styles.sectionCard} style={{ textAlign: 'center', padding: '40px', color: '#16A34A' }}>
              <CheckCircle size={40} style={{ marginBottom: '12px', opacity: 0.6 }} />
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>All students are present today! 🎉</div>
            </div>
          ) : Object.keys(groupedAbsent).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>No matching students found for "{absentSearchQuery}"</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(Object.entries(groupedAbsent) as [string, any[]][]).map(([className, students]) => (
                <div key={className} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="#6366F1" />
                    {className}
                    <span style={{ background: '#EEF2FF', color: '#4338CA', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {students.length} Absent
                    </span>
                  </h4>
                  
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Roll No</th>
                          <th>Status</th>
                          <th>Parent Name</th>
                          <th>Parent Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((a, i) => (
                          <tr key={i}>
                            <td><strong>{a.studentName}</strong></td>
                            <td>{a.rollNumber}</td>
                            <td>
                              <span style={{
                                padding: '3px 10px', borderRadius: '20px',
                                background: '#FEF2F2', color: '#DC2626',
                                fontSize: '0.72rem', fontWeight: 800
                              }}>ABSENT</span>
                            </td>
                            <td>{a.parentName}</td>
                            <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <a
                                href={`tel:${a.parentPhone}`}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  padding: '4px 10px', borderRadius: '6px',
                                  background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0',
                                  textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700
                                }}
                              >
                                <PhoneCall size={12} /> {a.parentPhone}
                              </a>
                              <button
                                onClick={() => navigator.clipboard.writeText(a.parentPhone)}
                                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#64748B', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Copy number"
                              >
                                <Copy size={12} /> Copy
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && <AcademicCalendarManager userRole="Reception" />}
    </div>
  );
}
