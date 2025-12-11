/**
 * 医療センタートップページ
 * 
 * 概要:
 *   /mc にアクセスした場合、ログイン状態に応じてリダイレクト
 *   - 未ログイン → /mc/login
 *   - ログイン済み → /mc/dashboard
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function McPage() {
    const session = await auth();

    // ログイン済みスタッフはダッシュボードへ
    if (session?.user?.userType === 'staff') {
        redirect('/mc/dashboard');
    }

    // 未ログインまたは患者はログインページへ
    redirect('/mc/login');
}

