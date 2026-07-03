import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Delete the auth_token cookie
  response.cookies.delete('auth_token');
  
  return response;
}
