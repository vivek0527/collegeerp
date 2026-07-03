import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Local file path for offline/demo mode persistence
const NOTICES_JSON_PATH = path.join(process.cwd(), 'src', 'lib', 'mockNotices.json');

interface LocalNotice {
  id: string;
  collegeId: string;
  title: string;
  content: string;
  targetAudience: string;
  attachmentUrl?: string;
  createdById: string;
  createdBy: {
    name: string;
    role: string;
  };
  createdAt: string;
}

// Get or seed local notices
function getLocalNotices(collegeId: string): LocalNotice[] {
  try {
    if (!fs.existsSync(NOTICES_JSON_PATH)) {
      const parentDir = path.dirname(NOTICES_JSON_PATH);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      const initialSeed: LocalNotice[] = [
        {
          id: 'notice-seed-1',
          collegeId: collegeId || 'mock-college-id',
          title: 'Campus Annual Sports Meet 2083',
          content: 'Registration for the annual sports meet is now open. Events include Football, Basketball, Table Tennis, and Athletics. Contact the Sports Coordinator to sign up.',
          targetAudience: 'ALL',
          createdById: 'mock-principal-id',
          createdBy: {
            name: 'Dr. Ram Prasad Adhikari',
            role: 'PRINCIPAL'
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        },
        {
          id: 'notice-seed-2',
          collegeId: collegeId || 'mock-college-id',
          title: 'Faculty Academic Review Meeting',
          content: 'All teachers and department heads are requested to attend the third terminal academic review meeting in the Main Conference Hall this Friday at 3:00 PM.',
          targetAudience: 'TEACHERS',
          createdById: 'mock-vp-id',
          createdBy: {
            name: 'Prof. Shyam K. Karki',
            role: 'VICE_PRINCIPAL'
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          id: 'notice-seed-3',
          collegeId: collegeId || 'mock-college-id',
          title: 'Terminal Examination Guidelines & Regulations',
          content: 'Please find attached the official exam regulations, sit arrangements, code of conduct, and timing schedule for the upcoming terminal evaluations.',
          targetAudience: 'STUDENTS',
          attachmentUrl: '/uploads/exam-conduct-guidelines.pdf',
          createdById: 'mock-principal-id',
          createdBy: {
            name: 'Dr. Ram Prasad Adhikari',
            role: 'PRINCIPAL'
          },
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        }
      ];
      fs.writeFileSync(NOTICES_JSON_PATH, JSON.stringify(initialSeed, null, 2));
      return initialSeed;
    }
    const data = fs.readFileSync(NOTICES_JSON_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local notices:', err);
    return [];
  }
}

function saveLocalNotices(notices: LocalNotice[]) {
  try {
    fs.writeFileSync(NOTICES_JSON_PATH, JSON.stringify(notices, null, 2));
  } catch (err) {
    console.error('Error saving local notices:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Filter notices based on role
    let audienceFilter = ['ALL'];
    if (payload.role === 'STUDENT') {
      audienceFilter.push('STUDENTS');
    } else if (payload.role === 'PARENT') {
      audienceFilter.push('PARENTS', 'STUDENTS');
    } else if (payload.role === 'TEACHER') {
      audienceFilter.push('TEACHERS');
    } else {
      // Management roles (Principal, VP, Admin, accounts, etc.) see everything
      audienceFilter.push('STUDENTS', 'PARENTS', 'TEACHERS', 'MANAGEMENT');
    }

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      const dbNotices = await prisma.notice.findMany({
        where: {
          collegeId: payload.collegeId,
          targetAudience: {
            in: audienceFilter,
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { name: true, role: true },
          },
        },
      });
      return NextResponse.json({ notices: dbNotices });
    } else {
      // Fallback local mode
      const local = getLocalNotices(payload.collegeId);
      // Filter list based on audience
      const filtered = local
        .filter(n => audienceFilter.includes(n.targetAudience))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json({ notices: filtered });
    }
  } catch (error) {
    console.error('Notices GET error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Restrict posting notices to authorized roles
    const allowedRoles = ['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'EXAM_DEPT', 'ACCOUNTS_HEAD', 'HR', 'TEACHER'];
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, content, targetAudience, fileData, fileName } = await request.json();

    if (!title || !content || !targetAudience) {
      return NextResponse.json({ error: 'Missing title, content, or targetAudience' }, { status: 400 });
    }

    let attachmentUrl = '';

    // Handle device file upload if present
    if (fileData && fileName) {
      try {
        const matches = fileData.match(/^data:(.+);base64,(.+)$/);
        let fileBuffer: Buffer;
        if (matches && matches.length === 3) {
          fileBuffer = Buffer.from(matches[2], 'base64');
        } else {
          fileBuffer = Buffer.from(fileData, 'base64');
        }

        // Limit size to 5MB
        if (fileBuffer.length > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'Attachment file must be less than 5MB' }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const extension = path.extname(fileName) || '.pdf';
        const basename = path.basename(fileName, extension).replace(/[^a-zA-Z0-9]/g, '_');
        const uniqueName = `notice_${basename}-${Date.now()}${extension}`;
        const targetPath = path.join(uploadDir, uniqueName);

        fs.writeFileSync(targetPath, fileBuffer);
        attachmentUrl = `/uploads/${uniqueName}`;
      } catch (err) {
        console.error('Notice file write error:', err);
        return NextResponse.json({ error: 'Failed to write attached file.' }, { status: 500 });
      }
    }

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      const newNotice = await prisma.notice.create({
        data: {
          collegeId: payload.collegeId,
          title,
          content,
          targetAudience,
          attachmentUrl,
          createdById: payload.userId,
        },
      });

      // Write audit log
      await prisma.auditLog.create({
        data: {
          collegeId: payload.collegeId,
          userId: payload.userId,
          action: 'CREATE_NOTICE',
          details: `Published notice: "${title}" targeted at ${targetAudience}`,
        },
      });

      return NextResponse.json({ success: true, notice: newNotice });
    } else {
      // Local fallback mode
      const local = getLocalNotices(payload.collegeId);
      const newLocal: LocalNotice = {
        id: `notice-local-${Date.now()}`,
        collegeId: payload.collegeId,
        title,
        content,
        targetAudience,
        attachmentUrl: attachmentUrl || undefined,
        createdById: payload.userId,
        createdBy: {
          name: payload.name || 'Management Office',
          role: payload.role
        },
        createdAt: new Date().toISOString()
      };

      local.push(newLocal);
      saveLocalNotices(local);

      return NextResponse.json({ success: true, notice: newLocal });
    }
  } catch (error) {
    console.error('Notice creation error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(payload.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing notice ID' }, { status: 400 });

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      await prisma.notice.delete({
        where: { id }
      });
      return NextResponse.json({ success: true, message: 'Notice deleted successfully' });
    } else {
      // Local fallback mode
      const local = getLocalNotices(payload.collegeId);
      const filtered = local.filter(n => n.id !== id);
      saveLocalNotices(filtered);
      return NextResponse.json({ success: true, message: 'Notice deleted successfully' });
    }
  } catch (error) {
    console.error('Notice delete error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
