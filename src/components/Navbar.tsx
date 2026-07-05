'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { useTheme } from './ThemeContext';
import { useDate } from './DateContext';
import { useSidebar } from './SidebarContext';
import {
  Sun, Moon, CalendarDays, ToggleLeft, ToggleRight, Clock,
  Menu, ChevronDown, GraduationCap, ClipboardList, BookOpen,
  Users, FileText, Bell, CreditCard, AlertCircle, BarChart2,
  CalendarCheck, UserCheck, UserPlus, MessageSquare, Award, LayoutDashboard,
  DollarSign, Settings, Activity, Library, LogOut, PhoneCall, Calendar
} from 'lucide-react';
import { adToBs } from '@/lib/dateConverter';

// Maps every role to their actual sidebar routes
const ROLE_MENU: Record<string, { label: string; path: string; icon: React.ElementType }[]> = {
  STUDENT: [
    { label: 'Dashboard',       path: '/portal/student',             icon: LayoutDashboard },
    { label: 'Attendance',      path: '/portal/student/attendance',  icon: UserCheck },
    { label: 'Exam Results',    path: '/portal/student/results',     icon: GraduationCap },
    { label: 'Exam Seats',      path: '/portal/student/seats',       icon: Calendar },
    { label: 'Academic Calendar',path:'/portal/student/calendar',    icon: CalendarCheck },
    { label: 'Study Materials', path: '/portal/student/materials',   icon: BookOpen },
    { label: 'Fee Ledger',      path: '/portal/student/fees',        icon: CreditCard },
    { label: 'Payment Receipts',path: '/portal/student/receipts',    icon: DollarSign },
    { label: 'Notice Board',    path: '/portal/student/notices',     icon: Bell },
    { label: 'My Complaints',   path: '/portal/student/complaints',  icon: AlertCircle },
  ],
  PARENT: [
    { label: 'Student Info',      path: '/portal/parent',             icon: LayoutDashboard },
    { label: 'Attendance Monitor',path: '/portal/parent/attendance',  icon: UserCheck },
    { label: 'Academic Results',  path: '/portal/parent/results',     icon: GraduationCap },
    { label: 'Seat Assignment',   path: '/portal/parent/seats',       icon: Calendar },
    { label: 'Academic Calendar', path: '/portal/parent/calendar',    icon: CalendarCheck },
    { label: 'Fee Statements',    path: '/portal/parent/fees',        icon: CreditCard },
    { label: 'Notices',           path: '/portal/parent/notices',     icon: Bell },
  ],
  TEACHER: [
    { label: 'Overview',        path: '/portal/teacher',           icon: LayoutDashboard },
    { label: 'My Classes',      path: '/portal/teacher/classes',   icon: Users },
    { label: 'Attendance Sheet',path: '/portal/teacher/attendance',icon: UserCheck },
    { label: 'Enter Marks',     path: '/portal/teacher/marks',     icon: FileText },
    { label: 'Study Materials', path: '/portal/teacher/uploads',   icon: BookOpen },
    { label: 'Academic Calendar',path:'/portal/teacher/calendar',  icon: CalendarCheck },
    { label: 'Salary Slips',    path: '/portal/teacher/salary',    icon: DollarSign },
    { label: 'Notices',         path: '/portal/teacher/notices',   icon: Bell },
  ],
  PRINCIPAL: [
    { label: 'Overview',                path: '/portal/principal',                       icon: LayoutDashboard },
    { label: 'Admissions Approval',     path: '/portal/principal/admissions',            icon: UserCheck },
    { label: 'Admission Portal & Years',path: '/portal/principal/admission-control',     icon: Settings },
    { label: 'Auto Section Allocator',  path: '/portal/principal/roll-allocation',       icon: UserPlus },
    { label: 'Late Joiners Queue',      path: '/portal/principal/late-joiners',          icon: Users },
    { label: 'Staff Management',        path: '/portal/principal/staff',                 icon: Users },
    { label: 'Payroll Overview',        path: '/portal/principal/finance',               icon: DollarSign },
    { label: 'Scholarship Schemes',     path: '/portal/principal/schemes',               icon: CreditCard },
    { label: 'Academic Audit',          path: '/portal/principal/academics',             icon: GraduationCap },
    { label: 'Attendance Monitor',      path: '/portal/principal/attendance',            icon: UserCheck },
    { label: 'Academic Table & Holidays',path: '/portal/principal/academic-calendar',     icon: CalendarCheck },
    { label: 'Complaints Management',   path: '/portal/principal/complaints',            icon: AlertCircle },
    { label: 'Notices',                 path: '/portal/principal/notices',               icon: Bell },
  ],
  VICE_PRINCIPAL: [
    { label: 'Overview',                path: '/portal/vp',                              icon: LayoutDashboard },
    { label: 'Admissions Approval',     path: '/portal/vp/admissions',                   icon: UserCheck },
    { label: 'Admission Portal & Years',path: '/portal/vp/admission-control',            icon: Settings },
    { label: 'Auto Section Allocator',  path: '/portal/vp/roll-allocation',              icon: UserPlus },
    { label: 'Late Joiners Queue',      path: '/portal/vp/late-joiners',                 icon: Users },
    { label: 'Staff Management',        path: '/portal/vp/staff',                        icon: Users },
    { label: 'Payroll Overview',        path: '/portal/vp/finance',                      icon: DollarSign },
    { label: 'Scholarship Schemes',     path: '/portal/vp/schemes',                      icon: CreditCard },
    { label: 'Academic Audit',          path: '/portal/vp/academics',                    icon: GraduationCap },
    { label: 'Attendance Monitor',      path: '/portal/vp/attendance',                   icon: UserCheck },
    { label: 'Academic Table & Holidays',path: '/portal/vp/academic-calendar',            icon: CalendarCheck },
    { label: 'Complaints Management',   path: '/portal/vp/complaints',                   icon: AlertCircle },
    { label: 'Notices',                 path: '/portal/vp/notices',                      icon: Bell },
  ],
  ACCOUNTS_HEAD: [
    { label: 'Cashier Dashboard',   path: '/portal/accounts-head',            icon: LayoutDashboard },
    { label: 'Receive Payment',     path: '/portal/accounts-head/collect',    icon: DollarSign },
    { label: 'Billing Registry',    path: '/portal/accounts-head/payments',   icon: CreditCard },
    { label: 'Fee Structures',      path: '/portal/accounts-head/structures', icon: Settings },
    { label: 'Salaries & Payroll',  path: '/portal/accounts-head/salaries',   icon: Users },
    { label: 'Financial Audit',     path: '/portal/accounts-head/audit',      icon: Activity },
    { label: 'Academic Calendar',   path: '/portal/accounts-head/calendar',   icon: CalendarCheck },
  ],
  ACCOUNTS_OFFICER: [
    { label: 'Cashier Dashboard',   path: '/portal/accounts-officer',            icon: LayoutDashboard },
    { label: 'Receive Payment',     path: '/portal/accounts-officer/collect',    icon: DollarSign },
    { label: 'Billing Registry',    path: '/portal/accounts-officer/payments',   icon: CreditCard },
    { label: 'Fee Structures',      path: '/portal/accounts-officer/structures', icon: Settings },
    { label: 'Salaries & Payroll',  path: '/portal/accounts-officer/salaries',   icon: Users },
    { label: 'Financial Audit',     path: '/portal/accounts-officer/audit',      icon: Activity },
    { label: 'Academic Calendar',   path: '/portal/accounts-officer/calendar',   icon: CalendarCheck },
  ],
  ADMIN: [
    { label: 'Admin Dashboard', path: '/portal/admin',          icon: LayoutDashboard },
    { label: 'User Directory',  path: '/portal/admin/users',    icon: Users },
    { label: 'System Settings', path: '/portal/admin/settings', icon: Settings },
    { label: 'Audit Logs',      path: '/portal/admin/audit',    icon: Activity },
    { label: 'Academic Calendar',path: '/portal/admin/calendar',icon: CalendarCheck },
  ],
  CHAIRPERSON: [
    { label: 'Overview',        path: '/portal/chairperson',                     icon: LayoutDashboard },
    { label: 'Financial Board', path: '/portal/chairperson/finance',             icon: BarChart2 },
    { label: 'Staff Registry',  path: '/portal/chairperson/staff',               icon: Users },
    { label: 'Academic Table & Holidays',path: '/portal/chairperson/academic-calendar',icon: CalendarCheck },
  ],
  HR: [
    { label: 'HR Dashboard',    path: '/portal/hr',             icon: LayoutDashboard },
    { label: 'Staff Registry',  path: '/portal/hr/staff',       icon: Users },
    { label: 'Attendance',      path: '/portal/hr/attendance',  icon: UserCheck },
    { label: 'Payroll & Salary',path: '/portal/hr/salary',      icon: DollarSign },
    { label: 'Academic Calendar',path: '/portal/hr/calendar',   icon: CalendarCheck },
  ],
  LIBRARIAN: [
    { label: 'Library Overview', path: '/portal/librarian',        icon: LayoutDashboard },
    { label: 'Book Inventory',   path: '/portal/librarian/books',  icon: BookOpen },
    { label: 'Checked Out',      path: '/portal/librarian/issued', icon: ClipboardList },
    { label: 'Notice Board',     path: '/portal/librarian/notices',icon: Bell },
    { label: 'Academic Calendar',path: '/portal/librarian/calendar',icon: CalendarCheck },
  ],
  EXAM_DEPT: [
    { label: 'Exam Dashboard',    path: '/portal/exam-dept',          icon: LayoutDashboard },
    { label: 'Exams Scheduling',  path: '/portal/exam-dept/exams',    icon: CalendarCheck },
    { label: 'Seat Allocations',  path: '/portal/exam-dept/seats',    icon: GraduationCap },
    { label: 'Results Mgmt',      path: '/portal/exam-dept/results',  icon: FileText },
    { label: 'Academic Calendar', path: '/portal/exam-dept/calendar', icon: CalendarCheck },
    { label: 'Notice Board',      path: '/portal/exam-dept/notices',  icon: Bell },
  ],
  RECEPTION: [
    { label: 'Register Student',     path: '/portal/reception',            icon: UserPlus },
    { label: 'Student Directory',    path: '/portal/reception/students',   icon: Users },
    { label: 'Attendance Terminal',  path: '/portal/reception/attendance', icon: UserCheck },
    { label: 'Absent Today',         path: '/portal/reception/absent',     icon: AlertCircle },
    { label: 'Academic Calendar',    path: '/portal/reception/calendar',   icon: CalendarCheck },
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
    const interval = setInterval(() => setCurrentDate(new Date()), 1000);
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '10px', background: 'var(--surface-sunken)', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
          <Clock size={16} color="#6366F1" />
          <span>{currentDate ? currentDate.toLocaleTimeString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Loading time...'}</span>
        </div>

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
