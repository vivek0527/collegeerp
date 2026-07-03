'use client';

import React, { useEffect, useState } from 'react';
import styles from './DashboardComponents.module.css';
import { useDate } from '../DateContext';
import {
  Users,
  Settings,
  Activity,
  CheckCircle,
  ShieldAlert,
  Save,
  Server,
  Bell,
} from 'lucide-react';

export default function AdminDashboard({ subPage }: { subPage?: string }) {
  const { formatDate } = useDate();
  
  // Data State
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // System Configurations
  const [datePreference, setDatePreference] = useState('BS');
  const [timezone, setTimezone] = useState('Asia/Kathmandu');
  const [settingsMsg, setSettingsMsg] = useState({ text: '', type: '' });
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Mock Users Registry
  const [users, setUsers] = useState<any[]>([
    { name: 'Admin Administrator', email: 'admin@kmc.edu.np', role: 'ADMIN', status: 'ACTIVE' },
    { name: 'Prof. Ramesh Bhattarai', email: 'principal@kmc.edu.np', role: 'PRINCIPAL', status: 'ACTIVE' },
    { name: 'Mr. Santosh Dahal', email: 'teacher@kmc.edu.np', role: 'TEACHER', status: 'ACTIVE' },
    { name: 'Niranjan Thapa', email: 'student@kmc.edu.np', role: 'STUDENT', status: 'ACTIVE' },
    { name: 'Miss Laxmi Thapa', email: 'accofficer@kmc.edu.np', role: 'ACCOUNTS_OFFICER', status: 'ACTIVE' },
    { name: 'Dr. Hari Prasad Sharma', email: 'chairperson@kmc.edu.np', role: 'CHAIRPERSON', status: 'ACTIVE' },
    { name: 'Mrs. Geeta Adhikari', email: 'vp@kmc.edu.np', role: 'VICE_PRINCIPAL', status: 'ACTIVE' },
  ]);

  // Mock Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { action: 'LOGIN', details: 'User logged in successfully via API.', ip: '127.0.0.1', date: '2026-07-01 22:50:06' },
    { action: 'UPDATE_SETTINGS', details: 'Updated date format to: BS, timezone to: Asia/Kathmandu', ip: '127.0.0.1', date: '2026-07-01 21:10:00' },
    { action: 'COLLECT_FEE', details: 'Collected NPR 5000 for bill "Tuition Fee - Shrawan 2083", Receipt: REC-2083-0001', ip: '127.0.0.1', date: '2026-07-01 17:42:00' },
  ]);

  const loadAdminConfig = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setProfile(meData.user);
      }

      const configRes = await fetch('/api/college/settings');
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.college) {
          setDatePreference(configData.college.datePreference);
          setTimezone(configData.college.timezone);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminConfig();
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg({ text: 'Saving global configs...', type: 'info' });

    try {
      const res = await fetch('/api/college/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datePreference, timezone }),
      });

      if (res.ok) {
        setSettingsMsg({ text: 'Global college settings saved successfully!', type: 'success' });
        window.location.reload();
      } else {
        setSettingsMsg({ text: 'Failed to update system configs.', type: 'error' });
      }
    } catch (err) {
      setSettingsMsg({ text: 'Network failure communicating with engine.', type: 'error' });
    }
  };

  if (loading || !profile) {
    return (
      <div className={styles.container}>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  // Filter users based on query and selection
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === '' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const renderUsersCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Users size={18} className="text-primary" />
          <span>Operational Campus Accounts Registry</span>
        </h3>
      </div>

      {/* Styled Enterprise Filter Toolbar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search accounts by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            fontSize: '0.85rem',
            flex: 1,
            minWidth: '200px',
            outline: 'none',
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '8px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: '#4b5563',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">-- All Portal Roles --</option>
          <option value="ADMIN">Admin</option>
          <option value="PRINCIPAL">Principal</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
          <option value="ACCOUNTS_OFFICER">Accounts Officer</option>
          <option value="CHAIRPERSON">Chairperson</option>
          <option value="VICE_PRINCIPAL">Vice Principal</option>
        </select>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Portal Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.email}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-primary">{u.role.replace('_', ' ')}</span></td>
                  <td><span className="badge badge-success">{u.status}</span></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                  No matching campus accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAuditLogsCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Activity size={18} className="text-danger" />
          <span>Security System Action Audits</span>
        </h3>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Security Details</th>
              <th>Source IP</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, idx) => (
              <tr key={idx}>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.date}</td>
                <td><span className="badge badge-warning">{log.action}</span></td>
                <td>{log.details}</td>
                <td><code>{log.ip}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettingsCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Settings size={18} className="text-primary" />
          <span>College Profile & System Config</span>
        </h3>
      </div>

      <form onSubmit={saveSettings} className={styles.form}>
        {settingsMsg.text && (
          <div className={`${styles.feedbackMessage} ${settingsMsg.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
            {settingsMsg.text}
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="cfg-calendar">Primary Calendar Format</label>
          <select
            id="cfg-calendar"
            value={datePreference}
            onChange={(e) => setDatePreference(e.target.value)}
          >
            <option value="BS">BS Format (Nepal Bikram Sambat - e.g. 2083-03-17)</option>
            <option value="AD">AD Format (Gregorian Calendar - e.g. 2026-07-01)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="cfg-tz">Campus Timezone</label>
          <select
            id="cfg-tz"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            <option value="Asia/Kathmandu">Asia/Kathmandu (Nepal Standard - UTC+5:45)</option>
            <option value="UTC">UTC (Universal Coordinated Time)</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
          <Save size={16} />
          <span>Save Configs</span>
        </button>
      </form>
    </div>
  );

  const renderNoticesCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Bell size={18} className="text-warning" />
          <span>General Announcements</span>
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
        <p>You can manage and issue notices directly as system administrator or via the principal dashboard broadcaster.</p>
        <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
          <strong>System Announcement: Maintenance</strong>
          <p style={{ margin: '6px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Database backups completed on 2026-07-01.</p>
        </div>
      </div>
    </div>
  );

  const renderSubPageContent = () => {
    switch (subPage?.toLowerCase()) {
      case 'users':
        return renderUsersCard();
      case 'settings':
        return renderSettingsCard();
      case 'audit':
        return renderAuditLogsCard();
      case 'notices':
        return renderNoticesCard();
      default:
        return (
          <div className={styles.sectionCard}>
            <p>Admin module "{subPage}" template placeholder.</p>
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
              <h2>Campus Platform Engine Settings</h2>
              <p>Logged in as: <strong>{profile.name}</strong> ({profile.role})</p>
            </div>
          </div>

          {/* KPI Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total User Registries</span>
                <span className={styles.statValue}>12</span>
                <span className={styles.statDesc}>Across all 12 operational roles</span>
              </div>
              <div className={`${styles.statIcon} ${styles.primaryIcon}`}>
                <Users size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Security Log Audits</span>
                <span className={styles.statValue}>142</span>
                <span className={styles.statDesc}>System actions logged safely</span>
              </div>
              <div className={`${styles.statIcon} ${styles.dangerIcon}`}>
                <ShieldAlert size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>DB Server Status</span>
                <span className={styles.statValue}>MOCK RUN</span>
                <span className={styles.statDesc}>Autofallback database layer</span>
              </div>
              <div className={`${styles.statIcon} ${styles.successIcon}`}>
                <Server size={22} />
              </div>
            </div>
          </div>

          <div className={styles.mainGrid}>
            {/* Left Side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderUsersCard()}
              {renderAuditLogsCard()}
            </div>

            {/* Right Side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderSettingsCard()}
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
