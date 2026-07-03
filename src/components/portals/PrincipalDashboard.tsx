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

  const renderSubPageContent = () => {
    switch (subPage?.toLowerCase()) {
      case 'academics':
        return renderAcademicsCard();
      case 'attendance':
        return renderAttendanceAuditCard();
      case 'complaints':
        return renderComplaintsCard();
      case 'notices':
        return renderNoticeBroadcaster();
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

          <div className={styles.mainGrid}>
            {/* Left Side: Complaints Resolution */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderComplaintsCard()}
            </div>

            {/* Right Side: Notice Broadcaster */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderNoticeBroadcaster()}
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
