'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useSidebar } from './SidebarContext';
import { adToBs, bsToAd, nepaliYears, nepaliMonths } from '../lib/dateConverter';
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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';
import AcademicCalendarModal from './portals/AcademicCalendarModal';

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
  const { closeSidebar } = useSidebar();

  // Auto-close on mobile when route changes
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      closeSidebar();
    }
  }, [pathname]);

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

  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCalendarEvents() {
      try {
        const res = await fetch('/api/academic-calendar');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setDbEvents(data.events || []);
          }
        }
      } catch (e) {
        console.error('Failed to fetch calendar events in sidebar', e);
      }
    }
    fetchCalendarEvents();
  }, []);

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
            title: 'Administration',
            items: [
              { label: 'Admissions Approval', path: `${rootPath}/admissions`, icon: UserCheck },
              { label: 'Admission Portal & Years', path: `${rootPath}/admission-control`, icon: Settings },
              { label: 'Auto Section & Roll Allocator', path: `${rootPath}/roll-allocation`, icon: UserPlus },
              { label: 'Late Joiners Queue', path: `${rootPath}/late-joiners`, icon: Users },
              { label: 'Staff Management', path: `${rootPath}/staff`, icon: Users },
            ],
          },
          {
            title: 'Finance & Audit',
            items: [
              { label: 'Payroll Overview', path: `${rootPath}/finance`, icon: DollarSign },
              { label: 'Scholarship Schemes', path: `${rootPath}/schemes`, icon: CreditCard },
            ],
          },
          {
            title: 'Acdemics & Audit',
            items: [
              { label: 'Overview', path: rootPath, icon: LayoutDashboard },
              { label: 'Academic Audit', path: `${rootPath}/academics`, icon: GraduationCap },
              { label: 'Attendance Monitor', path: `${rootPath}/attendance`, icon: UserCheck },
              { label: 'Academic Table & Holidays', path: `${rootPath}/academic-calendar`, icon: CalendarIcon },
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
              { label: 'Academic Calendar', path: '/portal/accounts/calendar', icon: CalendarIcon },
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
              { label: 'Academic Calendar', path: '/portal/admin/calendar', icon: CalendarIcon },
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
              { label: 'Academic Table & Holidays', path: '/portal/chairperson/academic-calendar', icon: CalendarIcon },
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
              { label: 'Academic Calendar', path: '/portal/hr/calendar', icon: CalendarIcon },
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
              { label: 'Academic Calendar', path: '/portal/librarian/calendar', icon: CalendarIcon },
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
              { label: 'Academic Calendar', path: '/portal/exam-dept/calendar', icon: CalendarIcon },
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
              { label: 'Academic Calendar', path: '/portal/reception/calendar', icon: CalendarIcon },
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

  const [bsYear, setBsYear] = useState(2083);
  const [bsMonth, setBsMonth] = useState(3); // Asar (1-indexed)

  const handlePrevMonth = () => {
    if (bsMonth === 1) {
      setBsYear(bsYear - 1);
      setBsMonth(12);
    } else {
      setBsMonth(bsMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (bsMonth === 12) {
      setBsYear(bsYear + 1);
      setBsMonth(1);
    } else {
      setBsMonth(bsMonth + 1);
    }
  };

  const generateDays = () => {
    const yearData = nepaliYears[bsYear] || nepaliYears[2083];
    const totalDaysInBsMonth = yearData.days[bsMonth - 1];
    const firstDayAd = bsToAd(bsYear, bsMonth, 1);
    const firstDayIndex = firstDayAd.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    const prevBsMonth = bsMonth === 1 ? 12 : bsMonth - 1;
    const prevBsYear = bsMonth === 1 ? bsYear - 1 : bsYear;
    const prevDaysCount = (nepaliYears[prevBsYear] || nepaliYears[2083]).days[prevBsMonth - 1];

    const days: any[] = [];

    // Prior BS month overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevDaysCount - i;
      const cellAdDate = bsToAd(prevBsYear, prevBsMonth, dayNum);
      days.push({
        bsDay: dayNum,
        type: 'prev',
        date: cellAdDate,
        isWeekend: cellAdDate.getDay() === 6 // Saturday ONLY is weekly holiday in Nepal
      });
    }

    // Current BS month days starting strictly from BS Day 1
    for (let d = 1; d <= totalDaysInBsMonth; d++) {
      const cellAdDate = bsToAd(bsYear, bsMonth, d);
      days.push({
        bsDay: d,
        type: 'current',
        date: cellAdDate,
        isWeekend: cellAdDate.getDay() === 6 // Saturday ONLY is weekly holiday in Nepal
      });
    }

    // Trailing next BS month overflow days
    const remainingSlots = 42 - days.length;
    const nextBsMonth = bsMonth === 12 ? 1 : bsMonth + 1;
    const nextBsYear = bsMonth === 12 ? bsYear + 1 : bsYear;
    for (let d = 1; d <= remainingSlots; d++) {
      const cellAdDate = bsToAd(nextBsYear, nextBsMonth, d);
      days.push({
        bsDay: d,
        type: 'next',
        date: cellAdDate,
        isWeekend: cellAdDate.getDay() === 6 // Saturday ONLY is weekly holiday in Nepal
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
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
      }}
    >
      {/* Mobile Close Bar */}
      <div className={styles.mobileCloseWrapper}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94A3B8' }}>NAVIGATION MENU</span>
        <button className={styles.mobileCloseBtn} onClick={closeSidebar}>
          <X size={18} />
        </button>
      </div>

      {/* Modern Professional Academic Calendar Widget */}
      <div className={styles.calendarWidget}>
      {/* Modern Professional Academic Calendar Widget (BS Primary Large / AD Secondary Small) */}
      {(() => {
        const headerBs = adToBs(new Date(year, month, 15));

        return (
          <div className={styles.calendarWidget}>
            <div className={styles.calHeaderTop}>
              <div className={styles.monthTitle}>
                <span style={{ fontSize: '0.98rem', fontWeight: '800', color: '#F8FAFC' }}>
                  {headerBs.year} {headerBs.monthName}
                </span>
                <span className={styles.bsTag}>
                  {monthNames[month]} {year} AD
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className={styles.navBtn} onClick={handlePrevMonth} title="Previous Month">
                  <ChevronLeft size={14} />
                </button>
                <button className={styles.navBtn} onClick={handleNextMonth} title="Next Month">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            
            {/* Day label headers */}
            <div className={styles.calDaysRow}>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className={styles.weekendLabel}>Sat</span>
            </div>
            
            {/* Dynamic Days grid (BS Large / AD Small) */}
            <div className={styles.calGrid}>
              {calendarDays.map((cell, idx) => {
                const isSelected = isSameDay(cell.date, selectedDate);
                const isCurrentToday = isSameDay(cell.date, today);

                // Format YYYY-MM-DD for matching API dateAD
                const yyyy = cell.date.getFullYear();
                const mm = String(cell.date.getMonth() + 1).padStart(2, '0');
                const dd = String(cell.date.getDate()).padStart(2, '0');
                const dateStr = `${yyyy}-${mm}-${dd}`;

                // Check API dynamic events by AD or BS date
                const matchingDbEvent = dbEvents.find((e: any) => {
                  if (!e) return false;
                  if (e.dateAD === dateStr) return true;
                  if (e.dateBS) {
                    const bsLower = e.dateBS.toLowerCase();
                    const bsMonthLower = nepaliMonths[bsMonth - 1]?.toLowerCase();
                    if (bsLower.includes(String(bsYear)) && (bsLower.includes(bsMonthLower) || bsLower.includes(`-${String(bsMonth).padStart(2, '0')}-`)) && (bsLower.endsWith(` ${cell.bsDay}`) || bsLower.endsWith(`-${String(cell.bsDay).padStart(2, '0')}`) || bsLower.includes(` ${cell.bsDay} `))) {
                      return true;
                    }
                  }
                  return false;
                });

                const isDefaultHoliday = cell.type === 'current' && (cell.bsDay === 5 || cell.bsDay === 20 || cell.bsDay === 25);
                const isExamDay = cell.type === 'current' && (cell.bsDay >= 12 && cell.bsDay <= 14);
                const isFeeDue = cell.type === 'current' && cell.bsDay === 18;

                const isHoliday = isDefaultHoliday || cell.isWeekend || matchingDbEvent?.type === 'HOLIDAY' || matchingDbEvent?.type === 'EMERGENCY_HOLIDAY' || matchingDbEvent?.isEmergency;

                let cellClass = styles.dayCell;
                if (cell.type === 'prev' || cell.type === 'next') {
                  cellClass += ` ${styles.prevMonthDay}`;
                }
                if (isSelected) {
                  cellClass += ` ${styles.activeDay}`;
                } else if (isCurrentToday) {
                  cellClass += ` ${styles.todayHighlight}`;
                } else if (isHoliday) {
                  cellClass += ` ${styles.holidayDay}`;
                }

                return (
                  <div
                    key={idx}
                    className={cellClass}
                    onClick={() => setSelectedDate(cell.date)}
                  >
                    <span className={styles.bsNumber}>{cell.bsDay}</span>
                    <span className={styles.adNumber}>{cell.date.getDate()}</span>
                    {isHoliday && <span className={`${styles.eventDot} ${styles.dotHoliday}`} />}
                    {isExamDay && !isHoliday && <span className={`${styles.eventDot} ${styles.dotExam}`} />}
                    {isFeeDue && !isHoliday && <span className={`${styles.eventDot} ${styles.dotFee}`} />}
                  </div>
                );
              })}
            </div>

            {/* Selected Date Event Card */}
            {(() => {
              const selBs = adToBs(selectedDate);
              const selYYYY = selectedDate.getFullYear();
              const selMM = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const selDD = String(selectedDate.getDate()).padStart(2, '0');
              const selDateStr = `${selYYYY}-${selMM}-${selDD}`;
              const selDbEvent = dbEvents.find(e => e.dateAD === selDateStr);
              const isSaturday = selectedDate.getDay() === 6;

              return (
                <div className={styles.eventBanner}>
                  <div className={styles.eventBannerTitle}>
                    <CalendarIcon size={12} style={{ color: '#38BDF8' }} />
                    <span style={{ fontWeight: '800' }}>{selBs.year} {selBs.monthName} {selBs.day}</span>
                    <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 'normal' }}>
                      ({monthNames[selectedDate.getMonth()]} {selectedDate.getDate()} AD)
                    </span>
                  </div>
                  <div className={styles.eventBannerText}>
                    {selDbEvent ? (
                      <span>{selDbEvent.isEmergency ? 'EMERGENCY HOLIDAY' : 'HOLIDAY'}: {selDbEvent.title} ({selDbEvent.description || 'Campus Closed'})</span>
                    ) : isSaturday ? (
                      'Saturday Weekly Holiday — Campus Closed'
                    ) : selectedDate.getDate() === 5 ? (
                      'Public Holiday — Campus Closed'
                    ) : selectedDate.getDate() >= 12 && selectedDate.getDate() <= 14 ? (
                      'Terminal Exam Routine Active'
                    ) : selectedDate.getDate() === 18 ? (
                      'Monthly Fee Installment Clearance Due'
                    ) : (
                      'Campus Operations Active • Regular Schedule'
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Expand Full Calendar Page Button */}
            <button
              className={styles.expandModalBtn}
              onClick={() => {
                const roleSlugMap: Record<string, string> = {
                  STUDENT: '/portal/student/calendar',
                  PARENT: '/portal/parent/calendar',
                  TEACHER: '/portal/teacher/calendar',
                  PRINCIPAL: '/portal/principal/academic-calendar',
                  VICE_PRINCIPAL: '/portal/vp/academic-calendar',
                  CHAIRPERSON: '/portal/chairperson/academic-calendar',
                  ACCOUNTS_HEAD: '/portal/accounts-head/calendar',
                  ACCOUNTS_OFFICER: '/portal/accounts-officer/calendar',
                  ADMIN: '/portal/admin/calendar',
                  HR: '/portal/hr/calendar',
                  LIBRARIAN: '/portal/librarian/calendar',
                  EXAM_DEPT: '/portal/exam-dept/calendar',
                  RECEPTION: '/portal/reception/calendar',
                };
                const targetPath = roleSlugMap[user.role] || '/portal/student/calendar';
                router.push(targetPath);
              }}
            >
              <Maximize2 size={12} />
              <span>Full Academic Calendar Page</span>
            </button>
          </div>
        );
      })()}
      </div>

      {/* Interactive Full Academic Calendar Modal */}
      <AcademicCalendarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userRole={user.role}
      />
    </aside>
  );
}
