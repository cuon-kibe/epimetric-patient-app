/**
 * ダッシュボードヘッダーコンポーネント
 * 
 * 概要:
 *   ダッシュボードのヘッダー部分（ログアウト機能を含む）
 *   NextAuth.jsのsignOutを使用
 */

'use client';

import { logout } from '@/app/actions/auth';

interface DashboardHeaderProps {
  patientName: string;
}

export function DashboardHeader({ patientName }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            患者マイページ
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {patientName} さん
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
