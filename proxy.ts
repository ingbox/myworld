import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // API 제외
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // GET만 집계
    if (request.method !== 'GET') {
        return NextResponse.next();
    }

    // HTML 요청만 집계
    const accept = request.headers.get('accept') ?? '';
    if (!accept.includes('text/html')) {
        return NextResponse.next();
    }

    // 봇 제외
    const ua = request.headers.get('user-agent') ?? '';
    const isBot =
        /bot|crawler|spider|bingpreview|facebookexternalhit|slurp|curl|wget|python|axios|headless/i.test(
            ua
        );

    if (isBot) {
        return NextResponse.next();
    }

    let response = NextResponse.next();

    // 리다이렉트
    if (pathname === '/' || pathname === '/cy') {
        response = NextResponse.redirect(new URL('/cy/home', request.url));
    } else if (pathname === '/admin') {
        response = NextResponse.redirect(new URL('/admin/home', request.url));
    } else if (pathname === '/cy/photo') {
        response = NextResponse.redirect(new URL('/cy/photo/1', request.url));
    }

    const today = new Date().toISOString().slice(0, 10);
    const visited = request.cookies.get('today')?.value;

    if (visited !== today) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/common/visit`, {
            method: 'POST',
        });

        response.cookies.set('today', today, {
            path: '/',
            maxAge: 60 * 60 * 24,
        });
    }

    return response;
}