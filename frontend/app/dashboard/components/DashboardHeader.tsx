/**
 * ダッシュボードヘッダーコンポーネント
 * 
 * 概要:
 *   ダッシュボードのヘッダー部分（ログアウト機能を含む）
 *   Client Component（ログアウトのインタラクションが必要なため）
 * 
 * 適用範囲:
 *   - ダッシュボードページのヘッダー
 */

'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api/auth';

interface DashboardHeaderProps {
  /** 患者名 */
  patientName: string;
}

/**
 * ダッシュボードヘッダーコンポーネント
 * 
 * @param props コンポーネントプロパティ
 */
export function DashboardHeader({ patientName }: DashboardHeaderProps) {
  const router = useRouter();

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // エラーが発生してもログインページにリダイレクト
      router.push('/login');
    }
  };

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
            <button
              onClick={handleLogout}
              className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

