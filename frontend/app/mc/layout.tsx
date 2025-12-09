/**
 * 医療機関管理画面 共通レイアウト
 * 
 * 概要:
 *   MC管理画面の共通レイアウトとナビゲーション
 * 
 * 機能:
 *   - 認証チェック（ログインページ以外）
 *   - サイドバーナビゲーション
 *   - ヘッダー（医療機関名、ログアウト）
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { isMcLoggedIn, mcLogout, getMcCurrentStaff, McStaff } from '@/lib/api/mc/auth';

export default function McLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [staff, setStaff] = useState<McStaff | null>(null);
  const [loading, setLoading] = useState(true);

  // ログインページかどうか
  const isLoginPage = pathname === '/mc/login';

  useEffect(() => {
    // ログインページの場合は認証チェック不要
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // 認証チェック
    if (!isMcLoggedIn()) {
      router.push('/mc/login');
      return;
    }

    // スタッフ情報を取得
    const fetchStaff = async () => {
      try {
        const data = await getMcCurrentStaff();
        setStaff(data);
      } catch (error) {
        router.push('/mc/login');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    await mcLogout();
    router.push('/mc/login');
  };

  // ログインページはそのまま表示
  if (isLoginPage) {
    return <>{children}</>;
  }

  // ローディング中
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  // 認証済みの場合、レイアウトを表示
  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <div className="w-64 bg-indigo-900 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">医療機関管理</h1>
          <p className="text-sm text-indigo-300 mt-1">{staff?.medical_center.name}</p>
        </div>
        <nav className="mt-8">
          <Link
            href="/mc/dashboard"
            className={`block px-4 py-3 hover:bg-indigo-800 ${
              pathname === '/mc/dashboard' ? 'bg-indigo-800' : ''
            }`}
          >
            📊 ダッシュボード
          </Link>
          <Link
            href="/mc/results/upload"
            className={`block px-4 py-3 hover:bg-indigo-800 ${
              pathname === '/mc/results/upload' ? 'bg-indigo-800' : ''
            }`}
          >
            📤 CSV取り込み
          </Link>
          <Link
            href="/mc/results"
            className={`block px-4 py-3 hover:bg-indigo-800 ${
              pathname === '/mc/results' ? 'bg-indigo-800' : ''
            }`}
          >
            🔬 検査結果一覧
          </Link>
          <Link
            href="/mc/patients"
            className={`block px-4 py-3 hover:bg-indigo-800 ${
              pathname === '/mc/patients' ? 'bg-indigo-800' : ''
            }`}
          >
            👤 患者検索
          </Link>
        </nav>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {pathname === '/mc/dashboard' && 'ダッシュボード'}
              {pathname === '/mc/results/upload' && 'CSV取り込み'}
              {pathname === '/mc/results' && '検査結果一覧'}
              {pathname === '/mc/patients' && '患者検索'}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {staff?.name} ({staff?.role === 'admin' ? '管理者' : 'スタッフ'})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                ログアウト
              </button>
            </div>
          </div>
        </header>

        {/* コンテンツエリア */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

