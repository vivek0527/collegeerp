'use client';

import React, { useEffect, useState } from 'react';
import styles from './DashboardComponents.module.css';
import { useDate } from '../DateContext';
import {
  Users,
  UserCheck,
  CreditCard,
  AlertCircle,
  Bell,
  Send,
  MessageSquare,
  Check,
  Upload,
  Trash2,
  FileText,
} from 'lucide-react';
import AcademicCalendarManager from './AcademicCalendarManager';
import AcademicYearAdmissionControl from './AcademicYearAdmissionControl';

export default function PrincipalDashboard({ subPage }: { subPage?: string }) {
  const { formatDate } = useDate();
  
  // Data state
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);
  
  // Resolution form states
  const [activeResolutionId, setActiveResolutionId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  
  // Notice form states
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [noticeFileName, setNoticeFileName] = useState('');
  const [noticeFileData, setNoticeFileData] = useState<string | null>(null);
  const [publishingNotice, setPublishingNotice] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  
  // Scholarship Scheme states
  const [schemes, setSchemes] = useState<any[]>([]);
  const [schemeName, setSchemeName] = useState('');
  const [schemeType, setSchemeType] = useState('PERCENTAGE');
  const [schemeValue, setSchemeValue] = useState('');
  const [creatingScheme, setCreatingScheme] = useState(false);

  // --- New Core Portal States ---
  const [admissions, setAdmissions] = useState<any[]>([]);
  
  const [staffList, setStaffList] = useState<any[]>([]);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'TEACHER', employeeId: '', baseSalary: '' });
  const [creatingStaff, setCreatingStaff] = useState(false);
  
  const [salaries, setSalaries] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);

  // --- Academic Year & Section Allocation States ---
  const [ayList, setAyList] = useState<any[]>([]);
  const [activeAy, setActiveAy] = useState('2026/2027');
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(true);
  const [newAyInput, setNewAyInput] = useState('');

  // Department Management
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');

  const [allocDept, setAllocDept] = useState('Science');
  const [allocShift, setAllocShift] = useState('Day');
  const [allocCount, setAllocCount] = useState(2);
  const [allocDeptCode, setAllocDeptCode] = useState('S');
  const [allocShiftCode, setAllocShiftCode] = useState('D');
  const [allocating, setAllocating] = useState(false);
  const [allocResults, setAllocResults] = useState<any[]>([]);

  const [unassignedList, setUnassignedList] = useState<any[]>([]);
  const [unassignedSectionInput, setUnassignedSectionInput] = useState<Record<string, string>>({});
  // --------------------------------------------------

  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleNoticeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMsg({ text: 'Attachment file size must be less than 5MB.', type: 'error' });
      return;
    }

    setNoticeFileName(file.name);
    setMsg({ text: '', type: '' });

    const reader = new FileReader();
    reader.onloadend = () => {
      setNoticeFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleNoticeDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    try {
      const res = await fetch(`/api/notices?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotices(prev => prev.filter(n => n.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete notice.');
      }
    } catch {
      alert('Network error. Failed to delete notice.');
    }
  };

  const loadData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setProfile(meData.user);
      }

      const compRes = await fetch('/api/complaints');
      if (compRes.ok) {
        const compData = await compRes.json();
        setComplaints(compData.complaints || []);
      }

      const noticeRes = await fetch('/api/notices');
      if (noticeRes.ok) {
        const noticeData = await noticeRes.json();
        setNotices(noticeData.notices || []);
      }

      const schemeRes = await fetch('/api/scholarship-schemes');
      if (schemeRes.ok) {
        const schemeData = await schemeRes.json();
        setSchemes(schemeData.schemes || []);
      }

      // Load Admissions
      const admRes = await fetch('/api/principal/admissions');
      if (admRes.ok) {
        const admData = await admRes.json();
        setAdmissions(admData.admissions || []);
      }

      // Load Staff
      const staffRes = await fetch('/api/principal/staff');
      if (staffRes.ok) {
        const sData = await staffRes.json();
        setStaffList(sData.staff || []);
      }

      // Load Salaries
      const salRes = await fetch('/api/salaries');
      if (salRes.ok) {
        const salData = await salRes.json();
        setSalaries(salData.slips || []);
      }

      // Load Dynamic Departments
      const deptRes = await fetch('/api/departments');
      if (deptRes.ok) {
        const dData = await deptRes.json();
        setDepartments(dData.departments || []);
        if (dData.departments?.length > 0) {
          setAllocDept(dData.departments[0].name);
          setAllocDeptCode(dData.departments[0].code);
        }
      }

      // Load Unassigned Students
      const unassignedRes = await fetch('/api/principal/sections/unassigned');
      if (unassignedRes.ok) {
        const uData = await unassignedRes.json();
        setUnassignedList(uData.students || []);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveSubmit = async (complaintId: string) => {
    if (!resolutionText) return;
    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: complaintId,
          responseContent: resolutionText,
          status: 'RESOLVED',
        }),
      });

      if (res.ok) {
        setActiveResolutionId(null);
        setResolutionText('');
        // Reload complaints
        const compRes = await fetch('/api/complaints');
        if (compRes.ok) {
          const compData = await compRes.json();
          setComplaints(compData.complaints || []);
        }
      }
    } catch (e) {
      console.error('Resolve failed', e);
    }
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    setPublishingNotice(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          targetAudience,
          fileData: noticeFileData,
          fileName: noticeFileName,
        }),
      });

      if (res.ok) {
        setMsg({ text: 'Notice published successfully to campus network!', type: 'success' });
        setNoticeTitle('');
        setNoticeContent('');
        setNoticeFileName('');
        setNoticeFileData(null);
        // Reload notices list
        const noticeRes = await fetch('/api/notices');
        if (noticeRes.ok) {
          const noticeData = await noticeRes.json();
          setNotices(noticeData.notices || []);
        }
      } else {
        const data = await res.json();
        setMsg({ text: data.error || 'Failed to publish notice. Try again.', type: 'error' });
      }
    } catch (e) {
      setMsg({ text: 'Network connection failed.', type: 'error' });
    } finally {
      setPublishingNotice(false);
    }
  };

  const handleSchemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeName || !schemeValue) return;

    setCreatingScheme(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/scholarship-schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: schemeName,
          discountType: schemeType,
          discountValue: schemeValue
        }),
      });

      if (res.ok) {
        setMsg({ text: 'Scholarship scheme added successfully.', type: 'success' });
        setSchemeName('');
        setSchemeValue('');
        
        const schemeRes = await fetch('/api/scholarship-schemes');
        if (schemeRes.ok) {
          const schemeData = await schemeRes.json();
          setSchemes(schemeData.schemes || []);
        }
      } else {
        const data = await res.json();
        setMsg({ text: data.error || 'Failed to create scheme.', type: 'error' });
      }
    } catch (e) {
      setMsg({ text: 'Network connection failed.', type: 'error' });
    } finally {
      setCreatingScheme(false);
    }
  };

  const handleSchemeDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship scheme?')) return;
    try {
      const res = await fetch(`/api/scholarship-schemes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSchemes(prev => prev.filter(s => s.id !== id));
      } else {
        alert('Failed to delete scheme.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const handleAdmissionApproval = async (registrationId: string, status: string, remarks: string) => {
    try {
      const res = await fetch('/api/principal/admissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, status, remarks })
      });
      if (res.ok) {
        setAdmissions(prev => prev.map(a => a.id === registrationId ? { ...a, status, remarks } : a));
      } else {
        alert('Failed to update admission status.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStaff(true);
    try {
      const res = await fetch('/api/principal/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      if (res.ok) {
        alert('Staff account created successfully!');
        setNewStaff({ name: '', email: '', password: '', role: 'TEACHER', employeeId: '', baseSalary: '' });
        const staffRes = await fetch('/api/principal/staff');
        if (staffRes.ok) {
          const sData = await staffRes.json();
          setStaffList(sData.staff || []);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create staff account.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleToggleAdmissionPortal = async (newStatus: boolean) => {
    try {
      const res = await fetch('/api/principal/academic-year', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmissionOpen: newStatus })
      });
      if (res.ok) {
        setIsAdmissionOpen(newStatus);
        alert(`Admission Portal turned ${newStatus ? 'ON' : 'OFF'}!`);
      } else {
        alert('Failed to update Admission Portal toggle.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const handleCreateAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAyInput) return;
    try {
      const res = await fetch('/api/principal/academic-year', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: newAyInput })
      });
      if (res.ok) {
        alert('New Academic Year created and set to active!');
        setNewAyInput('');
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create Academic Year.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName, code: newDeptCode })
      });
      if (res.ok) {
        alert('Department created successfully!');
        setNewDeptName('');
        setNewDeptCode('');
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create department.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      const res = await fetch(`/api/departments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Department deleted.');
        loadData();
      } else {
        alert('Failed to delete department.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const handleRunAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllocating(true);
    setAllocResults([]);
    try {
      const res = await fetch('/api/principal/sections/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicYear: activeAy,
          department: allocDept,
          shift: allocShift,
          sectionCount: Number(allocCount),
          deptCode: allocDeptCode,
          shiftCode: allocShiftCode
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAllocResults(data.allocatedStudents || []);
        alert(`✅ ${data.message}`);
        loadData();
      } else {
        alert(data.error || 'Section allocation failed.');
      }
    } catch {
      alert('Network error during section allocation.');
    } finally {
      setAllocating(false);
    }
  };

  const handleAssignUnassigned = async (regId: string, section: string, dept?: string, shift?: string) => {
    if (!section) {
      alert('Please enter a section (e.g. Section A)');
      return;
    }
    try {
      const res = await fetch('/api/principal/sections/unassigned', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: regId,
          section,
          department: dept || 'Science',
          shift: shift || 'Day'
        })
      });
      if (res.ok) {
        alert('Assigned section and generated roll number successfully!');
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to assign student.');
      }
    } catch {
      alert('Network error.');
    }
  };

  if (loading || !profile) {
    return (
      <div className={styles.container}>
        <p>Loading principal analytics logs...</p>
      </div>
    );
  }

  // Cards as reusable function components
  const renderComplaintsCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <AlertCircle size={18} className="text-danger" />
          <span>Safety & Student Complaint Audits</span>
        </h3>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Filer Details</th>
              <th>Incident Title</th>
              <th>Full description</th>
              <th>Status</th>
              <th>Actions / Resolution Feedback</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length > 0 ? (
              complaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.isAnonymous ? (
                      <span className="text-muted"><em>Anonymous</em></span>
                    ) : (
                      <span>{c.student?.user?.name || 'Student (Roll: 12)'}</span>
                    )}
                  </td>
                  <td><strong>{c.title}</strong></td>
                  <td>{c.description}</td>
                  <td>
                    <span className={`badge ${c.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === 'OPEN' ? (
                      activeResolutionId === c.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <textarea
                            rows={2}
                            placeholder="Type response details..."
                            value={resolutionText}
                            onChange={(e) => setResolutionText(e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '6px' }}
                          />
                          <button
                            onClick={() => handleResolveSubmit(c.id)}
                            className="btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Check size={12} />
                            <span>Submit Resolution</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveResolutionId(c.id)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          Resolve
                        </button>
                      )
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Resolved: <em>"{c.responseContent}"</em>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No safety incidents currently logged.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNoticeBroadcaster = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Bell size={18} className="text-warning" />
          <span>Notice Broadcaster Hub</span>
        </h3>
      </div>

      <form onSubmit={handleNoticeSubmit} className={styles.form}>
        {msg.text && (
          <div className={`${styles.feedbackMessage} ${msg.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
            {msg.text}
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="not-title">Notice Title</label>
          <input
            id="not-title"
            type="text"
            placeholder="E.g., Final Term Exam Schedules"
            value={noticeTitle}
            onChange={(e) => setNoticeTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="not-audience">Target Portal Audience</label>
          <select
            id="not-audience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: '#fff', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Portals (Students, Parents, Teachers, Management)</option>
            <option value="STUDENTS">Students & Parents Only</option>
            <option value="TEACHERS">Subject Teachers Only</option>
            <option value="MANAGEMENT">Management & Administrative Staff Only</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Select File / Photo Attachment</label>
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
              Choose Attachment
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleNoticeFileChange}
                style={{ display: 'none' }}
              />
            </label>
            <span style={{ fontSize: '0.82rem', color: noticeFileName ? '#0F172A' : '#94A3B8', fontWeight: noticeFileName ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {noticeFileName || 'No attachment file chosen'}
            </span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="not-content">Notice Content Details</label>
          <textarea
            id="not-content"
            rows={4}
            placeholder="Enter announcement text details here..."
            value={noticeContent}
            onChange={(e) => setNoticeContent(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={publishingNotice} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Send size={16} />
          <span>{publishingNotice ? 'Broadcasting...' : 'Broadcast Notice Announcement'}</span>
        </button>
      </form>

      {/* Active Notices List */}
      <div style={{ marginTop: '32px', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} className="text-primary" />
          <span>Active Campus Broadcast Log</span>
        </h4>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Notice Details</th>
                <th>Target Portal</th>
                <th>Attachment</th>
                <th>Author</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {notices.length > 0 ? (
                notices.map((n) => (
                  <tr key={n.id}>
                    <td style={{ maxWidth: '300px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0B1F3A' }}>{n.title}</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4' }}>
                        {n.content}
                      </p>
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{n.targetAudience}</span>
                    </td>
                    <td>
                      {n.attachmentUrl ? (
                        <a href={n.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
                          📎 View File
                        </a>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {n.createdBy?.name || 'Administrator'}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleNoticeDelete(n.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px' }}
                        title="Delete notice"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>
                    No notices currently broadcasted.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAcademicsCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Users size={18} className="text-primary" />
          <span>Academic Records Audit Summary</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Class Section</th>
              <th>Student Strength</th>
              <th>Pass Rate (Terminal)</th>
              <th>Top Performing Subject</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Grade 11 Science-A</strong></td>
              <td>32 Students</td>
              <td>96.8%</td>
              <td>Mathematics (A+)</td>
            </tr>
            <tr>
              <td><strong>Grade 11 Science-B</strong></td>
              <td>30 Students</td>
              <td>90.2%</td>
              <td>Physics (A)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAttendanceAuditCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <UserCheck size={18} className="text-success" />
          <span>Daily Classroom Attendance Logs</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Class</th>
              <th>Present Count</th>
              <th>Absent Count</th>
              <th>Status Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Grade 11 Science-A</strong></td>
              <td>30 Students</td>
              <td>2 Students</td>
              <td><span className="badge badge-success">93.7%</span></td>
            </tr>
            <tr>
              <td><strong>Grade 11 Science-B</strong></td>
              <td>27 Students</td>
              <td>3 Students</td>
              <td><span className="badge badge-warning">90.0%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdmissionsQueue = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <UserCheck size={18} className="text-primary" />
          <span>Student Admissions & Scholarship Queue</span>
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Class / Roll</th>
              <th>Scholarship Request</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {admissions.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No pending admissions.</td></tr>
            ) : (
              admissions.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong><br/><span style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.email}</span></td>
                  <td>{a.className}<br/><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Adm: {a.admissionNumber}</span></td>
                  <td>{a.scholarshipSchemeId ? <span className="badge badge-primary">Requested</span> : <span style={{ color: '#64748b', fontSize: '0.8rem' }}>None</span>}</td>
                  <td><span className={`badge ${a.status === 'APPROVED' ? 'badge-success' : a.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>{a.status}</span></td>
                  <td>
                    {a.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleAdmissionApproval(a.id, 'APPROVED', 'Approved by Principal')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Approve</button>
                        <button onClick={() => handleAdmissionApproval(a.id, 'REJECTED', 'Rejected by Principal')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStaffManagement = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Users size={18} className="text-primary" />
          <span>Staff & Faculty Management</span>
        </h3>
      </div>
      <form onSubmit={handleCreateStaff} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: 1, minWidth: '150px' }}><input type="text" placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
        <div style={{ flex: 1, minWidth: '150px' }}><input type="email" placeholder="Email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
        <div style={{ flex: 1, minWidth: '150px' }}><input type="password" placeholder="Password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} required minLength={6} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
        <div style={{ width: '150px' }}>
          <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}>
            <option value="TEACHER">Teacher</option>
            <option value="RECEPTION">Reception</option>
            <option value="ACCOUNTS_OFFICER">Accounts Officer</option>
            <option value="HR">HR</option>
          </select>
        </div>
        <div style={{ width: '120px' }}><input type="text" placeholder="EMP ID" value={newStaff.employeeId} onChange={e => setNewStaff({...newStaff, employeeId: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
        <div style={{ width: '120px' }}><input type="number" placeholder="Base Salary" value={newStaff.baseSalary} onChange={e => setNewStaff({...newStaff, baseSalary: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
        <button type="submit" disabled={creatingStaff} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{creatingStaff ? 'Creating...' : 'Create Account'}</button>
      </form>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead><tr><th>Employee Details</th><th>Role</th><th>EMP ID</th><th>Status</th><th>Base Salary</th></tr></thead>
          <tbody>
            {staffList.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center' }}>No staff found.</td></tr> : staffList.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong><br/><span style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.email}</span></td>
                <td><span className="badge badge-primary">{s.role}</span></td>
                <td>{s.employeeId}</td>
                <td><span className="badge badge-success">{s.status}</span></td>
                <td>NPR {s.salary.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayrollOverview = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}><h3 className={styles.cardTitle}><CreditCard size={18} className="text-warning" /><span>Payroll & Salary Distribution Overview</span></h3></div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead><tr><th>Staff Name</th><th>Role</th><th>Month/Year</th><th>Total Salary</th><th>Status</th></tr></thead>
          <tbody>
            {salaries.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center' }}>No payroll data found.</td></tr> : salaries.map(s => (
              <tr key={s.id}>
                <td><strong>{s.user?.name}</strong></td>
                <td>{s.user?.role}</td>
                <td>{s.month} {s.year}</td>
                <td>NPR {s.netSalary.toLocaleString()}</td>
                <td><span className={`badge ${s.status === 'PAID' ? 'badge-success' : 'badge-danger'}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCampusAttendance = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}><h3 className={styles.cardTitle}><UserCheck size={18} className="text-success" /><span>Campus Attendance Monitoring</span></h3></div>
      {attendanceSummary ? (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a' }}>{attendanceSummary.presentRate}%</div>
            <div style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>Campus Present Rate Today</div>
          </div>
          <div style={{ flex: 1, padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{attendanceSummary.totalRecords}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Records Processed</div>
          </div>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No attendance data generated for today.</p>
      )}
    </div>
  );

  const renderScholarshipSchemes = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <CreditCard size={18} className="text-primary" />
          <span>Authorized Financial Schemes & Scholarships</span>
        </h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Define scholarship programs and discounts here. Reception staff will only be able to select from these authorized options during student registration.
      </p>

      <form onSubmit={handleSchemeSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Scheme Name</label>
          <input type="text" value={schemeName} onChange={e => setSchemeName(e.target.value)} placeholder="e.g. District Topper" required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
        </div>
        <div style={{ width: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Discount Type</label>
          <select value={schemeType} onChange={e => setSchemeType(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff' }}>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FLAT_AMOUNT">Flat Amount (NPR)</option>
          </select>
        </div>
        <div style={{ width: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Value</label>
          <input type="number" value={schemeValue} onChange={e => setSchemeValue(e.target.value)} placeholder="e.g. 50" required min="0" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
        </div>
        <button type="submit" className="btn-primary" disabled={creatingScheme} style={{ padding: '9px 16px', borderRadius: '6px' }}>
          {creatingScheme ? 'Adding...' : 'Add Scheme'}
        </button>
      </form>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Scheme Name</th>
              <th>Discount Value</th>
              <th>Created By</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>
                  <span className={`badge ${s.discountType === 'PERCENTAGE' ? 'badge-primary' : 'badge-success'}`}>
                    {s.discountType === 'PERCENTAGE' ? `${s.discountValue}% Off` : `NPR ${s.discountValue.toLocaleString()}`}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem' }}>{s.createdBy}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => handleSchemeDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {schemes.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No scholarship schemes defined yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAcademicYearControl = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Upload size={18} className="text-primary" />
          <span>Academic Year Management & Admission Portal Control</span>
        </h3>
      </div>

      {/* Admission Portal Switch */}
      <div style={{
        padding: '20px', borderRadius: '12px', background: isAdmissionOpen ? '#F0FDF4' : '#FEF2F2',
        border: `1.5px solid ${isAdmissionOpen ? '#BBF7D0' : '#FECACA'}`, marginBottom: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: isAdmissionOpen ? '#166534' : '#991B1B', margin: 0 }}>
            Reception Admission Portal: {isAdmissionOpen ? 'OPEN (ACTIVE)' : 'CLOSED (LOCKED)'}
          </h4>
          <p style={{ fontSize: '0.82rem', color: isAdmissionOpen ? '#15803D' : '#B91C1C', marginTop: '4px', margin: 0 }}>
            Active Academic Year: <strong>{activeAy}</strong> — {isAdmissionOpen ? 'Reception staff can register incoming students.' : 'Reception registration forms are disabled.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleToggleAdmissionPortal(!isAdmissionOpen)}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: '0.85rem', color: '#fff',
              background: isAdmissionOpen ? '#DC2626' : '#16A34A', transition: 'all 0.2s'
            }}
          >
            {isAdmissionOpen ? '🔒 Turn OFF Admission Portal' : '🔓 Turn ON Admission Portal'}
          </button>
        </div>
      </div>

      {/* Create Academic Year & Departments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleCreateAcademicYear} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>+ Add Academic Year</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text" value={newAyInput} onChange={e => setNewAyInput(e.target.value)}
              placeholder="e.g. 2027/2028" required
              style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
            />
            <button type="submit" style={{ padding: '8px 14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              Add Year
            </button>
          </div>
        </form>

        <form onSubmit={handleCreateDepartment} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>+ Add Academic Department</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text" value={newDeptName} onChange={e => setNewDeptName(e.target.value)}
              placeholder="Dept Name (e.g. Law)" required
              style={{ flex: 2, minWidth: '130px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
            />
            <input
              type="text" value={newDeptCode} onChange={e => setNewDeptCode(e.target.value.toUpperCase())}
              placeholder="Code (e.g. L)" required
              style={{ flex: 1, minWidth: '60px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
            />
            <button type="submit" style={{ padding: '8px 14px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              Add Dept
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>Academic Sessions</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Status</th>
                  <th>Portal</th>
                </tr>
              </thead>
              <tbody>
                {ayList.map(ay => (
                  <tr key={ay.id}>
                    <td><strong>{ay.year}</strong></td>
                    <td><span className={`badge ${ay.isActive ? 'badge-success' : 'badge-primary'}`}>{ay.isActive ? 'Active' : 'Archived'}</span></td>
                    <td><span className={`badge ${ay.isAdmissionOpen ? 'badge-success' : 'badge-danger'}`}>{ay.isAdmissionOpen ? 'OPEN' : 'CLOSED'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>Authorized Departments</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Code</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong></td>
                    <td><span className="badge badge-primary">{d.code}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteDepartment(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionAllocator = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Users size={18} className="text-primary" />
          <span>Automated Entrance Rank Section & Roll Number Allocator</span>
        </h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
        Specify department and section count. System will sort students by Entrance Marks (descending), balance them into sections, and auto-generate global roll numbers (`26SD0001`, `26MM0002`, etc.).
      </p>

      <form onSubmit={handleRunAllocation} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Department</label>
          <select value={allocDept} onChange={e => {
            setAllocDept(e.target.value);
            const match = departments.find(d => d.name === e.target.value);
            if (match) setAllocDeptCode(match.code);
          }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#fff' }}>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>
        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Shift</label>
          <select value={allocShift} onChange={e => setAllocShift(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#fff' }}>
            <option value="Day">Day</option>
            <option value="Morning">Morning</option>
          </select>
        </div>
        <div style={{ width: '130px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>No. of Sections</label>
          <input type="number" min="1" max="10" value={allocCount} onChange={e => setAllocCount(Number(e.target.value))} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
        </div>
        <div style={{ width: '100px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Dept Code</label>
          <input type="text" value={allocDeptCode} onChange={e => setAllocDeptCode(e.target.value.toUpperCase())} placeholder="S" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
        </div>
        <div style={{ width: '100px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Shift Code</label>
          <input type="text" value={allocShiftCode} onChange={e => setAllocShiftCode(e.target.value.toUpperCase())} placeholder="D" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
        </div>
        <button type="submit" disabled={allocating} style={{ padding: '9px 16px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          {allocating ? 'Calculating & Generating...' : '⚡ Divide & Generate Rolls'}
        </button>
      </form>

      {allocResults.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
            Allocated Results ({allocResults.length} Students) — Ranked by Entrance Marks
          </h4>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Entrance Mark</th>
                  <th>SEE GPA</th>
                  <th>Assigned Section</th>
                  <th>Generated Roll No</th>
                </tr>
              </thead>
              <tbody>
                {allocResults.map(res => (
                  <tr key={res.rollNumber}>
                    <td><strong>#{res.rank}</strong></td>
                    <td>{res.studentName}</td>
                    <td><span className="badge badge-primary">{res.entranceMark} Marks</span></td>
                    <td>{res.seeGpa} GPA</td>
                    <td><span className="badge badge-success">{res.section}</span></td>
                    <td><strong style={{ color: '#2563EB' }}>{res.rollNumber}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderUnassignedQueue = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Users size={18} className="text-warning" />
          <span>Unassigned Students Queue (Late Joiners)</span>
        </h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
        Students who registered after bulk section generation. Principal can manually assign their section and auto-generate the next global roll number.
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student Info</th>
              <th>Department / Shift</th>
              <th>Entrance Mark / GPA</th>
              <th>Assign Section</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {unassignedList.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>No unassigned late-joining students found. All registered students have section & roll numbers.</td></tr>
            ) : (
              unassignedList.map(u => {
                const uid = u.id || u.studentId;
                const secVal = unassignedSectionInput[uid] || 'Section A';
                return (
                  <tr key={uid}>
                    <td><strong>{u.studentName || u.name}</strong><br/><span style={{ fontSize: '0.75rem', color: '#64748B' }}>{u.studentEmail || u.email}</span></td>
                    <td>{u.department || 'Science'} ({u.shift || 'Day'})</td>
                    <td>Entrance: {u.entranceMark || 'N/A'} | GPA: {u.seeGpa || 'N/A'}</td>
                    <td>
                      <input
                        type="text" value={secVal}
                        onChange={e => setUnassignedSectionInput({ ...unassignedSectionInput, [uid]: e.target.value })}
                        placeholder="e.g. Section A"
                        style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleAssignUnassigned(uid, secVal, u.department, u.shift)}
                        style={{ padding: '6px 12px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Assign & Gen Roll
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSubPageContent = () => {
    switch (subPage?.toLowerCase()) {
      case 'academics':
        return renderAcademicsCard();
      case 'attendance':
        return (
          <>
            {renderAttendanceAuditCard()}
            {renderCampusAttendance()}
          </>
        );
      case 'complaints':
        return renderComplaintsCard();
      case 'notices':
        return renderNoticeBroadcaster();
      case 'admissions':
        return renderAdmissionsQueue();
      case 'academic-years':
      case 'admission-control':
        return <AcademicYearAdmissionControl userRole={profile?.role || 'Principal'} />;
      case 'sections':
      case 'roll-allocation':
        return renderSectionAllocator();
      case 'late-joiners':
      case 'unassigned':
        return renderUnassignedQueue();
      case 'staff':
        return renderStaffManagement();
      case 'finance':
        return renderPayrollOverview();
      case 'schemes':
        return renderScholarshipSchemes();
      case 'academic-calendar':
      case 'calendar':
      case 'events':
      case 'emergency-holiday':
        return <AcademicCalendarManager userRole={profile?.role || 'Principal'} />;
      default:
        return (
          <div className={styles.sectionCard}>
            <p>Principal module "{subPage}" template placeholder.</p>
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
              <h2>Campus Command Center</h2>
              <p>Logged in as: <strong>{profile.name}</strong> ({profile.role.replace('_', ' ')})</p>
            </div>
          </div>

          {/* Analytics widgets */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Active Student Body</span>
                <span className={styles.statValue}>362</span>
                <span className={styles.statDesc}>Across 12 class sections</span>
              </div>
              <div className={`${styles.statIcon} ${styles.primaryIcon}`}>
                <Users size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Overall Daily Attendance</span>
                <span className={styles.statValue}>92.4%</span>
                <span className={styles.statDesc}>Average of this month</span>
              </div>
              <div className={`${styles.statIcon} ${styles.successIcon}`}>
                <UserCheck size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Fee Receipts</span>
                <span className={styles.statValue}>NPR 245,000</span>
                <span className={styles.statDesc}>Current fiscal quarter</span>
              </div>
              <div className={`${styles.statIcon} ${styles.warningIcon}`}>
                <CreditCard size={22} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            {renderComplaintsCard()}
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
