/**
 * NextAuth.js API Route
 * 
 * 概要:
 *   NextAuth.jsの認証エンドポイント
 *   /api/auth/* へのリクエストを処理
 * 
 * エンドポイント:
 *   - GET/POST /api/auth/signin - サインイン
 *   - GET/POST /api/auth/signout - サインアウト
 *   - GET /api/auth/session - セッション取得
 *   - GET /api/auth/csrf - CSRFトークン取得
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;

