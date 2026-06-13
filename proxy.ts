import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
    // auth로 인증 불러와서 실행해도 돼 토큰 검증이나 이런 것들

    // 메인 화면 > 싸이 화면
    if(request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/cy') {
        return NextResponse.redirect(new URL('/cy/home', request.url));
    }

    if(request.nextUrl.pathname === '/admin') {
        return NextResponse.redirect(new URL('/admin/home', request.url));
    }

    if(request.nextUrl.pathname === '/cy/photo') {
        return NextResponse.redirect(new URL('/cy/photo/1', request.url));
    }

    return NextResponse.next(); 
}
