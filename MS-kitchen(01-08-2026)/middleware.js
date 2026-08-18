import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
    const token = req.cookies.get('auth_token')?.value;
    const pathname = req.nextUrl.pathname;

    // Check for protected routes
    if (pathname.startsWith('/super-admin') || pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
            const { payload } = await jwtVerify(token, secret);

            // Super Admin Route Protection
            if (pathname.startsWith('/super-admin') && payload.role !== 'Super Admin') {
                return NextResponse.redirect(new URL('/login', req.url));
            }
            // Admin Route Protection
            if (pathname.startsWith('/admin') && payload.role !== 'Admin' && payload.role !== 'Super Admin') {
                return NextResponse.redirect(new URL('/login', req.url));
            }
        } catch (error) {
            console.error('Middleware token verification failed:', error);
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // Redirect root to dashboard if logged in
    if (pathname === '/') {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/super-admin/:path*', '/admin/:path*', '/dashboard/:path*', '/profile/:path*', '/'],
};
