'use client';

import React, { useEffect, useState } from 'react';
import styles from './DashboardComponents.module.css';
import { useDate } from '../DateContext';
import {
  TrendingUp,
  DollarSign,
  GraduationCap,
  Users,
  Bell,
  FileText,
  Activity,
  Calendar,
} from 'lucide-react';
import AcademicCalendarManager from './AcademicCalendarManager';
import AcademicYearAdmissionControl from './AcademicYearAdmissionControl';

export default function ChairpersonDashboard({ subPage }: { subPage?: string }) {
  const { formatDate } = useDate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setProfile(meData.user);
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
        <p>Loading executive command summaries...</p>
      </div>
    );
  }

  // Cards as reusable function components
  const renderFinanceCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <DollarSign size={18} className="text-success" />
          <span>Quarterly College Budget &amp; Operational Cash Position</span>
        </h3>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Budget Category</th>
              <th>Gross Allocations</th>
              <th>Actual Spent/Receipts</th>
              <th>Net Balance</th>
              <th>Fiscal Performance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Student Tuition Incomes</strong></td>
              <td>NPR 300,000</td>
              <td className="text-success">NPR 245,000</td>
              <td className="text-danger">NPR 55,000 (Dues)</td>
              <td><span className="badge badge-warning">81.6% Achieved</span></td>
            </tr>
            <tr>
              <td><strong>Teacher &amp; Staff Payroll</strong></td>
              <td>NPR 190,000</td>
              <td className="text-danger">NPR 185,000</td>
              <td className="text-success">NPR 5,000</td>
              <td><span className="badge badge-success">On Budget</span></td>
            </tr>
            <tr>
              <td><strong>Laboratory Equipment Upgrades</strong></td>
              <td>NPR 50,000</td>
              <td className="text-danger">NPR 45,000</td>
              <td className="text-success">NPR 5,000</td>
              <td><span className="badge badge-success">Optimized</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStatsCard = () => (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Activity size={18} className="text-primary" />
          <span>Operational Campus Statistics</span>
        </h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
        Real-time multi-tenant database synchronization metrics for board members.
      </p>
    </div>
  );

  const renderSubPageContent = () => {
    switch (subPage?.toLowerCase()) {
      case 'admissions':
      case 'academic-years':
      case 'admission-control':
        return <AcademicYearAdmissionControl userRole={profile.role || 'Chairperson'} />;
      case 'academic-calendar':
      case 'calendar':
      case 'events':
      case 'emergency-holiday':
        return <AcademicCalendarManager userRole={profile.role || 'Chairperson'} />;
      case 'finance':
        return renderFinanceCard();
      case 'academics':
      case 'stats':
        return renderStatsCard();
      default:
        return <AcademicCalendarManager userRole={profile.role || 'Chairperson'} />;
    }
  };

  return (
    <div className={styles.container + " fade-in"}>
      {!subPage ? (
        <>
          {/* Welcome Banner */}
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeText}>
              <h2>Executive Chairperson Board Room</h2>
              <p>Logged in as: <strong>{profile.name}</strong> ({profile.role})</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Platform User Footprint</span>
                <span className={styles.statValue}>362</span>
                <span className={styles.statDesc}>98.2% login engagement rate</span>
              </div>
              <div className={`${styles.statIcon} ${styles.primaryIcon}`}>
                <Users size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Fiscal Cash Position</span>
                <span className={styles.statValue}>NPR 245,000</span>
                <span className={styles.statDesc}>Tuition receipts this quarter</span>
              </div>
              <div className={`${styles.statIcon} ${styles.successIcon}`}>
                <DollarSign size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Academic Pass Ratio</span>
                <span className={styles.statValue}>94.5%</span>
                <span className={styles.statDesc}>Based on First Term Examinations</span>
              </div>
              <div className={`${styles.statIcon} ${styles.warningIcon}`}>
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          <div className={styles.mainGrid}>
            {/* Left Columns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderFinanceCard()}
            </div>

            {/* Right side updates */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderStatsCard()}
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
