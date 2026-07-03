import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth';

// Mapping of roles to their dashboard endpoints
const ROLE_PORTALS: Record<string, string> = {
  STUDENT: '/portal/student',
  PARENT: '/portal/parent',
  TEACHER: '/portal/teacher',
  PRINCIPAL: '/portal/principal',
  VICE_PRINCIPAL: '/portal/vp',
  ACCOUNTS_HEAD: '/portal/accounts-head',
  ACCOUNTS_OFFICER: '/portal/accounts-officer',
  ADMIN: '/portal/admin',
  CHAIRPERSON: '/portal/chairperson',
  HR: '/portal/hr',
  LIBRARIAN: '/portal/librarian',
  EXAM_DEPT: '/portal/exam-dept',
  RECEPTION: '/portal/reception',
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Process portal routes
  if (pathname.startsWith('/portal')) {
    const token = request.cookies.get('auth_token')?.value;

    // Check if token exists
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Verify token validity
    const payload = await verifyJWT(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    const { role } = payload;
    const userDashboard = ROLE_PORTALS[role];

    // If the path is exactly '/portal' or '/portal/', redirect to user's dashboard
    if (pathname === '/portal' || pathname === '/portal/') {
      if (userDashboard) {
        return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    // Verify specific sub-portal access permissions
    let pathRoleMatched = false;
    let isSubPortalRoute = false;

    for (const [r, dashboardPath] of Object.entries(ROLE_PORTALS)) {
      if (pathname.startsWith(dashboardPath)) {
        isSubPortalRoute = true;
        if (role === r) {
          pathRoleMatched = true;
        }
        break;
      }
    }

    // Redirect to correct dashboard if trying to access unauthorized portal routes
    if (isSubPortalRoute && !pathRoleMatched && userDashboard) {
      return NextResponse.redirect(new URL(userDashboard, request.url));
    }
  }

  // 2. Prevent logged in users from seeing login page
  if (pathname === '/login') {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        const userDashboard = ROLE_PORTALS[payload.role];
        if (userDashboard) {
          return NextResponse.redirect(new URL(userDashboard, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

// Intercept only portal dashboard and login pages
export const config = {
  matcher: ['/portal/:path*', '/login'],
};
