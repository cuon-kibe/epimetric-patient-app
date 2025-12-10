/**
 * Next.js ミドルウェア
 * 
 * 概要:
 *   NextAuth.jsと連携した認証ミドルウェア
 *   保護されたルートへのアクセスを制御
 * 
 * 適用範囲:
 *   - /dashboard: 患者ダッシュボード（要患者認証）
 *   - /results/*: 検査結果詳細（要患者認証）
 *   - /mc/*: 医療センター管理画面（要スタッフ認証）
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userType = req.auth?.user?.userType;

  // 患者用の保護されたパス
  const isPatientProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/results');

  // 医療センター用の保護されたパス
  const isMcProtected =
    pathname.startsWith('/mc/dashboard') ||
    pathname.startsWith('/mc/patients') ||
    pathname.startsWith('/mc/results');

  // 患者用ページへのアクセス制御
  if (isPatientProtected) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userType !== 'patient') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // 医療センター用ページへのアクセス制御
  if (isMcProtected) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/mc/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userType !== 'staff') {
      return NextResponse.redirect(new URL('/mc/login', req.url));
    }
  }

  // ログイン済みユーザーがログインページにアクセスした場合
  if (pathname === '/login' && isLoggedIn && userType === 'patient') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (pathname === '/mc/login' && isLoggedIn && userType === 'staff') {
    return NextResponse.redirect(new URL('/mc/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/results/:path*',
    '/mc/:path*',
    '/login',
  ],
};
