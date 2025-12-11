/**
 * 医療センタースタッフログインページ
 * 
 * 概要:
 *   医療センタースタッフのログイン画面
 *   NextAuth.js の Credentials Provider を使用
 */

import Link from 'next/link';
import { StaffLoginForm } from './StaffLoginForm';

export default function McLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            医療機関管理画面
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            スタッフ専用ログイン
          </p>
        </div>

        <StaffLoginForm />

        <div className="text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-slate-600 hover:text-slate-500"
          >
            患者ログインはこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
