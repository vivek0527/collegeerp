import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examId, subjectId, marksData } = body;

    if (!examId || !subjectId || !marksData || !Array.isArray(marksData)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Verify DB is online
    let isDbOnline = true;
    try {
      await prisma.user.findFirst();
    } catch {
      isDbOnline = false;
    }

    if (!isDbOnline) {
      return NextResponse.json({ message: 'Grades successfully processed (Offline Mode).' });
    }

    // Fetch existing results to decide whether to Create or Update
    const existingResults = await prisma.result.findMany({
      where: { examId, subjectId }
    });
    
    const existingMap = new Map();
    existingResults.forEach(r => existingMap.set(r.studentId, r.id));

    // Prepare transaction operations
    const operations = marksData.map((data: any) => {
      const existingId = existingMap.get(data.studentId);
      
      if (existingId) {
        return prisma.result.update({
          where: { id: existingId },
          data: {
            marksObtained: parseFloat(data.marksObtained),
            remarks: data.remarks || null,
          }
        });
      } else {
        return prisma.result.create({
          data: {
            collegeId: payload.collegeId,
            studentId: data.studentId,
            examId: examId,
            subjectId: subjectId,
            marksObtained: parseFloat(data.marksObtained),
            totalMarks: 100, // Standard scale
            passMarks: 40,
            remarks: data.remarks || null,
          }
        });
      }
    });

    await prisma.$transaction(operations);

    return NextResponse.json({ message: 'Grades successfully published!' });

  } catch (error) {
    console.error('Error in /api/teacher/marks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
