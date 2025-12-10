/**
 * 医療センターヘッダーコンポーネント
 */

'use client';

import Link from 'next/link';
import { logoutStaff } from '@/app/actions/auth';

interface McHeaderProps {
    staffName: string;
    centerName: string;
}

export function McHeader({ staffName, centerName }: McHeaderProps) {
    return (
        <header className="bg-slate-800 shadow">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/mc/dashboard" className="text-xl font-bold text-white">
                            {centerName}
                        </Link>
                        <p className="text-sm text-slate-300">管理画面</p>
                    </div>
                    <nav className="flex items-center gap-6">
                        <Link href="/mc/dashboard" className="text-sm text-slate-300 hover:text-white">
                            ダッシュボード
                        </Link>
                        <Link href="/mc/patients" className="text-sm text-slate-300 hover:text-white">
                            患者一覧
                        </Link>
                        <Link href="/mc/results" className="text-sm text-slate-300 hover:text-white">
                            検査結果
                        </Link>
                        <Link href="/mc/results/upload" className="text-sm text-slate-300 hover:text-white">
                            アップロード
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-300">{staffName}</span>
                        <form action={logoutStaff}>
                            <button
                                type="submit"
                                className="rounded-md bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-600"
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

