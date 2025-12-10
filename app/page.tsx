/**
 * トップページ
 * 
 * 概要:
 *   アプリケーションのランディングページ
 *   認証状態に応じてリダイレクト
 * 
 * 動作:
 *   - 認証済み → ダッシュボードへ
 *   - 未認証 → ログインページへ
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    // 認証済み → ダッシュボードへ
    redirect('/dashboard');
  } else {
    // 未認証 → ログインページへ
    redirect('/login');
  }
}
