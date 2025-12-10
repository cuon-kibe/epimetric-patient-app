import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 認証が必要なパスのパターン
 */
const PROTECTED_PATHS = ['/dashboard', '/results'];

/**
 * 医療センター用の保護されたパス
 */
const MC_PROTECTED_PATHS = ['/mc/dashboard', '/mc/patients', '/mc/results'];

/**
 * Next.js ミドルウェア
 * 認証が必要なページへのアクセスを制御
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 患者用の保護されたパスをチェック
  const isPatientProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // 医療センター用の保護されたパスをチェック
  const isMcProtected = MC_PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPatientProtected) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isMcProtected) {
    const mcToken = request.cookies.get('mc_auth_token')?.value;
    if (!mcToken) {
      const loginUrl = new URL('/mc/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
