import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const mockFilePath = path.join(process.cwd(), 'src/lib/mockAcademicEvents.json');
const mockNoticesPath = path.join(process.cwd(), 'src/lib/mockNotices.json');

function getEvents() {
  try {
    if (fs.existsSync(mockFilePath)) {
      const data = fs.readFileSync(mockFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading mockAcademicEvents.json', e);
  }
  return [];
}

function saveEvents(events: any[]) {
  try {
    fs.writeFileSync(mockFilePath, JSON.stringify(events, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving mockAcademicEvents.json', e);
  }
}

function broadcastEmergencyNotice(title: string, dateBS: string, description: string, author: string) {
  try {
    let notices = [];
    if (fs.existsSync(mockNoticesPath)) {
      notices = JSON.parse(fs.readFileSync(mockNoticesPath, 'utf-8'));
    }
    const newNotice = {
      id: `notice-emerg-${Date.now()}`,
      title: `EMERGENCY HOLIDAY NOTICE: ${title}`,
      content: `Please be informed that an Emergency Holiday has been declared for ${dateBS}. Reason: ${description}. All classes and campus administration will remain closed.`,
      targetRole: 'ALL',
      author: author || 'Principal / Executive Board',
      createdAt: new Date().toISOString().split('T')[0],
      isEmergency: true,
    };
    notices.unshift(newNotice);
    fs.writeFileSync(mockNoticesPath, JSON.stringify(notices, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error broadcasting emergency notice', e);
  }
}

export async function GET() {
  const events = getEvents();
  return NextResponse.json({ success: true, events });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support Bulk Addition (Array of events for whole year)
    if (body.bulkEvents && Array.isArray(body.bulkEvents)) {
      const events = getEvents();
      const newItems: any[] = [];

      for (const item of body.bulkEvents) {
        if (item.title && item.dateAD && item.dateBS) {
          newItems.push({
            id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: item.title,
            dateAD: item.dateAD,
            dateBS: item.dateBS,
            type: item.type || 'HOLIDAY',
            isEmergency: !!item.isEmergency,
            description: item.description || '',
            createdBy: body.createdBy || 'Executive',
            createdAt: new Date().toISOString(),
          });
        }
      }

      events.unshift(...newItems);
      saveEvents(events);
      return NextResponse.json({
        success: true,
        message: `Successfully published ${newItems.length} academic events for the entire year!`,
        count: newItems.length,
      });
    }

    // Single Addition
    const { title, dateAD, dateBS, type, isEmergency, description, createdBy } = body;

    if (!title || !dateAD || !dateBS) {
      return NextResponse.json({ success: false, error: 'Title, Date AD, and Date BS are required' }, { status: 400 });
    }

    const events = getEvents();
    const newEvent = {
      id: `event-${Date.now()}`,
      title,
      dateAD,
      dateBS,
      type: isEmergency ? 'EMERGENCY_HOLIDAY' : (type || 'HOLIDAY'),
      isEmergency: !!isEmergency,
      description: description || '',
      createdBy: createdBy || 'Executive',
      createdAt: new Date().toISOString(),
    };

    events.unshift(newEvent);
    saveEvents(events);

    // If emergency holiday, broadcast high-priority notice immediately
    if (isEmergency) {
      broadcastEmergencyNotice(title, dateBS, description, createdBy);
    }

    return NextResponse.json({ success: true, event: newEvent, message: isEmergency ? 'Emergency holiday declared and notice broadcasted successfully!' : 'Academic calendar event added successfully!' });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to save academic calendar event' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, dateAD, dateBS, type, isEmergency, description } = body;

    if (!id || !title || !dateAD || !dateBS) {
      return NextResponse.json({ success: false, error: 'ID, Title, Date AD, and Date BS are required for edit' }, { status: 400 });
    }

    let events = getEvents();
    const idx = events.findIndex((ev: any) => ev.id === id);

    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Academic calendar event not found' }, { status: 404 });
    }

    events[idx] = {
      ...events[idx],
      title,
      dateAD,
      dateBS,
      type: isEmergency ? 'EMERGENCY_HOLIDAY' : (type || 'HOLIDAY'),
      isEmergency: !!isEmergency,
      description: description || '',
      updatedAt: new Date().toISOString(),
    };

    saveEvents(events);
    return NextResponse.json({ success: true, message: 'Academic calendar event updated successfully!', event: events[idx] });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to edit academic calendar event' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 });
    }

    let events = getEvents();
    events = events.filter((ev: any) => ev.id !== id);
    saveEvents(events);

    return NextResponse.json({ success: true, message: 'Academic calendar event removed.' });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
}
