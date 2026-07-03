'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import {
  LayoutDashboard,
  UserCheck,
  CreditCard,
  GraduationCap,
  BookOpen,
  Bell,
  AlertCircle,
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  Settings,
  Activity,
  Library,
  LogOut,
  User,
  UserPlus,
  PhoneCall,
} from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  isOpen?: boolean;
}

export default function Sidebar({ user, isOpen = true }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Dynamic Calendar States
  const [viewDate, setViewDate] = useState(() => {
    // Default to July 2026 matching system simulated context, or current system date
    const d = new Date();
    if (d.getFullYear() < 2026) {
      return new Date(2026, 6, 2); // July 2, 2026
    }
    return d;
  });
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    if (d.getFullYear() < 2026) {
      return new Date(2026, 6, 2); // July 2, 2026
    }
    return d;
  });

  const today = new Date();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const getMenuCategories = () => {
    const role = user.role;

    switch (role) {
      case 'STUDENT':
        return [
          {
            title: 'Academic',
            items: [
              { label: 'Dashboard', path: '/portal/student', icon: LayoutDashboard },
              { label: 'My Attendance', path: '/portal/student/attendance', icon: UserCheck },
              { label: 'Exams & Routine', path: '/portal/student/exams', icon: CalendarIcon },
              { label: 'Study Materials', path: '/portal/student/materials', icon: BookOpen },
            ],
          },
          {
            title: 'Finance',
            items: [
              { label: 'Fee Payments', path: '/portal/student/fees', icon: CreditCard },
            ],
          },
          {
            title: 'Communication & Safety',
            items: [
              { label: 'Notice Board', path: '/portal/student/notices', icon: Bell },
              { label: 'My Complaints', path: '/portal/student/complaints', icon: AlertCircle },
            ],
          },
        ];
      case 'PARENT':
        return [
          {
            title: 'Academic',
            items: [
              { label: 'Student Info', path: '/portal/parent', icon: LayoutDashboard },
              { label: 'Attendance Monitor', path: '/portal/parent/attendance', icon: UserCheck },
              { label: 'Exam Schedules', path: '/portal/parent/exams', icon: CalendarIcon },
            ],
          },
          {
            title: 'Finance',
            items: [
              { label: 'Fee Statements', path: '/portal/parent/fees', icon: CreditCard },
            ],
          },
          {
            title: 'Communication',
            items: [
              { label: 'Notices', path: '/portal/parent/notices', icon: Bell },
            ],
          },
        ];
      case 'TEACHER':
        return [
          {
            title: 'Academic',
            items: [
              { label: 'My Classes', path: '/portal/teacher/classes', icon: LayoutDashboard },
              { label: 'Upload Materials', path: '/portal/teacher/uploads', icon: BookOpen },
            ],
          },
          {
            title: 'Finance',
            items: [
              { label: 'Salary Slips', path: '/portal/teacher/salary', icon: DollarSign },
            ],
          },
          {
            title: 'Communication',
            items: [
              { label: 'Notices', path: '/portal/teacher/notices', icon: Bell },
            ],
          },
          {
            title: 'Profile',
            items: [
              { label: 'My Profile', path: '/portal/teacher', icon: User },
            ],
          },
        ];
      case 'PRINCIPAL':
      case 'VICE_PRINCIPAL':
        const rootPath = role === 'PRINCIPAL' ? '/portal/principal' : '/portal/vp';
        return [
          {
            title: 'Acdemics & Audit',
            items: [
              { label: 'Overview', path: rootPath, icon: LayoutDashboard },
              { label: 'Academic Audit', path: `${rootPath}/academics`, icon: GraduationCap },
              { label: 'Attendance Monitor', path: `${rootPath}/attendance`, icon: UserCheck },
            ],
          },
          {
            title: 'Safety & Communication',
            items: [
              { label: 'Complaints Management', path: `${rootPath}/complaints`, icon: AlertCircle },
              { label: 'Notices', path: `${rootPath}/notices`, icon: Bell },
            ],
          },
        ];
      case 'ACCOUNTS_HEAD':
      case 'ACCOUNTS_OFFICER':
        return [
          {
            title: 'Accounts Desk',
            items: [
              { label: 'Financials Overview', path: '/portal/accounts', icon: LayoutDashboard },
              { label: 'Payment Desk', path: '/portal/accounts/payments', icon: CreditCard },
            ],
          },
          {
            title: 'Structure & Payroll',
            items: [
              { label: 'Fee Structure', path: '/portal/accounts/structures', icon: Settings },
              { label: 'Salary Management', path: '/portal/accounts/salaries', icon: DollarSign },
            ],
          },
          {
            title: 'Communication',
            items: [
              { label: 'Notices', path: '/portal/accounts/notices', icon: Bell },
            ],
          },
        ];
      case 'ADMIN':
        return [
          {
            title: 'Administration',
            items: [
              { label: 'Admin Dashboard', path: '/portal/admin', icon: LayoutDashboard },
              { label: 'User Management', path: '/portal/admin/users', icon: Users },
            ],
          },
          {
            title: 'Security & System',
            items: [
              { label: 'College Config', path: '/portal/admin/settings', icon: Settings },
              { label: 'Security Logs', path: '/portal/admin/audit', icon: Activity },
            ],
          },
          {
            title: 'Communication',
            items: [
              { label: 'Notice Board', path: '/portal/admin/notices', icon: Bell },
            ],
          },
        ];
      case 'CHAIRPERSON':
        return [
          {
            title: 'Overview & Academic',
            items: [
              { label: 'Chairperson Portal', path: '/portal/chairperson', icon: LayoutDashboard },
              { label: 'Academic Reports', path: '/portal/chairperson/academics', icon: GraduationCap },
            ],
          },
          {
            title: 'Finance Overview',
            items: [
              { label: 'Financial Summaries', path: '/portal/chairperson/finance', icon: DollarSign },
            ],
          },
          {
            title: 'Communication',
            items: [
              { label: 'Notices', path: '/portal/chairperson/notices', icon: Bell },
            ],
          },
        ];
      case 'HR':
        return [
          {
            title: 'Management',
            items: [
              { label: 'HR Dashboard', path: '/portal/hr', icon: LayoutDashboard },
              { label: 'Employee Records', path: '/portal/hr/users', icon: Users },
            ],
          },
          {
            title: 'Attendance',
            items: [
              { label: 'Staff Attendance', path: '/portal/hr/attendance', icon: UserCheck },
            ],
          },
          {
            title: 'Communication',
            items: [
              { label: 'Notice Board', path: '/portal/hr/notices', icon: Bell },
            ],
          },
        ];
      case 'LIBRARIAN':
        return [
          {
            title: 'Library Desk',
            items: [
              { label: 'Librarian Portal', path: '/portal/librarian', icon: LayoutDashboard },
              { label: 'Book Management', path: '/portal/librarian/books', icon: Library },
            ],
          },
          {
            title: 'Communication',
            items: [
              { label: 'Notice Board', path: '/portal/librarian/notices', icon: Bell },
            ],
          },
        ];
      case 'EXAM_DEPT':
        return [
          {
            title: 'Exams Operations',
            items: [
              { label: 'Exam Dashboard', path: '/portal/exam-dept', icon: LayoutDashboard },
              { label: 'Exams Scheduling', path: '/portal/exam-dept/exams', icon: CalendarIcon },
              { label: 'Seat Allocations', path: '/portal/exam-dept/seats', icon: GraduationCap },
            ],
          },
          {
            title: 'Communication',
            items: [
              { label: 'Notice Board', path: '/portal/exam-dept/notices', icon: Bell },
            ],
          },
        ];
      case 'RECEPTION':
        return [
          {
            title: 'Admission Desk',
            items: [
              { label: 'Register Student', path: '/portal/reception', icon: UserPlus },
              { label: 'All Students', path: '/portal/reception/students', icon: Users },
            ],
          },
          {
            title: 'Monitoring',
            items: [
              { label: 'Attendance Monitor', path: '/portal/reception/attendance', icon: UserCheck },
              { label: 'Absent Today', path: '/portal/reception/absent', icon: PhoneCall },
            ],
          },
        ];
      default:
        return [
          {
            title: 'Menu',
            items: [
              { label: 'Dashboard', path: '/portal', icon: LayoutDashboard },
            ],
          },
        ];
    }
  };

  // Helper properties to calculate calendars dynamically
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const generateDays = () => {
    // Standard Mon-start grid offsets
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; 
    const prevDaysCount = new Date(year, month, 0).getDate();
    const currentDaysCount = new Date(year, month + 1, 0).getDate();

    const days: any[] = [];

    // Prior month overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevDaysCount - i;
      const cellDate = new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, dayNum);
      days.push({
        dayNum,
        type: 'prev',
        date: cellDate,
        isWeekend: cellDate.getDay() === 0 || cellDate.getDay() === 6
      });
    }

    // Current month days
    for (let i = 1; i <= currentDaysCount; i++) {
      const cellDate = new Date(year, month, i);
      days.push({
        dayNum: i,
        type: 'current',
        date: cellDate,
        isWeekend: cellDate.getDay() === 0 || cellDate.getDay() === 6
      });
    }

    // Trailing month overflow days (fill up to standard 42-day calendar format)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const cellDate = new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i);
      days.push({
        dayNum: i,
        type: 'next',
        date: cellDate,
        isWeekend: cellDate.getDay() === 0 || cellDate.getDay() === 6
      });
    }

    return days;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const calendarDays = generateDays();
  const menuCategories = getMenuCategories();

  return (
    <aside
      className={styles.sidebar}
      style={{
        transform: isOpen ? 'translateX(0)' : 'translateX(-260px)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
      }}
    >
      {/* Real Dynamic Calendar Widget */}
      <div className={styles.calendarWidget}>
        <div className={styles.calHeader}>
          <span onClick={handlePrevMonth} style={{ cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }}>&lt;</span>
          <span style={{ fontWeight: '600' }}>{monthNames[month]} {year}</span>
          <span onClick={handleNextMonth} style={{ cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }}>&gt;</span>
        </div>
        
        {/* Day label headers */}
        <div className={styles.calDaysRow}>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span className={styles.weekendLabel}>Sat</span>
          <span className={styles.weekendLabel}>Sun</span>
        </div>
        
        {/* Dynamic Days grid */}
        <div className={styles.calGrid}>
          {calendarDays.map((cell, idx) => {
            const isSelected = isSameDay(cell.date, selectedDate);
            const isCurrentToday = isSameDay(cell.date, today);
            
            let cellClass = '';
            if (cell.type === 'prev' || cell.type === 'next') {
              cellClass = styles.prevMonthDay;
            } else if (isSelected) {
              cellClass = styles.activeDay;
            } else if (isCurrentToday) {
              cellClass = styles.todayHighlight;
            } else if (cell.isWeekend) {
              cellClass = styles.weekendDay;
            }

            return (
              <span
                key={idx}
                className={cellClass}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedDate(cell.date)}
              >
                {cell.dayNum}
              </span>
            );
          })}
        </div>
      </div>




    </aside>
  );
}
