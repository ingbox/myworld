import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
    // auth로 인증 불러와서 실행해도 돼 토큰 검증이나 이런 것들
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    const response = NextResponse.next();

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const visited = request.cookies.get('today')?.value;

    // 오늘 처음 방문한 경우만
    if (visited !== today) {
        try {
            // 서버에 카운트 증가 요청
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/common/visit`, {
                method: 'POST',
            });
            // 쿠키 설정 (하루 유지)
            response.cookies.set('today', today, {
                path: '/',
                maxAge: 60 * 60 * 24, // 1일
            });
        } catch (err) {
            console.error('방문 통계 쿠키 미들웨어 오류:', err);
        }
    }

    // 메인 화면 > 싸이 화면
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/cy') {
        return NextResponse.redirect(new URL('/cy/home', request.url));
    }

    if (request.nextUrl.pathname === '/admin') {
        return NextResponse.redirect(new URL('/admin/home', request.url));
    }

    if (request.nextUrl.pathname === '/cy/photo') {
        return NextResponse.redirect(new URL('/cy/photo/1', request.url));
    }

    return response;
}
