'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { useTheme } from './ThemeContext';
import { useDate } from './DateContext';
import { useSidebar } from './SidebarContext';
import {
  Sun, Moon, CalendarDays, ToggleLeft, ToggleRight,
  Menu, ChevronDown, GraduationCap, ClipboardList, BookOpen,
  Users, FileText, Bell, CreditCard, AlertCircle, BarChart2,
  CalendarCheck, UserCheck, MessageSquare, Award, LayoutDashboard,
  DollarSign, Settings, Activity, Library, LogOut,
} from 'lucide-react';
import { adToBs } from '@/lib/dateConverter';

// Maps every role to their actual sidebar routes
const ROLE_MENU: Record<string, { label: string; path: string; icon: React.ElementType }[]> = {
  STUDENT: [
    { label: 'Dashboard',       path: '/portal/student',             icon: LayoutDashboard },
    { label: 'Attendance',      path: '/portal/student/attendance',  icon: UserCheck },
    { label: 'Exams & Routine', path: '/portal/student/exams',       icon: CalendarCheck },
    { label: 'Study Materials', path: '/portal/student/materials',   icon: BookOpen },
    { label: 'Fee Payments',    path: '/portal/student/fees',        icon: CreditCard },
    { label: 'Notice Board',    path: '/portal/student/notices',     icon: Bell },
    { label: 'My Complaints',   path: '/portal/student/complaints',  icon: AlertCircle },
  ],
  PARENT: [
    { label: 'Student Info',      path: '/portal/parent',             icon: LayoutDashboard },
    { label: 'Attendance Monitor',path: '/portal/parent/attendance',  icon: UserCheck },
    { label: 'Exam Schedules',    path: '/portal/parent/exams',       icon: CalendarCheck },
    { label: 'Fee Statements',    path: '/portal/parent/fees',        icon: CreditCard },
    { label: 'Notices',           path: '/portal/parent/notices',     icon: Bell },
  ],
  TEACHER: [
    { label: 'My Classes',      path: '/portal/teacher/classes',   icon: LayoutDashboard },
    { label: 'Upload Materials',path: '/portal/teacher/uploads',   icon: BookOpen },
    { label: 'Salary Slips',    path: '/portal/teacher/salary',   icon: DollarSign },
    { label: 'Notices',         path: '/portal/teacher/notices',  icon: Bell },
    { label: 'My Profile',      path: '/portal/teacher',          icon: Users },
  ],
  PRINCIPAL: [
    { label: 'Overview',              path: '/portal/principal',             icon: LayoutDashboard },
    { label: 'Academic Audit',        path: '/portal/principal/academics',   icon: GraduationCap },
    { label: 'Attendance Monitor',    path: '/portal/principal/attendance',  icon: UserCheck },
    { label: 'Complaints Management', path: '/portal/principal/complaints',  icon: AlertCircle },
    { label: 'Notices',               path: '/portal/principal/notices',     icon: Bell },
  ],
  VICE_PRINCIPAL: [
    { label: 'Overview',              path: '/portal/vp',             icon: LayoutDashboard },
    { label: 'Academic Audit',        path: '/portal/vp/academics',   icon: GraduationCap },
    { label: 'Attendance Monitor',    path: '/portal/vp/attendance',  icon: UserCheck },
    { label: 'Complaints Management', path: '/portal/vp/complaints',  icon: AlertCircle },
    { label: 'Notices',               path: '/portal/vp/notices',     icon: Bell },
  ],
  ACCOUNTS_HEAD: [
    { label: 'Financials Overview', path: '/portal/accounts-head',              icon: LayoutDashboard },
    { label: 'Payment Desk',        path: '/portal/accounts-head/payments',     icon: CreditCard },
    { label: 'Fee Structure',       path: '/portal/accounts-head/structures',   icon: Settings },
    { label: 'Salary Management',   path: '/portal/accounts-head/salaries',     icon: DollarSign },
    { label: 'Notices',             path: '/portal/accounts-head/notices',      icon: Bell },
  ],
  ACCOUNTS_OFFICER: [
    { label: 'Financials Overview', path: '/portal/accounts-officer',            icon: LayoutDashboard },
    { label: 'Payment Desk',        path: '/portal/accounts-officer/payments',   icon: CreditCard },
    { label: 'Fee Structure',       path: '/portal/accounts-officer/structures', icon: Settings },
    { label: 'Salary Management',   path: '/portal/accounts-officer/salaries',   icon: DollarSign },
    { label: 'Notices',             path: '/portal/accounts-officer/notices',    icon: Bell },
  ],
  ADMIN: [
    { label: 'Admin Dashboard', path: '/portal/admin',          icon: LayoutDashboard },
    { label: 'User Management', path: '/portal/admin/users',    icon: Users },
    { label: 'College Config',  path: '/portal/admin/settings', icon: Settings },
    { label: 'Security Logs',   path: '/portal/admin/audit',    icon: Activity },
    { label: 'Notice Board',    path: '/portal/admin/notices',  icon: Bell },
  ],
  CHAIRPERSON: [
    { label: 'Chairperson Portal',    path: '/portal/chairperson',          icon: LayoutDashboard },
    { label: 'Academic Reports',      path: '/portal/chairperson/academics',icon: GraduationCap },
    { label: 'Financial Summaries',   path: '/portal/chairperson/finance',  icon: DollarSign },
    { label: 'Notices',               path: '/portal/chairperson/notices',  icon: Bell },
  ],
  HR: [
    { label: 'HR Dashboard',    path: '/portal/hr',             icon: LayoutDashboard },
    { label: 'Employee Records',path: '/portal/hr/users',       icon: Users },
    { label: 'Staff Attendance',path: '/portal/hr/attendance',  icon: UserCheck },
    { label: 'Notice Board',    path: '/portal/hr/notices',     icon: Bell },
  ],
  LIBRARIAN: [
    { label: 'Librarian Portal', path: '/portal/librarian',       icon: LayoutDashboard },
    { label: 'Book Management',  path: '/portal/librarian/books', icon: Library },
    { label: 'Notice Board',     path: '/portal/librarian/notices',icon: Bell },
  ],
  EXAM_DEPT: [
    { label: 'Exam Dashboard',    path: '/portal/exam-dept',          icon: LayoutDashboard },
    { label: 'Exams Scheduling',  path: '/portal/exam-dept/exams',    icon: CalendarCheck },
    { label: 'Seat Allocations',  path: '/portal/exam-dept/seats',    icon: GraduationCap },
    { label: 'Notice Board',      path: '/portal/exam-dept/notices',  icon: Bell },
  ],
  RECEPTION: [
    { label: 'Register Student',     path: '/portal/reception',            icon: LayoutDashboard },
    { label: 'All Students',         path: '/portal/reception/students',   icon: Users },
    { label: 'Attendance Monitor',   path: '/portal/reception/attendance', icon: UserCheck },
    { label: 'Absent Today',         path: '/portal/reception/absent',     icon: Bell },
  ],
};

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { dateMode, toggleDateMode } = useDate();
  const { toggleSidebar, closeSidebar } = useSidebar();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [academicOpen, setAcademicOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const academicRef = useRef<HTMLDivElement>(null);
  const profileRef  = useRef<HTMLDivElement>(null);

  // Clock tick
  useEffect(() => {
    setCurrentDate(new Date());
    const interval = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user info
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setUserRole(data.user.role);
          setUserName(data.user.name || '');
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (academicRef.current && !academicRef.current.contains(e.target as Node)) setAcademicOpen(false);
      if (profileRef.current  && !profileRef.current.contains(e.target as Node))  setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) { router.push('/login'); router.refresh(); }
    } catch {}
  };

  const getCalendarDisplay = () => {
    if (!currentDate) return '';
    const bs = adToBs(currentDate);
    const adString = currentDate.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
    return `${adString}  |  ${bs.day} ${bs.monthName} ${bs.year} BS`;
  };

  const menuItems = userRole ? (ROLE_MENU[userRole] ?? []) : [];
  const initials  = userName ? userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  const displayRole = (userRole ?? '').replace(/_/g, ' ');

  return (
    <header className={styles.navbar}>
      {/* LEFT: Hamburger + Academic dropdown */}
      <div className={styles.leftActions}>
        <button className={styles.menuBtn} aria-label="Toggle sidebar" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>

        <div className={styles.academicWrapper} ref={academicRef}>
          <button className={styles.academicBtn} onClick={() => setAcademicOpen(v => !v)} aria-expanded={academicOpen}>
            <span>Academic</span>
            <ChevronDown size={14} style={{ transform: academicOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </button>

          {academicOpen && menuItems.length > 0 && (
            <div className={styles.academicDropdown}>
              <div className={styles.dropdownHeader}>Quick Navigation</div>
              <div className={styles.dropdownGrid}>
                {menuItems.map(({ label, path, icon: Icon }) => (
                  <Link key={path} href={path} className={styles.dropdownItem}
                    onClick={() => { setAcademicOpen(false); closeSidebar(); }}>
                    <span className={styles.dropdownIcon}><Icon size={15} /></span>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Date + Toggles + Profile */}
      <div className={styles.actions}>
        <div className={styles.dateDisplay}>
          <CalendarDays size={16} />
          <span>{getCalendarDisplay() || 'Loading dates...'}</span>
        </div>

        <button onClick={toggleDateMode} className={styles.calendarToggle}>
          {dateMode === 'AD' ? <ToggleLeft size={20} /> : <ToggleRight size={20} />}
          <span>Mode: {dateMode}</span>
        </button>

        <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Profile Avatar Dropdown */}
        <div className={styles.profileWrapper} ref={profileRef}>
          <button className={styles.profileBtn} onClick={() => setProfileOpen(v => !v)} aria-label="Profile menu">
            <div className={styles.profileAvatar}>
              <img src="/avatar.png" alt="" className={styles.avatarImg} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              {initials}
            </div>
            <span className={styles.profileName}>{userName || 'User'}</span>
            <ChevronDown size={13} style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }} />
          </button>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              {/* User identity header */}
              <div className={styles.profileDropdownHeader}>
                <div className={styles.profileDropdownAvatar}>
                  <img src="/avatar.png" alt="" className={styles.avatarImg} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  {initials}
                </div>
                <div>
                  <p className={styles.profileDropdownName}>{userName}</p>
                  <p className={styles.profileDropdownRole}>{displayRole}</p>
                </div>
              </div>

              <div className={styles.profileDropdownDivider} />

              <button className={styles.profileDropdownItem} onClick={() => { setProfileOpen(false); router.push('/portal/profile'); }}>
                <Users size={15} />
                <span>My Profile</span>
              </button>
              <button className={styles.profileDropdownItem} onClick={() => { setProfileOpen(false); router.push('/portal/settings'); }}>
                <Settings size={15} />
                <span>Account Settings</span>
              </button>

              <div className={styles.profileDropdownDivider} />

              <button className={`${styles.profileDropdownItem} ${styles.profileDropdownLogout}`} onClick={handleLogout}>
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
