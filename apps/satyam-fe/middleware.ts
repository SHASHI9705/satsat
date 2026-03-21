import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal middleware: allow all requests through so client-side OTP handles auth.
export function middleware(req: NextRequest) {
	return NextResponse.next();
}

export const config = {
	matcher: ['/apply/:path*', '/dashboard/:path*'],
};

