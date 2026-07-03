import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Local file path for offline/demo mode persistence
const JSON_DB_PATH = path.join(process.cwd(), 'src', 'lib', 'mockStudyMaterials.json');

interface LocalMaterial {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

// Ensure the local JSON DB exists and get content
function getLocalMaterials(): LocalMaterial[] {
  try {
    if (!fs.existsSync(JSON_DB_PATH)) {
      const parentDir = path.dirname(JSON_DB_PATH);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      // Write some initial seed materials
      const initialSeed: LocalMaterial[] = [
        {
          id: 'seed-material-1',
          title: 'Calculus Limits and Continuity Notes',
          description: 'Basic introduction to limit definitions and limit laws with solved examples.',
          fileUrl: '/materials/calculus-limits.pdf',
          subjectId: 'mock-subject-id', // Mathematics
          subjectName: 'Mathematics',
          subjectCode: 'MTH-111',
          teacherId: 'mock-teacher-id', // matches mock-teacher-profile-id
          teacherName: 'Mr. Santosh Dahal',
          createdAt: new Date().toISOString()
        },
        {
          id: 'seed-material-2',
          title: 'Quantum Physics Lecture Slides',
          description: 'Lecture slides covering wave-particle duality and photo-electric effect.',
          fileUrl: '/materials/quantum-intro.pdf',
          subjectId: 'mock-subject-physics',
          subjectName: 'Physics',
          subjectCode: 'PHY-112',
          teacherId: 'mock-teacher-id',
          teacherName: 'Mr. Santosh Dahal',
          createdAt: new Date().toISOString()
        }
      ];
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialSeed, null, 2));
      return initialSeed;
    }
    const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local materials:', err);
    return [];
  }
}

function saveLocalMaterials(materials: LocalMaterial[]) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(materials, null, 2));
  } catch (err) {
    console.error('Error writing local materials:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (payload.role === 'TEACHER') {
      if (isDbOnline) {
        // 1. Fetch teacher profile
        const teacher = await prisma.teacher.findUnique({
          where: { userId: payload.userId },
        });
        if (!teacher) return NextResponse.json({ materials: [] });

        // 2. Fetch materials where the subject has this teacher
        const dbMaterials = await prisma.studyMaterial.findMany({
          where: {
            subject: { teacherId: teacher.id }
          },
          include: {
            subject: true
          }
        });
        return NextResponse.json({ materials: dbMaterials });
      } else {
        // Fallback demo mode
        const local = getLocalMaterials();
        return NextResponse.json({ 
          materials: local.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            fileUrl: m.fileUrl,
            subjectId: m.subjectId,
            createdAt: m.createdAt,
            subject: {
              id: m.subjectId,
              name: m.subjectName,
              code: m.subjectCode
            }
          }))
        });
      }
    }

    if (payload.role === 'STUDENT') {
      if (isDbOnline) {
        // Find student profile and classId
        const student = await prisma.student.findUnique({
          where: { userId: payload.userId },
          select: { classId: true }
        });
        if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });

        // Fetch materials for subjects in student's class
        const dbMaterials = await prisma.studyMaterial.findMany({
          where: {
            subject: { classId: student.classId }
          },
          include: {
            subject: {
              include: {
                teacher: {
                  include: {
                    user: { select: { name: true } }
                  }
                }
              }
            }
          }
        });
        return NextResponse.json({ materials: dbMaterials });
      } else {
        // Fallback demo mode: return all materials matching the mock student's subjects.
        // The mock student is in Grade 11, Science-A, taught by Mr. Santosh Dahal.
        // Therefore, they can see all materials uploaded by Mr. Santosh Dahal.
        const local = getLocalMaterials();
        return NextResponse.json({ 
          materials: local.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            fileUrl: m.fileUrl,
            subjectId: m.subjectId,
            createdAt: m.createdAt,
            subject: {
              id: m.subjectId,
              name: m.subjectName,
              code: m.subjectCode,
              teacher: {
                user: { name: m.teacherName }
              }
            }
          }))
        });
      }
    }

    return NextResponse.json({ error: 'Role access denied' }, { status: 403 });
  } catch (error) {
    console.error('Study materials fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, fileUrl, fileData, fileName, subjectId } = await request.json();
    if (!title || !subjectId) {
      return NextResponse.json({ error: 'Missing title or subject' }, { status: 400 });
    }

    let finalFileUrl = fileUrl || '';

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
          return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const extension = path.extname(fileName) || '.pdf';
        const basename = path.basename(fileName, extension).replace(/[^a-zA-Z0-9]/g, '_');
        const uniqueName = `${basename}-${Date.now()}${extension}`;
        const targetPath = path.join(uploadDir, uniqueName);

        fs.writeFileSync(targetPath, uniqueName === 'avatar.png' ? fileBuffer : fileBuffer); // safe write
        fs.writeFileSync(targetPath, fileBuffer);
        finalFileUrl = `/uploads/${uniqueName}`;
      } catch (err) {
        console.error('File write error:', err);
        return NextResponse.json({ error: 'Failed to write uploaded file.' }, { status: 500 });
      }
    }

    if (!finalFileUrl) {
      return NextResponse.json({ error: 'Please select a file to upload.' }, { status: 400 });
    }

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      // Find teacher profile
      const teacher = await prisma.teacher.findUnique({
        where: { userId: payload.userId },
        select: { id: true, user: { select: { name: true } } }
      });
      if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

      // Verify the subject belongs to the teacher
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, teacherId: teacher.id }
      });
      if (!subject) {
        return NextResponse.json({ error: 'Subject is not assigned to this teacher' }, { status: 403 });
      }

      const newMaterial = await prisma.studyMaterial.create({
        data: {
          title,
          description,
          fileUrl: finalFileUrl,
          subjectId
        },
        include: {
          subject: true
        }
      });
      return NextResponse.json({ success: true, material: newMaterial });
    } else {
      // Local fallback mode
      const local = getLocalMaterials();
      
      // Determine subject name/code from mock subjects
      let subName = 'Mathematics';
      let subCode = 'MTH-111';
      if (subjectId === 'mock-subject-physics') {
        subName = 'Physics';
        subCode = 'PHY-112';
      } else if (subjectId === 'mock-subject-chemistry') {
        subName = 'Chemistry';
        subCode = 'CHM-113';
      }

      const newLocalMat: LocalMaterial = {
        id: `local-${Date.now()}`,
        title,
        description: description || '',
        fileUrl: finalFileUrl,
        subjectId,
        subjectName: subName,
        subjectCode: subCode,
        teacherId: 'mock-teacher-id',
        teacherName: payload.name || 'Mr. Santosh Dahal',
        createdAt: new Date().toISOString()
      };

      local.push(newLocalMat);
      saveLocalMaterials(local);

      return NextResponse.json({ 
        success: true, 
        material: {
          id: newLocalMat.id,
          title: newLocalMat.title,
          description: newLocalMat.description,
          fileUrl: newLocalMat.fileUrl,
          subjectId: newLocalMat.subjectId,
          createdAt: newLocalMat.createdAt,
          subject: {
            id: newLocalMat.subjectId,
            name: newLocalMat.subjectName,
            code: newLocalMat.subjectCode
          }
        } 
      });
    }
  } catch (error) {
    console.error('Study materials save error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing material ID' }, { status: 400 });

    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (isDbOnline) {
      // Find teacher profile
      const teacher = await prisma.teacher.findUnique({
        where: { userId: payload.userId },
        select: { id: true }
      });
      if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

      // Verify the study material subject belongs to this teacher
      const material = await prisma.studyMaterial.findFirst({
        where: { id, subject: { teacherId: teacher.id } }
      });
      if (!material) {
        return NextResponse.json({ error: 'Material not found or access denied' }, { status: 404 });
      }

      await prisma.studyMaterial.delete({
        where: { id }
      });
      return NextResponse.json({ success: true, message: 'Material deleted successfully' });
    } else {
      // Local fallback mode
      const local = getLocalMaterials();
      const filtered = local.filter(m => m.id !== id);
      saveLocalMaterials(filtered);
      return NextResponse.json({ success: true, message: 'Material deleted successfully' });
    }
  } catch (error) {
    console.error('Study materials delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
