'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  X,
  Megaphone,
} from 'lucide-react';
import { adToBs, bsToAd, nepaliYears, nepaliMonths } from '../../lib/dateConverter';

interface AcademicCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export default function AcademicCalendarModal({ isOpen, onClose, userRole = 'Principal' }: AcademicCalendarModalProps) {
  // Bikram Sambat Calendar Month & Year states
  const [bsYear, setBsYear] = useState(2083);
  const [bsMonth, setBsMonth] = useState(3); // 3 = Asar (1-indexed)
  const [selectedBsDay, setSelectedBsDay] = useState(21);
  const [activeTab, setActiveTab] = useState<'month' | 'agenda' | 'emergency'>('month');
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Emergency Form State
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
        setDbEvents(data.events || []);
      }
    } catch (e) {
      console.error('Failed to fetch events', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
  const firstDayIndex = firstDayAd.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Previous BS Month info for overflow
  const prevBsMonth = bsMonth === 1 ? 12 : bsMonth - 1;
  const prevBsYear = bsMonth === 1 ? bsYear - 1 : bsYear;
  const prevDaysCount = (nepaliYears[prevBsYear] || nepaliYears[2083]).days[prevBsMonth - 1];

  const daysGrid: any[] = [];

  // 1. Previous BS month overflow days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevDaysCount - i;
    const cellAdDate = bsToAd(prevBsYear, prevBsMonth, dayNum);
    daysGrid.push({
      bsDay: dayNum,
      bsMonth: prevBsMonth,
      bsYear: prevBsYear,
      type: 'prev',
      adDate: cellAdDate,
      isSaturday: cellAdDate.getDay() === 6,
    });
  }

  // 2. Current BS month days starting strictly from BS Day 1
  for (let d = 1; d <= totalDaysInBsMonth; d++) {
    const cellAdDate = bsToAd(bsYear, bsMonth, d);
    daysGrid.push({
      bsDay: d,
      bsMonth: bsMonth,
      bsYear: bsYear,
      type: 'current',
      adDate: cellAdDate,
      isSaturday: cellAdDate.getDay() === 6,
    });
  }

  // 3. Trailing next BS month overflow days (up to 42 cells)
  const remainingSlots = 42 - daysGrid.length;
  const nextBsMonth = bsMonth === 12 ? 1 : bsMonth + 1;
  const nextBsYear = bsMonth === 12 ? bsYear + 1 : bsYear;
  for (let d = 1; d <= remainingSlots; d++) {
    const cellAdDate = bsToAd(nextBsYear, nextBsMonth, d);
    daysGrid.push({
      bsDay: d,
      bsMonth: nextBsMonth,
      bsYear: nextBsYear,
      type: 'next',
      adDate: cellAdDate,
      isSaturday: cellAdDate.getDay() === 6,
    });
  }

  // Robust Event Matcher function
  const getMatchingEvent = (cell: any) => {
    const yyyy = cell.adDate.getFullYear();
    const mm = String(cell.adDate.getMonth() + 1).padStart(2, '0');
    const dd = String(cell.adDate.getDate()).padStart(2, '0');
    const adStr = `${yyyy}-${mm}-${dd}`;

    return dbEvents.find((e: any) => {
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

  // Selected date info
  const selectedAdDate = bsToAd(bsYear, bsMonth, selectedBsDay);
  const selectedBsMonthName = nepaliMonths[bsMonth - 1];
  const monthNamesEng = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const selectedCellObj = { bsDay: selectedBsDay, bsMonth, bsYear, adDate: selectedAdDate };
  const selectedDbEvent = getMatchingEvent(selectedCellObj);

  const handleDeclareEmergencyHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergTitle || !emergDateAD || !emergDateBS || !emergReason) {
      setMsg({ text: 'Please fill in all Emergency Holiday fields.', type: 'error' });
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
        setMsg({ text: 'Emergency Holiday Declared and Urgent Notice Broadcasted.', type: 'success' });
        setEmergTitle('');
        setEmergDateAD('');
        setEmergDateBS('');
        setEmergReason('');
        fetchEvents();
      }
    } catch (e) {
      setMsg({ text: 'Network error declaring emergency holiday.', type: 'error' });
    } finally {
      setDeclaringEmergency(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 13, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#0F172A',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        width: 'min(1000px, 96vw)',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden',
        color: '#F8FAFC',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#090D16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              color: '#60A5FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(37, 99, 235, 0.4)',
              flexShrink: 0,
            }}>
              <CalendarIcon size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC', lineHeight: '1.2' }}>
                Academic Calendar Workspace
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Bikram Sambat (BS) Calendar Engine • {userRole} Access
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* View Switcher Tabs */}
            <div style={{
              backgroundColor: '#1E293B',
              borderRadius: '8px',
              padding: '3px',
              display: 'flex',
              gap: '2px',
            }}>
              {[
                { id: 'month', label: 'Month View' },
                { id: 'agenda', label: 'Event Agenda' },
                { id: 'emergency', label: 'Emergency Holiday' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === tab.id ? '#2563EB' : 'transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : '#94A3B8',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Selected Date Summary Hero Bar */}
        <div style={{
          backgroundColor: '#1E293B',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#38BDF8', letterSpacing: '-0.02em' }}>
              २०८३ {selectedBsMonthName} {selectedBsDay}
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC' }}>
                {bsYear} {selectedBsMonthName} {selectedBsDay} BS
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                {monthNamesEng[selectedAdDate.getMonth()]} {selectedAdDate.getDate()}, {selectedAdDate.getFullYear()} AD ({['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedAdDate.getDay()]})
              </div>
            </div>
          </div>

          <div style={{ maxWidth: '100%' }}>
            {selectedDbEvent ? (
              <span style={{
                backgroundColor: selectedDbEvent.isEmergency || selectedDbEvent.type === 'HOLIDAY' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                color: selectedDbEvent.isEmergency || selectedDbEvent.type === 'HOLIDAY' ? '#F87171' : '#38BDF8',
                padding: '5px 12px',
                borderRadius: '6px',
                border: '1px solid currentColor',
                fontWeight: '800',
                fontSize: '0.78rem',
                display: 'inline-block',
                lineHeight: '1.3',
              }}>
                {selectedDbEvent.isEmergency ? 'EMERGENCY HOLIDAY: ' : 'HOLIDAY: '} {selectedDbEvent.title}
              </span>
            ) : selectedAdDate.getDay() === 6 ? (
              <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '800', fontSize: '0.78rem', display: 'inline-block', lineHeight: '1.3' }}>
                Saturday Weekly Holiday — Campus Closed
              </span>
            ) : selectedBsDay === 5 || selectedBsDay === 20 || selectedBsDay === 21 || selectedBsDay === 25 || selectedBsDay === 27 || selectedBsDay === 28 ? (
              <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '800', fontSize: '0.78rem', display: 'inline-block', lineHeight: '1.3' }}>
                Public Holiday — Campus Closed
              </span>
            ) : selectedBsDay >= 12 && selectedBsDay <= 14 ? (
              <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.4)', fontWeight: '800', fontSize: '0.78rem', display: 'inline-block', lineHeight: '1.3' }}>
                First Term Examination Routine Active
              </span>
            ) : (
              <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '800', fontSize: '0.78rem', display: 'inline-block', lineHeight: '1.3' }}>
                Campus Operations Active — Regular Class Routine
              </span>
            )}
          </div>
        </div>

        {/* Modal Main Body Viewports */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {msg.text && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.84rem',
              fontWeight: '700',
              backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: msg.type === 'error' ? '#F87171' : '#34D399',
              border: '1px solid currentColor',
            }}>
              {msg.text}
            </div>
          )}

          {/* TAB 1: FULL MONTH GRID */}
          {activeTab === 'month' && (
            <div>
              {/* Controls bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#F8FAFC', margin: 0 }}>
                    {bsYear} {selectedBsMonthName} BS
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8', backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                    {monthNamesEng[firstDayAd.getMonth()]} - {monthNamesEng[bsToAd(bsYear, bsMonth, totalDaysInBsMonth).getMonth()]} {bsToAd(bsYear, bsMonth, 1).getFullYear()} AD
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={handlePrevBsMonth} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem' }}>
                    ← Prev BS Month
                  </button>
                  <button onClick={handleNextBsMonth} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem' }}>
                    Next BS Month →
                  </button>
                </div>
              </div>

              {/* Scrollable Container for Calendar Grid */}
              <div style={{ overflowX: 'auto', width: '100%', paddingBottom: '8px' }}>
                <div style={{ minWidth: '600px' }}>
                  {/* 7-Column Day Header Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>
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
                            minHeight: '74px',
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
                            {/* Large BS Day Number strictly in RED if holiday */}
                            <span style={{ fontSize: '1.2rem', fontWeight: '900', color: isHoliday ? '#EF4444' : (isSelected ? '#38BDF8' : '#F8FAFC') }}>
                              {cell.bsDay}
                            </span>
                            {/* Small AD Day Number */}
                            <span style={{ fontSize: '0.65rem', color: isHoliday ? '#FCA5A5' : '#64748B', fontWeight: '700' }}>
                              {cell.adDate.getDate()} {monthNamesEng[cell.adDate.getMonth()].slice(0, 3)}
                            </span>
                          </div>

                          {/* Event Badge Pills inside Day Box */}
                          <div style={{ marginTop: '4px' }}>
                            {matchingDbEvent ? (
                              <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: matchingDbEvent.isEmergency ? '#DC2626' : '#EF4444', color: '#FFFFFF', padding: '3px 6px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {matchingDbEvent.isEmergency ? 'Emergency' : 'Holiday'}
                              </div>
                            ) : cell.isSaturday ? (
                              <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: 'rgba(239, 68, 68, 0.3)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '2px 5px', borderRadius: '4px', textAlign: 'center' }}>
                                Sat Holiday
                              </div>
                            ) : isDefaultHoliday ? (
                              <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: '#DC2626', color: '#FFFFFF', padding: '3px 6px', borderRadius: '4px', textAlign: 'center' }}>
                                Holiday
                              </div>
                            ) : isExam ? (
                              <div style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 5px', borderRadius: '4px', textAlign: 'center' }}>
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
          )}

          {/* TAB 2: EVENT AGENDA LIST */}
          {activeTab === 'agenda' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', margin: '0 0 8px 0' }}>
                Upcoming Campus Events &amp; Holidays Agenda
              </h3>

              {dbEvents.length === 0 ? (
                <div style={{ color: '#64748B', fontSize: '0.85rem', padding: '20px', textAlign: 'center' }}>No dynamic events recorded.</div>
              ) : (
                dbEvents.map(ev => (
                  <div key={ev.id} style={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#F8FAFC' }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                        {ev.description}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38BDF8' }}>{ev.dateBS}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{ev.dateAD}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: EMERGENCY HOLIDAY DESK */}
          {activeTab === 'emergency' && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#F87171', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={20} />
                <span>Executive Emergency Holiday Declaration</span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '16px' }}>
                Authorized tool for Principal, VP, or Chairperson to instantly declare campus closures and broadcast high-priority notices.
              </p>

              <form onSubmit={handleDeclareEmergencyHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#FCA5A5', display: 'block', marginBottom: '4px' }}>Emergency Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Heavy Rain Weather Emergency Campus Closure"
                    value={emergTitle}
                    onChange={e => setEmergTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0F172A', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FFFFFF', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#FCA5A5', display: 'block', marginBottom: '4px' }}>Date (AD)</label>
                    <input
                      type="date"
                      value={emergDateAD}
                      onChange={e => setEmergDateAD(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0F172A', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FFFFFF', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#FCA5A5', display: 'block', marginBottom: '4px' }}>Date (BS)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2083 Asar 22"
                      value={emergDateBS}
                      onChange={e => setEmergDateBS(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0F172A', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FFFFFF', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#FCA5A5', display: 'block', marginBottom: '4px' }}>Directive Details / Reason</label>
                  <textarea
                    rows={2}
                    placeholder="Provide instructions for students, teachers, and parents..."
                    value={emergReason}
                    onChange={e => setEmergReason(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0F172A', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FFFFFF', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={declaringEmergency}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.5)',
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
    </div>
  );
}
