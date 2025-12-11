/**
 * 患者ログインページ
 * 
 * 概要:
 *   患者のログイン画面
 *   NextAuth.js の Credentials Provider を使用
 * 
 * 機能:
 *   - メールアドレス/パスワードでログイン
 *   - 新規登録ページへのリンク
 *   - ログイン成功後、ダッシュボードへリダイレクト
 */

import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        患者マイページ
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        血液検査結果を確認できます
                    </p>
                </div>

                <LoginForm />

                <div className="text-center text-sm">
                    <Link
                        href="/register"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        アカウントをお持ちでない方は新規登録
                    </Link>
                </div>
            </div>
        </div>
    );
}
