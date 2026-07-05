import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const mockFilePath = path.join(process.cwd(), 'src/lib/mockAcademicSessions.json');

function getSessions() {
  try {
    if (fs.existsSync(mockFilePath)) {
      const data = fs.readFileSync(mockFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading mockAcademicSessions.json', e);
  }
  return [];
}

function saveSessions(sessions: any[]) {
  try {
    fs.writeFileSync(mockFilePath, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving mockAcademicSessions.json', e);
  }
}

// GET — List all Academic Sessions & Department Admission Toggles
export async function GET() {
  const sessions = getSessions();
  return NextResponse.json({ success: true, sessions });
}

// POST — Create a new Academic Session or add a Department/Course
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, sessionName, adYear, departments: reqDepartments } = body;

    const sessions = getSessions();

    if (action === 'CREATE_SESSION') {
      if (!sessionName) {
        return NextResponse.json({ success: false, error: 'Session Name is required' }, { status: 400 });
      }

      // Mark all other sessions inactive if set as active
      sessions.forEach((s: any) => { s.isActive = false; });

      const newSession = {
        id: `session-${Date.now()}`,
        sessionName,
        adYear: adYear || '2027-2028 AD',
        isActive: true,
        isAdmissionOpen: true,
        createdAt: new Date().toISOString(),
        departments: reqDepartments && Array.isArray(reqDepartments) && reqDepartments.length > 0
          ? reqDepartments.map((d: any, index: number) => ({
              id: `dept-${Date.now()}-${index}`,
              name: d.deptName,
              code: d.deptCode.toUpperCase(),
              duration: d.duration,
              isAdmissionOpen: true,
              maxCapacity: Number(d.maxCapacity) || 40,
              enrolledCount: 0,
            }))
          : [
              { id: `dept-csit-${Date.now()}`, name: 'Computer Science & IT (BSc CSIT)', code: 'CSIT', duration: '4 Years / 8 Semesters', isAdmissionOpen: true, maxCapacity: 48, enrolledCount: 0 },
              { id: `dept-bba-${Date.now()}`, name: 'Business Administration (BBA)', code: 'BBA', duration: '4 Years / 8 Semesters', isAdmissionOpen: true, maxCapacity: 60, enrolledCount: 0 },
              { id: `dept-bca-${Date.now()}`, name: 'Computer Applications (BCA)', code: 'BCA', duration: '4 Years / 8 Semesters', isAdmissionOpen: true, maxCapacity: 40, enrolledCount: 0 },
            ],
      };

      sessions.unshift(newSession);
      saveSessions(sessions);
      return NextResponse.json({ success: true, message: `Academic Session [${sessionName}] created successfully!`, session: newSession });
    }

    if (action === 'ADD_DEPARTMENTS') {
      const { sessionId } = body;
      const session = sessions.find((s: any) => s.id === sessionId);
      if (!session) {
        return NextResponse.json({ success: false, error: 'Academic session not found' }, { status: 404 });
      }

      if (!reqDepartments || !Array.isArray(reqDepartments) || reqDepartments.length === 0) {
        return NextResponse.json({ success: false, error: 'Departments array is required' }, { status: 400 });
      }

      const newDepts = reqDepartments.map((d: any, index: number) => ({
        id: `dept-${Date.now()}-${index}`,
        name: d.deptName,
        code: d.deptCode.toUpperCase(),
        duration: d.duration,
        isAdmissionOpen: true,
        maxCapacity: Number(d.maxCapacity) || 40,
        enrolledCount: 0,
      }));

      session.departments.push(...newDepts);
      saveSessions(sessions);
      return NextResponse.json({ success: true, message: `${newDepts.length} courses added to ${session.sessionName}!`, departments: newDepts });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to process session request' }, { status: 500 });
  }
}

// PUT — Toggle Admission Portal ON/OFF for a Department or whole Session
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, deptId, isAdmissionOpen, action } = body;

    const sessions = getSessions();
    const session = sessions.find((s: any) => s.id === sessionId);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Academic session not found' }, { status: 404 });
    }

    if (action === 'TOGGLE_SESSION') {
      session.isAdmissionOpen = !!isAdmissionOpen;
      saveSessions(sessions);
      return NextResponse.json({
        success: true,
        message: `Academic Session [${session.sessionName}] Admission Portal turned ${isAdmissionOpen ? 'ON' : 'OFF'}.`,
        session,
      });
    }

    if (action === 'TOGGLE_DEPARTMENT') {
      const dept = session.departments.find((d: any) => d.id === deptId);
      if (!dept) {
        return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
      }

      dept.isAdmissionOpen = !!isAdmissionOpen;
      saveSessions(sessions);
      return NextResponse.json({
        success: true,
        message: `Admission Portal for ${dept.name} turned ${isAdmissionOpen ? 'ON' : 'OFF'}.`,
        department: dept,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid update action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update admission portal state' }, { status: 500 });
  }
}
