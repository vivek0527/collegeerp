'use client';

import React, { useEffect, useState } from 'react';
import styles from './DashboardComponents.module.css';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ShieldAlert,
  Megaphone,
  Download,
  Edit3,
  ListPlus,
  X,
} from 'lucide-react';
import { adToBs, bsToAd, nepaliYears, nepaliMonths } from '../../lib/dateConverter';

interface BulkRow {
  id: string;
  title: string;
  dateAD: string;
  dateBS: string;
  type: string;
  description: string;
}

export default function AcademicCalendarManager({ userRole = 'Principal' }: { userRole?: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Mode state: 'single' | 'bulk'
  const [createMode, setCreateMode] = useState<'single' | 'bulk'>('single');

  // Bikram Sambat Calendar Month & Year states
  const [bsYear, setBsYear] = useState(2083);
  const [bsMonth, setBsMonth] = useState(3); // 3 = Asar (1-indexed)
  const [selectedBsDay, setSelectedBsDay] = useState(21);

  // Role permissions: ONLY Principal, Vice Principal, and Chairperson can create/edit/delete/declare emergency holidays
  const normalizedRole = userRole.toUpperCase().replace(/\s+/g, '_');
  const canManage = ['PRINCIPAL', 'VICE_PRINCIPAL', 'CHAIRPERSON'].includes(normalizedRole);

  // Single Standard Event Form State
  const [title, setTitle] = useState('');
  const [dateAD, setDateAD] = useState('');
  const [dateBS, setDateBS] = useState('');
  const [type, setType] = useState('HOLIDAY');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Bulk Whole Year Creation State
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([
    { id: '1', title: 'Dashain Festival Vacation', dateAD: '2026-10-15', dateBS: '2083 Kartik 29', type: 'HOLIDAY', description: 'Annual major festival vacation.' },
    { id: '2', title: 'Tihar & Dipawali Holidays', dateAD: '2026-11-05', dateBS: '2083 Kartik 20', type: 'HOLIDAY', description: 'Festival of lights holiday.' },
    { id: '3', title: 'Second Term Final Examination', dateAD: '2026-12-10', dateBS: '2083 Mangsir 25', type: 'EXAM', description: 'Term examinations for all streams.' },
  ]);
  const [submittingBulk, setSubmittingBulk] = useState(false);

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDateAD, setEditDateAD] = useState('');
  const [editDateBS, setEditDateBS] = useState('');
  const [editType, setEditType] = useState('HOLIDAY');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Emergency Holiday Form State
  const [emergTitle, setEmergTitle] = useState('');
  const [emergDateAD, setEmergDateAD] = useState('');
  const [emergDateBS, setEmergDateBS] = useState('');
  const [emergReason, setEmergReason] = useState('');
  const [declaringEmergency, setDeclaringEmergency] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/academic-calendar');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error('Failed to fetch academic events', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    if (!title || !dateAD || !dateBS) {
      setMsg({ text: 'Title, Date AD, and Date BS are required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/academic-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          dateAD,
          dateBS,
          type,
          isEmergency: false,
          description,
          createdBy: userRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: data.message || 'Academic event added successfully.', type: 'success' });
        setTitle('');
        setDateAD('');
        setDateBS('');
        setDescription('');
        fetchEvents();
      } else {
        setMsg({ text: data.error || 'Failed to add event', type: 'error' });
      }
    } catch (e) {
      setMsg({ text: 'Network error adding academic event', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Creation Helpers
  const addBulkRow = () => {
    setBulkRows([
      ...bulkRows,
      { id: Date.now().toString(), title: '', dateAD: '', dateBS: '', type: 'HOLIDAY', description: '' },
    ]);
  };

  const removeBulkRow = (id: string) => {
    if (bulkRows.length <= 1) return;
    setBulkRows(bulkRows.filter(r => r.id !== id));
  };

  const updateBulkRow = (id: string, field: keyof BulkRow, val: string) => {
    setBulkRows(bulkRows.map(r => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const handlePublishBulkCalendar = async () => {
    if (!canManage) return;
    const validRows = bulkRows.filter(r => r.title.trim() && r.dateAD && r.dateBS);
    if (validRows.length === 0) {
      setMsg({ text: 'Please fill in at least one complete event row.', type: 'error' });
      return;
    }

    setSubmittingBulk(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/academic-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulkEvents: validRows,
          createdBy: userRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: data.message || 'Published full academic calendar successfully.', type: 'success' });
        fetchEvents();
      } else {
        setMsg({ text: data.error || 'Failed to bulk add events', type: 'error' });
      }
    } catch (e) {
      setMsg({ text: 'Network error publishing bulk calendar', type: 'error' });
    } finally {
      setSubmittingBulk(false);
    }
  };

  // Edit Event Handlers
  const openEditModal = (ev: any) => {
    setEditingEvent(ev);
    setEditTitle(ev.title || '');
    setEditDateAD(ev.dateAD || '');
    setEditDateBS(ev.dateBS || '');
    setEditType(ev.type || 'HOLIDAY');
    setEditDescription(ev.description || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !editingEvent) return;

    setSavingEdit(true);
    try {
      const res = await fetch('/api/academic-calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEvent.id,
          title: editTitle,
          dateAD: editDateAD,
          dateBS: editDateBS,
          type: editType,
          isEmergency: editingEvent.isEmergency,
          description: editDescription,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Academic event updated successfully.', type: 'success' });
        setEditingEvent(null);
        fetchEvents();
      } else {
        setMsg({ text: data.error || 'Failed to update event', type: 'error' });
      }
    } catch (e) {
      setMsg({ text: 'Network error updating event', type: 'error' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeclareEmergencyHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    if (!emergTitle || !emergDateAD || !emergDateBS || !emergReason) {
      setMsg({ text: 'All Emergency Holiday fields are required.', type: 'error' });
      return;
    }

    setDeclaringEmergency(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/academic-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: emergTitle,
          dateAD: emergDateAD,
          dateBS: emergDateBS,
          type: 'EMERGENCY_HOLIDAY',
          isEmergency: true,
          description: emergReason,
          createdBy: userRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Emergency Holiday declared and notice broadcasted to all portals.', type: 'success' });
        setEmergTitle('');
        setEmergDateAD('');
        setEmergDateBS('');
        setEmergReason('');
        fetchEvents();
      } else {
        setMsg({ text: data.error || 'Failed to declare emergency holiday', type: 'error' });
      }
    } catch (e) {
      setMsg({ text: 'Network error declaring emergency holiday', type: 'error' });
    } finally {
      setDeclaringEmergency(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!canManage) return;
    if (!confirm('Are you sure you want to remove this calendar entry?')) return;

    try {
      const res = await fetch(`/api/academic-calendar?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Academic event deleted.', type: 'info' });
        fetchEvents();
      }
    } catch (e) {
      setMsg({ text: 'Failed to delete event', type: 'error' });
    }
  };

  // PDF Generator Handler
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the Academic Calendar PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Academic Calendar 2083 BS - Westminster College</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1E293B; }
            .header { text-align: center; border-bottom: 3px double #0F172A; padding-bottom: 16px; margin-bottom: 20px; }
            .college-name { font-size: 24px; font-weight: 900; color: #0F172A; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
            .sub-title { font-size: 14px; font-weight: 700; color: #2563EB; margin: 6px 0 0 0; }
            .notice-box { background: #F1F5F9; border-left: 4px solid #2563EB; padding: 12px 16px; font-size: 12px; margin-bottom: 24px; line-height: 1.5; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background-color: #0F172A; color: #FFFFFF; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
            td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; }
            tr:nth-child(even) { background-color: #F8FAFC; }
            .badge-holiday { background: #FEE2E2; color: #DC2626; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
            .badge-exam { background: #E0F2FE; color: #0284C7; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
            .badge-emergency { background: #DC2626; color: #FFFFFF; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
            .footer { margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 16px; text-align: center; font-size: 11px; color: #64748B; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="college-name">WESTMINSTER INTERNATIONAL COLLEGE</h1>
            <p class="sub-title">OFFICIAL ACADEMIC YEAR 2083 BS CALENDAR &amp; HOLIDAYS SCHEDULE</p>
            <p style="font-size: 11px; color: #64748B; margin-top: 4px;">Published under Executive Authority (${userRole}) • Session 2083 BS / 2026 AD</p>
          </div>

          <div class="notice-box">
            <strong>OFFICIAL NOTICE:</strong> This document represents the approved Academic Calendar schedule for students, faculty, and administrative staff. All declared public holidays, examination routines, and emergency closures apply across all departments.
          </div>

          <table>
            <thead>
              <tr>
                <th>S.N.</th>
                <th>Event / Holiday Title</th>
                <th>Date (BS)</th>
                <th>Date (AD)</th>
                <th>Category</th>
                <th>Directive / Notes</th>
              </tr>
            </thead>
            <tbody>
              ${events.map((ev, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${ev.title}</strong></td>
                  <td style="color: #2563EB; font-weight: bold;">${ev.dateBS}</td>
                  <td>${ev.dateAD}</td>
                  <td>
                    ${ev.isEmergency ? '<span class="badge-emergency">EMERGENCY</span>' : ev.type === 'EXAM' ? '<span class="badge-exam">EXAM ROUTINE</span>' : '<span class="badge-holiday">PUBLIC HOLIDAY</span>'}
                  </td>
                  <td>${ev.description || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Powered by Orbya Tech - Digital Campus SaaS Platform
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Month navigation helpers
  const handlePrevBsMonth = () => {
    if (bsMonth === 1) {
      setBsYear(bsYear - 1);
      setBsMonth(12);
    } else {
      setBsMonth(bsMonth - 1);
    }
  };

  const handleNextBsMonth = () => {
    if (bsMonth === 12) {
      setBsYear(bsYear + 1);
      setBsMonth(1);
    } else {
      setBsMonth(bsMonth + 1);
    }
  };

  // Generate Bikram Sambat Month Days Grid
  const yearData = nepaliYears[bsYear] || nepaliYears[2083];
  const totalDaysInBsMonth = yearData.days[bsMonth - 1];
  const firstDayAd = bsToAd(bsYear, bsMonth, 1);
  const firstDayIndex = firstDayAd.getDay();

  const prevBsMonth = bsMonth === 1 ? 12 : bsMonth - 1;
  const prevBsYear = bsMonth === 1 ? bsYear - 1 : bsYear;
  const prevDaysCount = (nepaliYears[prevBsYear] || nepaliYears[2083]).days[prevBsMonth - 1];

  const daysGrid: any[] = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevDaysCount - i;
    const cellAdDate = bsToAd(prevBsYear, prevBsMonth, dayNum);
    daysGrid.push({ bsDay: dayNum, bsMonth: prevBsMonth, bsYear: prevBsYear, type: 'prev', adDate: cellAdDate, isSaturday: cellAdDate.getDay() === 6 });
  }
  for (let d = 1; d <= totalDaysInBsMonth; d++) {
    const cellAdDate = bsToAd(bsYear, bsMonth, d);
    daysGrid.push({ bsDay: d, bsMonth: bsMonth, bsYear: bsYear, type: 'current', adDate: cellAdDate, isSaturday: cellAdDate.getDay() === 6 });
  }
  const remainingSlots = 42 - daysGrid.length;
  const nextBsMonth = bsMonth === 12 ? 1 : bsMonth + 1;
  const nextBsYear = bsMonth === 12 ? bsYear + 1 : bsYear;
  for (let d = 1; d <= remainingSlots; d++) {
    const cellAdDate = bsToAd(nextBsYear, nextBsMonth, d);
    daysGrid.push({ bsDay: d, bsMonth: nextBsMonth, bsYear: nextBsYear, type: 'next', adDate: cellAdDate, isSaturday: cellAdDate.getDay() === 6 });
  }

  const getMatchingEvent = (cell: any) => {
    const yyyy = cell.adDate.getFullYear();
    const mm = String(cell.adDate.getMonth() + 1).padStart(2, '0');
    const dd = String(cell.adDate.getDate()).padStart(2, '0');
    const adStr = `${yyyy}-${mm}-${dd}`;

    return events.find((e: any) => {
      if (!e) return false;
      if (e.dateAD === adStr) return true;
      if (e.dateBS) {
        const bsStrLower = e.dateBS.toLowerCase();
        const monthNameLower = nepaliMonths[cell.bsMonth - 1]?.toLowerCase();
        const matchMonth = bsStrLower.includes(monthNameLower) || bsStrLower.includes(`-${String(cell.bsMonth).padStart(2, '0')}-`);
        const matchYear = bsStrLower.includes(String(cell.bsYear));
        const matchDay = bsStrLower.endsWith(` ${cell.bsDay}`) || bsStrLower.endsWith(`-${String(cell.bsDay).padStart(2, '0')}`) || bsStrLower.includes(` ${cell.bsDay} `);

        if (matchYear && matchMonth && matchDay) return true;
      }
      return false;
    });
  };

  const selectedAdDate = bsToAd(bsYear, bsMonth, selectedBsDay);
  const selectedBsMonthName = nepaliMonths[bsMonth - 1];
  const monthNamesEng = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const selectedCellObj = { bsDay: selectedBsDay, bsMonth, bsYear, adDate: selectedAdDate };
  const selectedDbEvent = getMatchingEvent(selectedCellObj);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#0F172A',
        borderRadius: '12px',
        padding: '20px 24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase' }}>
            <CalendarIcon size={16} />
            <span>NEPALI BIKRAM SAMBAT (BS) ACADEMIC CALENDAR</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#F8FAFC', margin: '4px 0 0 0' }}>
            Campus Academic Schedule &amp; BS Month Calendar Grid
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPDF}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Download size={15} />
            <span>Download Academic Calendar (PDF)</span>
          </button>

          {canManage && (
            <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: '700', fontSize: '0.8rem' }}>
              Executive Desk: {userRole}
            </span>
          )}
        </div>
      </div>

      {msg.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.88rem',
          fontWeight: '600',
          backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
          color: msg.type === 'error' ? '#F87171' : msg.type === 'success' ? '#34D399' : '#60A5FA',
          border: '1px solid currentColor',
        }}>
          {msg.text}
        </div>
      )}

            <div className={styles.calendarSplitLayout}>
        {/* ─── LEFT COLUMN: CALENDAR GRID ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* FULL BIKRAM SAMBAT MONTH CALENDAR GRID */}
          <div style={{
            backgroundColor: '#0F172A',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            {/* Month Navigation Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#F8FAFC', margin: 0 }}>
                  {bsYear} {selectedBsMonthName} BS
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8', backgroundColor: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: '6px' }}>
                  {monthNamesEng[firstDayAd.getMonth()]} - {monthNamesEng[bsToAd(bsYear, bsMonth, totalDaysInBsMonth).getMonth()]} {bsToAd(bsYear, bsMonth, 1).getFullYear()} AD
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handlePrevBsMonth} style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>
                  ← Prev BS Month
                </button>
                <button onClick={handleNextBsMonth} style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>
                  Next BS Month →
                </button>
              </div>
            </div>

            {/* Scrollable Container for 7-Column BS Calendar Grid */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <div style={{ minWidth: '100%' }}>
                {/* 7-Column Day Header Row (Sunday to Saturday) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px', textAlign: 'center', fontSize: '0.78rem', fontWeight: '800', color: '#64748B' }}>
                  <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div style={{ color: '#F87171' }}>SAT (HOLIDAY)</div>
                </div>

                {/* 42-Cell Full BS Month Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                  {daysGrid.map((cell, idx) => {
                    const isSelected = cell.type === 'current' && cell.bsDay === selectedBsDay;
                    const matchingDbEvent = getMatchingEvent(cell);

                    const isDefaultHoliday = cell.type === 'current' && (cell.bsDay === 5 || cell.bsDay === 20 || cell.bsDay === 21 || cell.bsDay === 25 || cell.bsDay === 27 || cell.bsDay === 28);
                    const isDbHoliday = matchingDbEvent?.type === 'HOLIDAY' || matchingDbEvent?.type === 'EMERGENCY_HOLIDAY' || matchingDbEvent?.isEmergency;
                    const isHoliday = cell.isSaturday || isDefaultHoliday || isDbHoliday;
                    const isExam = cell.type === 'current' && (cell.bsDay >= 12 && cell.bsDay <= 14);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (cell.type === 'current') {
                            setSelectedBsDay(cell.bsDay);
                          }
                        }}
                        style={{
                          minHeight: '78px',
                          backgroundColor: isHoliday ? (isSelected ? 'rgba(239, 68, 68, 0.28)' : 'rgba(239, 68, 68, 0.15)') : (isSelected ? 'rgba(37, 99, 235, 0.3)' : '#1E293B'),
                          border: isSelected ? (isHoliday ? '2px solid #EF4444' : '2px solid #3B82F6') : (isHoliday ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)'),
                          borderRadius: '10px',
                          padding: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          opacity: cell.type !== 'current' ? 0.35 : 1,
                          transition: 'all 0.15s',
                          boxShadow: isSelected ? (isHoliday ? '0 0 14px rgba(239, 68, 68, 0.4)' : '0 0 14px rgba(59, 130, 246, 0.4)') : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '900', color: isHoliday ? '#EF4444' : (isSelected ? '#38BDF8' : '#F8FAFC') }}>
                            {cell.bsDay}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: isHoliday ? '#FCA5A5' : '#64748B', fontWeight: '700' }}>
                            {cell.adDate.getDate()} {monthNamesEng[cell.adDate.getMonth()].slice(0, 3)}
                          </span>
                        </div>

                        <div style={{ marginTop: '4px' }}>
                          {matchingDbEvent ? (
                            <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: matchingDbEvent.isEmergency ? '#DC2626' : '#EF4444', color: '#FFFFFF', padding: '3px 6px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {matchingDbEvent.isEmergency ? 'Emergency' : 'Holiday'}
                            </div>
                          ) : cell.isSaturday ? (
                            <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: 'rgba(239, 68, 68, 0.3)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '2px 6px', borderRadius: '4px', textAlign: 'center' }}>
                              Sat Holiday
                            </div>
                          ) : isDefaultHoliday ? (
                            <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: '#DC2626', color: '#FFFFFF', padding: '3px 6px', borderRadius: '4px', textAlign: 'center' }}>
                              Holiday
                            </div>
                          ) : isExam ? (
                            <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 6px', borderRadius: '4px', textAlign: 'center' }}>
                              Exam Routine
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: SELECTED DATE INFO ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Hero Selected Date Bar */}
          <div style={{
            backgroundColor: '#0F172A',
            borderRadius: '12px',
            padding: '24px 20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#38BDF8', letterSpacing: '-0.02em' }}>
                २०८३ {selectedBsMonthName} {selectedBsDay}
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '16px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F8FAFC' }}>
                  {bsYear} {selectedBsMonthName} {selectedBsDay} BS
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  {monthNamesEng[selectedAdDate.getMonth()]} {selectedAdDate.getDate()}, {selectedAdDate.getFullYear()} AD ({['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedAdDate.getDay()]})
                </div>
              </div>
            </div>

            <div>
              {selectedDbEvent ? (
                <span style={{
                  backgroundColor: selectedDbEvent.isEmergency || selectedDbEvent.type === 'HOLIDAY' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: selectedDbEvent.isEmergency || selectedDbEvent.type === 'HOLIDAY' ? '#F87171' : '#38BDF8',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid currentColor',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  display: 'inline-block'
                }}>
                  {selectedDbEvent.isEmergency ? 'EMERGENCY HOLIDAY: ' : 'HOLIDAY: '} {selectedDbEvent.title}
                </span>
              ) : selectedAdDate.getDay() === 6 ? (
                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '800', fontSize: '0.82rem', display: 'inline-block' }}>
                  Saturday Weekly Holiday — Campus Closed
                </span>
              ) : selectedBsDay === 5 || selectedBsDay === 20 || selectedBsDay === 21 || selectedBsDay === 25 || selectedBsDay === 27 || selectedBsDay === 28 ? (
                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '800', fontSize: '0.82rem', display: 'inline-block' }}>
                  Public Holiday — Campus Closed
                </span>
              ) : selectedBsDay >= 12 && selectedBsDay <= 14 ? (
                <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)', fontWeight: '800', fontSize: '0.82rem', display: 'inline-block' }}>
                  First Term Examination Routine Active
                </span>
              ) : (
                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '800', fontSize: '0.82rem', display: 'inline-block' }}>
                  Campus Operations Active — Regular Class Routine
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forms Section — STRICTLY VISIBLE TO Principal, Vice Principal, and Chairperson ONLY */}
      {canManage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Creation Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setCreateMode('single')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: createMode === 'single' ? '#2563EB' : '#1E293B',
                color: createMode === 'single' ? '#FFFFFF' : '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Plus size={16} />
              <span>Single Event Builder</span>
            </button>
            <button
              onClick={() => setCreateMode('bulk')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: createMode === 'bulk' ? '#8B5CF6' : '#1E293B',
                color: createMode === 'bulk' ? '#FFFFFF' : '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ListPlus size={16} />
              <span>Build Whole Year Academic Calendar (Bulk Multi-Event)</span>
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            
            {/* SINGLE CREATION OR BULK CREATION FORM */}
            {createMode === 'single' ? (
              <div style={{
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} color="#38BDF8" />
                  <span>Add Single Academic Event / Holiday</span>
                </h3>

                <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Event Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Dashain Festival Vacation"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Date (AD)</label>
                      <input
                        type="date"
                        value={dateAD}
                        onChange={e => setDateAD(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Date (BS)</label>
                      <input
                        type="text"
                        placeholder="e.g. 2083 Asar 25"
                        value={dateBS}
                        onChange={e => setDateBS(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Event Type</label>
                      <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
                      >
                        <option value="HOLIDAY">Public Holiday</option>
                        <option value="EXAM">Examination Routine</option>
                        <option value="EVENT">Campus Event / Sports</option>
                        <option value="FEE_DUE">Fee Clearance Deadline</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Description</label>
                      <input
                        type="text"
                        placeholder="Optional notes..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: '6px',
                      padding: '12px',
                      borderRadius: '6px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    {submitting ? 'Adding Event...' : '+ Add to Academic Table'}
                  </button>
                </form>
              </div>
            ) : (
              /* BULK WHOLE YEAR CREATION FORM */
              <div style={{
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                gridColumn: '1 / -1',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#C4B5FD', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ListPlus size={20} />
                      <span>Build &amp; Publish Academic Calendar for Entire Year at Once</span>
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                      Add all festival holidays, exam routines, fee deadlines, and sports events for 2083 BS in one single submission.
                    </p>
                  </div>
                  <button
                    onClick={addBulkRow}
                    style={{ padding: '8px 14px', borderRadius: '6px', backgroundColor: '#8B5CF6', color: '#FFFFFF', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    + Add Event Row
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {bulkRows.map((row, idx) => (
                    <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 1fr 1fr 1.5fr 40px', gap: '8px', alignItems: 'center', backgroundColor: '#1E293B', padding: '8px 12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 'bold' }}>{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder="Event Title (e.g. Tihar)"
                        value={row.title}
                        onChange={e => updateBulkRow(row.id, 'title', e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '0.8rem' }}
                      />
                      <input
                        type="date"
                        value={row.dateAD}
                        onChange={e => updateBulkRow(row.id, 'dateAD', e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Date BS (e.g. 2083 Kartik 20)"
                        value={row.dateBS}
                        onChange={e => updateBulkRow(row.id, 'dateBS', e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '0.8rem' }}
                      />
                      <select
                        value={row.type}
                        onChange={e => updateBulkRow(row.id, 'type', e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '0.8rem' }}
                      >
                        <option value="HOLIDAY">Holiday</option>
                        <option value="EXAM">Exam Routine</option>
                        <option value="EVENT">Sports / Event</option>
                        <option value="FEE_DUE">Fee Clearance</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Description"
                        value={row.description}
                        onChange={e => updateBulkRow(row.id, 'description', e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '0.8rem' }}
                      />
                      <button
                        onClick={() => removeBulkRow(row.id)}
                        disabled={bulkRows.length <= 1}
                        style={{ backgroundColor: 'transparent', color: '#F87171', border: 'none', cursor: 'pointer', opacity: bulkRows.length <= 1 ? 0.3 : 1 }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePublishBulkCalendar}
                  disabled={submittingBulk}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    backgroundColor: '#8B5CF6',
                    color: '#FFFFFF',
                    fontWeight: '900',
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  {submittingBulk ? 'Publishing Calendar...' : `Publish Full Year Academic Calendar (${bulkRows.filter(r => r.title).length} Events)`}
                </button>
              </div>
            )}

            {/* Form 2: Declare Emergency Holiday (Red Highlighted Form) */}
            {createMode === 'single' && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.06)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F87171', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} />
                  <span>Declare Emergency Holiday</span>
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                  Declaring an Emergency Holiday instantly broadcasts an urgent notification notice across all Student, Teacher, Parent, and Staff portals.
                </p>

                <form onSubmit={handleDeclareEmergencyHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#FCA5A5', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Emergency Reason / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Heavy Rainfall Weather Emergency Closure"
                      value={emergTitle}
                      onChange={e => setEmergTitle(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FFFFFF', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#FCA5A5', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Date (AD)</label>
                      <input
                        type="date"
                        value={emergDateAD}
                        onChange={e => setEmergDateAD(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FFFFFF', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#FCA5A5', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Date (BS)</label>
                      <input
                        type="text"
                        placeholder="e.g. 2083 Asar 22"
                        value={emergDateBS}
                        onChange={e => setEmergDateBS(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FFFFFF', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#FCA5A5', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Official Directive / Instructions</label>
                    <textarea
                      rows={2}
                      placeholder="Details for students, staff, and parents..."
                      value={emergReason}
                      onChange={e => setEmergReason(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FFFFFF', outline: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={declaringEmergency}
                    style={{
                      marginTop: '6px',
                      padding: '12px',
                      borderRadius: '6px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
                    }}
                  >
                    <Megaphone size={16} />
                    <span>{declaringEmergency ? 'Broadcasting Notice...' : 'Declare & Broadcast Emergency Holiday'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 7, 13, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#0F172A',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '24px',
            width: 'min(500px, 94vw)',
            color: '#F8FAFC',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="#38BDF8" />
                <span>Edit Academic Event Entry</span>
              </h3>
              <button onClick={() => setEditingEvent(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Event Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Date (AD)</label>
                  <input
                    type="date"
                    value={editDateAD}
                    onChange={e => setEditDateAD(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Date (BS)</label>
                  <input
                    type="text"
                    value={editDateBS}
                    onChange={e => setEditDateBS(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
                  >
                    <option value="HOLIDAY">Public Holiday</option>
                    <option value="EXAM">Examination Routine</option>
                    <option value="EVENT">Campus Event / Sports</option>
                    <option value="FEE_DUE">Fee Clearance Deadline</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Description</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', backgroundColor: '#1E293B', color: '#94A3B8', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  {savingEdit ? 'Saving Correction...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN CONTROLS: Academic Calendar & Holiday Configuration */}
      <div style={{
        backgroundColor: '#0F172A',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC', margin: 0 }}>
            Academic Calendar Events Roster Table
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Total Events: {events.length}</span>
        </div>

        {loading ? (
          <div style={{ color: '#94A3B8', fontSize: '0.88rem', padding: '20px', textAlign: 'center' }}>Loading academic schedule...</div>
        ) : events.length === 0 ? (
          <div style={{ color: '#64748B', fontSize: '0.88rem', padding: '20px', textAlign: 'center' }}>No academic calendar events recorded.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#CBD5E1' }}>
              <thead>
                <tr style={{ backgroundColor: '#1E293B', color: '#94A3B8', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Event Title</th>
                  <th style={{ padding: '10px 14px' }}>Date (BS)</th>
                  <th style={{ padding: '10px 14px' }}>Date (AD)</th>
                  <th style={{ padding: '10px 14px' }}>Type</th>
                  <th style={{ padding: '10px 14px' }}>Created By</th>
                  {canManage && <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#F8FAFC' }}>
                      {ev.title}
                      {ev.description && <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 'normal' }}>{ev.description}</div>}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#60A5FA', fontWeight: '600' }}>{ev.dateBS}</td>
                    <td style={{ padding: '12px 14px' }}>{ev.dateAD}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {ev.isEmergency ? (
                        <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '700', fontSize: '0.75rem' }}>
                          EMERGENCY HOLIDAY
                        </span>
                      ) : ev.type === 'EXAM' ? (
                        <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '3px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '0.75rem' }}>
                          EXAM
                        </span>
                      ) : ev.type === 'FEE_DUE' ? (
                        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '3px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '0.75rem' }}>
                          FEE DUE
                        </span>
                      ) : (
                        <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#CBD5E1', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                          HOLIDAY
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#94A3B8' }}>{ev.createdBy || 'System'}</td>
                    {canManage && (
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openEditModal(ev)}
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}
                            title="Edit Event (Fix Mistake)"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#F87171', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}
                            title="Delete Event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
