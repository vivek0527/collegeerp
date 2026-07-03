import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify session
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // 2. Parse request JSON containing base64 image data
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // Check base64 pattern
    const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: 'Invalid image format. Please select a valid PNG or JPEG image.' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    
    // Validate image size (limit to 400KB)
    if (imageBuffer.length > 400 * 1024) {
      return NextResponse.json({ error: 'Image is too large. Max size is 400KB.' }, { status: 400 });
    }

    // 3. Write to public/avatar.png
    const targetDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const targetPath = path.join(targetDir, 'avatar.png');
    fs.writeFileSync(targetPath, imageBuffer);

    return NextResponse.json({ 
      success: true, 
      message: 'Profile picture updated successfully' 
    });
  } catch (error: any) {
    console.error('Avatar upload API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
