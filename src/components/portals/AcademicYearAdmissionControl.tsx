'use client';

import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Power,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Users,
  Building2,
  SlidersHorizontal,
  FolderPlus,
} from 'lucide-react';

export default function AcademicYearAdmissionControl({ userRole = 'Principal' }: { userRole?: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Unified Form Mode: 'existing' | 'new_session'
  const [sessionMode, setSessionMode] = useState<'existing' | 'new_session'>('existing');

  // Combined Form Inputs
  const [newSessionName, setNewSessionName] = useState('');
  const [newAdYear, setNewAdYear] = useState('');
  const [departmentsList, setDepartmentsList] = useState([
    { deptName: '', deptCode: '', duration: '4 Years / 8 Semesters', maxCapacity: '48' }
  ]);
  const [submittingUnified, setSubmittingUnified] = useState(false);

  // Multi-Filter Search States for Student Management
  const [filterSession, setFilterSession] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'setup' | 'control' | 'roster'>('setup');

  const fetchSessionsAndStudents = async () => {
    setLoading(true);
    try {
      const [sessRes, studRes] = await Promise.all([
        fetch('/api/academic-sessions'),
        fetch('/api/reception/register'),
      ]);
      const sessData = await sessRes.json();
      const studData = await studRes.json();

      if (sessData.success) {
        setSessions(sessData.sessions || []);
        const active = sessData.sessions?.find((s: any) => s.isActive) || sessData.sessions?.[0];
        setActiveSession(active || null);
      }

      if (studData.students) {
        setStudents(studData.students || []);
      }
    } catch (e) {
      console.error('Error fetching academic sessions & student roster', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionsAndStudents();
  }, []);

  // Unified Submit Handler: Creates Session & Offers Department in One Submission
  const handleUnifiedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUnified(true);
    setMsg({ text: '', type: '' });

    try {
      let targetSessionId = activeSession?.id;
      const validDepts = departmentsList.filter(d => d.deptName.trim() && d.deptCode.trim());

      // Step 1: If creating a new academic session
      if (sessionMode === 'new_session') {
        if (!newSessionName) {
          setMsg({ text: 'Session Name (e.g. 2084-2085 BS) is required.', type: 'error' });
          setSubmittingUnified(false);
          return;
        }

        const sessRes = await fetch('/api/academic-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CREATE_SESSION',
            sessionName: newSessionName,
            adYear: newAdYear || '2027-2028 AD',
            departments: validDepts,
          }),
        });

        const sessData = await sessRes.json();
        if (sessData.success) {
          targetSessionId = sessData.session.id;
        } else {
          setMsg({ text: sessData.error || 'Failed to create new academic session', type: 'error' });
          setSubmittingUnified(false);
          return;
        }
      }

      // Step 2: Add Offered Departments & Set Duration to an EXISTING session
      if (sessionMode === 'existing' && validDepts.length > 0) {
        const deptRes = await fetch('/api/academic-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ADD_DEPARTMENTS',
            sessionId: targetSessionId,
            departments: validDepts,
          }),
        });

        const deptData = await deptRes.json();
        if (!deptData.success) {
          setMsg({ text: deptData.error || 'Failed to add departments.', type: 'error' });
          setSubmittingUnified(false);
          return;
        }
      }

      setMsg({ text: 'Academic Session & Departments saved successfully!', type: 'success' });
      setDepartmentsList([{ deptName: '', deptCode: '', duration: '4 Years / 8 Semesters', maxCapacity: '48' }]);
      setNewSessionName('');
      setNewAdYear('');
      fetchSessionsAndStudents();
    } catch (e) {
      setMsg({ text: 'Network error processing unified request', type: 'error' });
    } finally {
      setSubmittingUnified(false);
    }
  };

  // Toggle Department Admission Portal ON / OFF
  const handleToggleDepartmentAdmission = async (deptId: string, currentState: boolean) => {
    if (!activeSession) return;

    try {
      const res = await fetch('/api/academic-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_DEPARTMENT',
          sessionId: activeSession.id,
          deptId,
          isAdmissionOpen: !currentState,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: data.message, type: 'success' });
        fetchSessionsAndStudents();
      } else {
        setMsg({ text: data.error || 'Failed to toggle admission portal state', type: 'error' });
      }
    } catch (e) {
      setMsg({ text: 'Network error updating admission portal state', type: 'error' });
    }
  };

  // Toggle Entire Session Admission Portal ON / OFF
  const handleToggleSessionAdmission = async (currentState: boolean) => {
    if (!activeSession) return;

    try {
      const res = await fetch('/api/academic-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_SESSION',
          sessionId: activeSession.id,
          isAdmissionOpen: !currentState,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: data.message, type: 'success' });
        fetchSessionsAndStudents();
      }
    } catch (e) {
      setMsg({ text: 'Network error toggling session admission', type: 'error' });
    }
  };

  // Multi-Filter Logic for Student Roster
  const filteredStudents = students.filter((s: any) => {
    const sName = (s.user?.name || s.studentName || '').toLowerCase();
    const sEmail = (s.user?.email || s.studentEmail || '').toLowerCase();
    const sRoll = (s.rollNumber || '').toLowerCase();
    const sAdm = (s.admissionNumber || '').toLowerCase();
    const sClass = (s.class?.name || s.className || s.department || '').toLowerCase();
    const sSession = (s.academicYear || s.academicSession || '2083-2084 BS').toLowerCase();

    const query = searchQuery.toLowerCase().trim();
    const matchSearch = !query || sName.includes(query) || sEmail.includes(query) || sRoll.includes(query) || sAdm.includes(query);
    const matchSession = filterSession === 'ALL' || sSession.includes(filterSession.toLowerCase());
    const matchDept = filterDepartment === 'ALL' || sClass.includes(filterDepartment.toLowerCase());

    return matchSearch && matchSession && matchDept;
  });

  const openDeptsCount = activeSession?.departments?.filter((d: any) => d.isAdmissionOpen).length || 0;
  const totalDeptsCount = activeSession?.departments?.length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '22px 26px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase' }}>
            <GraduationCap size={16} />
            <span>EXECUTIVE ADMISSION &amp; ACADEMIC YEAR CONTROL DESK</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A', margin: '4px 0 0 0' }}>
            Academic Session Setup, Course Duration &amp; Admission Control
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {activeSession && (
            <button
              onClick={() => handleToggleSessionAdmission(activeSession.isAdmissionOpen)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.82rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeSession.isAdmissionOpen ? '#DC2626' : '#10B981',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeSession.isAdmissionOpen ? '0 4px 10px rgba(220,38,38,0.3)' : '0 4px 10px rgba(16,185,129,0.3)',
                transition: 'all 0.2s',
              }}
            >
              <Power size={14} />
              <span>{activeSession.isAdmissionOpen ? 'Lock Reception Portal (OFF)' : 'Open Reception Portal (ON)'}</span>
            </button>
          )}
          <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#2563EB', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: '800', fontSize: '0.82rem' }}>
            Authorized Desk: {userRole}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '8px', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('setup')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: activeTab === 'setup' ? '#2563EB' : '#F1F5F9',
            color: activeTab === 'setup' ? '#FFFFFF' : '#475569',
            border: '1px solid',
            borderColor: activeTab === 'setup' ? '#2563EB' : '#E2E8F0',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <FolderPlus size={16} /> Academic Session & Departments
        </button>
        <button
          onClick={() => setActiveTab('control')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: activeTab === 'control' ? '#8B5CF6' : '#F1F5F9',
            color: activeTab === 'control' ? '#FFFFFF' : '#475569',
            border: '1px solid',
            borderColor: activeTab === 'control' ? '#8B5CF6' : '#E2E8F0',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <Power size={16} /> Portal Access Control
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: activeTab === 'roster' ? '#10B981' : '#F1F5F9',
            color: activeTab === 'roster' ? '#FFFFFF' : '#475569',
            border: '1px solid',
            borderColor: activeTab === 'roster' ? '#10B981' : '#E2E8F0',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <Users size={16} /> Student Roster Engine
        </button>
      </div>

      {msg.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.88rem',
          fontWeight: '600',
          backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          color: msg.type === 'error' ? '#F87171' : '#34D399',
          border: '1px solid currentColor',
        }}>
          {msg.text}
        </div>
      )}

      {/* SECTION 1: Session Setup */}
      {activeTab === 'setup' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Metric Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>Active Academic Session</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#38BDF8', marginTop: '4px' }}>
            {activeSession ? activeSession.sessionName : 'Loading...'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>{activeSession?.adYear}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>Department Admission Status</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '900', color: openDeptsCount > 0 ? '#34D399' : '#F87171', marginTop: '4px' }}>
            {openDeptsCount} / {totalDeptsCount} Open
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Interactive Department Toggles</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>Total Managed Students</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', marginTop: '4px' }}>
            {students.length} Registered
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Across All Sessions &amp; Streams</div>
        </div>
      </div>

      {/* COMBINED UNIFIED FORM CONTAINER */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderPlus size={20} color="#38BDF8" />
              <span>Unified Academic Session Setup, Department Offering &amp; Duration Configurator</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#475569', margin: '4px 0 0 0' }}>
              Create a new academic session or select an existing one, offer departments, and define course durations all together in one place.
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', backgroundColor: '#F8FAFC', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            <button
              onClick={() => setSessionMode('existing')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.78rem',
                backgroundColor: sessionMode === 'existing' ? '#2563EB' : 'transparent',
                color: sessionMode === 'existing' ? '#FFFFFF' : '#94A3B8',
              }}
            >
              Configure Active Session
            </button>
            <button
              onClick={() => setSessionMode('new_session')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.78rem',
                backgroundColor: sessionMode === 'new_session' ? '#2563EB' : 'transparent',
                color: sessionMode === 'new_session' ? '#FFFFFF' : '#94A3B8',
              }}
            >
              + Create New Session
            </button>
          </div>
        </div>

        <form onSubmit={handleUnifiedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* SECTION A: Academic Session Configuration */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#38BDF8', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={16} />
              <span>1. Academic Session Details</span>
            </h4>

            {sessionMode === 'new_session' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600', display: 'block', marginBottom: '4px' }}>New Academic Session (BS) *</label>
                  <input
                    type="text"
                    placeholder="e.g. 2084-2085 BS"
                    value={newSessionName}
                    onChange={e => setNewSessionName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Corresponding AD Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2027-2028 AD"
                    value={newAdYear}
                    onChange={e => setNewAdYear(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', outline: 'none' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#475569' }}>Selected Session: </span>
                  <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>{activeSession?.sessionName || 'None'}</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '8px' }}>({activeSession?.adYear})</span>
                </div>
                <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                  ACTIVE SESSION
                </span>
              </div>
            )}
          </div>

          {/* SECTION B: Offered Department & Course Duration Setup */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#34D399', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} />
                <span>2. Offered Departments &amp; Course Duration Definition</span>
              </h4>
              <button
                type="button"
                onClick={() => setDepartmentsList([...departmentsList, { deptName: '', deptCode: '', duration: '4 Years / 8 Semesters', maxCapacity: '48' }])}
                style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#10B981', color: '#FFF', fontSize: '0.75rem', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Another
              </button>
            </div>

            {departmentsList.map((dept, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '10px', position: 'relative' }}>
                {departmentsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newList = [...departmentsList];
                      newList.splice(index, 1);
                      setDepartmentsList(newList);
                    }}
                    style={{ position: 'absolute', right: '-8px', top: '-8px', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <XCircle size={14} />
                  </button>
                )}
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Department / Program Name {index === 0 ? '*' : ''}</label>
                  <input
                    type="text"
                    placeholder="e.g. Civil Engineering"
                    value={dept.deptName}
                    onChange={e => {
                      const newList = [...departmentsList];
                      newList[index].deptName = e.target.value;
                      setDepartmentsList(newList);
                    }}
                    required={index === 0}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Dept Code {index === 0 ? '*' : ''}</label>
                  <input
                    type="text"
                    placeholder="e.g. CIVIL"
                    value={dept.deptCode}
                    onChange={e => {
                      const newList = [...departmentsList];
                      newList[index].deptCode = e.target.value;
                      setDepartmentsList(newList);
                    }}
                    required={index === 0}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Course Duration</label>
                  <select
                    value={dept.duration}
                    onChange={e => {
                      const newList = [...departmentsList];
                      newList[index].duration = e.target.value;
                      setDepartmentsList(newList);
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', outline: 'none' }}
                  >
                    <option value="4 Years / 8 Semesters">4 Years / 8 Semesters</option>
                    <option value="3 Years / 6 Semesters">3 Years / 6 Semesters</option>
                    <option value="2 Years / 4 Semesters">2 Years / 4 Semesters</option>
                    <option value="1 Year / 2 Semesters">1 Year / 2 Semesters</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Max Intake Capacity</label>
                  <input
                    type="number"
                    placeholder="e.g. 48"
                    value={dept.maxCapacity}
                    onChange={e => {
                      const newList = [...departmentsList];
                      newList[index].maxCapacity = e.target.value;
                      setDepartmentsList(newList);
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', outline: 'none' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submittingUnified}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: '900',
              fontSize: '0.92rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            }}
          >
            {submittingUnified ? 'Saving Configuration...' : '+ Save Academic Session, Offer Department & Set Course Duration'}
          </button>
        </form>
      </div>
      </div>
      )}

      {/* SECTION 2: Department-Wise Admission Portal ON / OFF Control Switch Matrix */}
      {activeTab === 'control' && (
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Power size={20} color="#38BDF8" />
              <span>Department-Wise Admission Portal ON / OFF Control Switches</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#475569', margin: '4px 0 0 0' }}>
              Turning OFF a department immediately locks the Front Desk Reception registration portal for that course.
            </p>
          </div>

          {activeSession && (
            <button
              onClick={() => handleToggleSessionAdmission(activeSession.isAdmissionOpen)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.82rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeSession.isAdmissionOpen ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: activeSession.isAdmissionOpen ? '#F87171' : '#34D399',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: 'currentColor',
              }}
            >
              {activeSession.isAdmissionOpen ? 'Turn Entire Session Admission OFF' : 'Turn Entire Session Admission ON'}
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ color: '#475569', fontSize: '0.88rem', padding: '20px', textAlign: 'center' }}>Loading admission portal states...</div>
        ) : !activeSession || !activeSession.departments || activeSession.departments.length === 0 ? (
          <div style={{ color: '#64748B', fontSize: '0.88rem', padding: '20px', textAlign: 'center' }}>No offered departments recorded for this session.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {activeSession.departments.map((dept: any) => (
              <div
                key={dept.id}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '18px',
                  border: '1px solid',
                  borderColor: dept.isAdmissionOpen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                        CODE: {dept.code}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
                        {dept.name}
                      </h4>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: '#475569', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      <span>{dept.duration}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} />
                      <span>Capacity: {dept.maxCapacity || 40} Seats</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '600' }}>Reception Status: </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: dept.isAdmissionOpen ? '#34D399' : '#F87171' }}>
                      {dept.isAdmissionOpen ? 'OPEN FOR ADMISSION' : 'PORTAL LOCKED (OFF)'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleDepartmentAdmission(dept.id, dept.isAdmissionOpen)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: dept.isAdmissionOpen ? '#DC2626' : '#059669',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: dept.isAdmissionOpen ? '0 4px 10px rgba(220,38,38,0.3)' : '0 4px 10px rgba(5,150,105,0.3)',
                    }}
                  >
                    <Power size={14} />
                    <span>{dept.isAdmissionOpen ? 'Turn OFF' : 'Turn ON'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* SECTION 3: Student Management Engine with Multi-Filter Search */}
      {activeTab === 'roster' && (
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#38BDF8" />
              <span>Student Roster Management &amp; Multi-Filter Search Engine</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#475569', margin: '4px 0 0 0' }}>
              Filter and search registered students according to Academic Session and Department.
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#475569' }}>Matching Records: {filteredStudents.length}</span>
        </div>

        {/* Multi-Filter Header Controls Bar */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          alignItems: 'center',
        }}>
          {/* Search Box */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Search Student</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search Name, Roll, Admission No..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 10px 8px 34px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', outline: 'none', fontSize: '0.82rem' }}
              />
            </div>
          </div>

          {/* Filter 1: Academic Session */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Academic Session Filter</label>
            <select
              value={filterSession}
              onChange={e => setFilterSession(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', outline: 'none', fontSize: '0.82rem' }}
            >
              <option value="ALL">All Academic Sessions</option>
              {sessions.map(s => (
                <option key={s.id} value={s.sessionName}>{s.sessionName} ({s.adYear})</option>
              ))}
            </select>
          </div>

          {/* Filter 2: Department Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Department Filter</label>
            <select
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', outline: 'none', fontSize: '0.82rem' }}
            >
              <option value="ALL">All Departments</option>
              <option value="CSIT">Computer Science &amp; IT (BSc CSIT)</option>
              <option value="BBA">Business Administration (BBA)</option>
              <option value="BCA">Computer Applications (BCA)</option>
              <option value="CIVIL">Civil Engineering (BE Civil)</option>
              <option value="BHM">Hotel Management (BHM)</option>
            </select>
          </div>
        </div>

        {/* Filtered Student Table Roster */}
        {filteredStudents.length === 0 ? (
          <div style={{ color: '#64748B', fontSize: '0.88rem', padding: '30px', textAlign: 'center' }}>
            No students match the selected Academic Session and Department filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#334155' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Student Name &amp; Contact</th>
                  <th style={{ padding: '10px 14px' }}>Admission No</th>
                  <th style={{ padding: '10px 14px' }}>Roll No</th>
                  <th style={{ padding: '10px 14px' }}>Department</th>
                  <th style={{ padding: '10px 14px' }}>Academic Session</th>
                  <th style={{ padding: '10px 14px' }}>Shift</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st: any) => {
                  const name = st.user?.name || st.studentName || 'Student';
                  const email = st.user?.email || st.studentEmail || '';
                  const deptName = st.class?.name || st.className || st.department || 'General Stream';
                  const sessionName = st.academicYear || st.academicSession || activeSession?.sessionName || '2083-2084 BS';

                  return (
                    <tr key={st.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '800', color: '#0F172A' }}>{name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#475569' }}>{email}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#60A5FA', fontWeight: '700' }}>{st.admissionNumber || 'ADM-83-001'}</td>
                      <td style={{ padding: '12px 14px' }}>{st.rollNumber || 'R-01'}</td>
                      <td style={{ padding: '12px 14px', color: '#38BDF8', fontWeight: '600' }}>{deptName}</td>
                      <td style={{ padding: '12px 14px', color: '#34D399', fontWeight: '700' }}>{sessionName}</td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>{st.shift || 'Day'}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                          ACTIVE ENROLLED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
