/**
 * ダッシュボードページ（SSR + Next.js フルスタック）
 * 
 * 概要:
 *   ログイン後のメインダッシュボード
 *   Server Component でデータを直接DBから取得
 * 
 * アーキテクチャ:
 *   - データ取得: Prisma経由で直接PostgreSQLに接続
 *   - 認証: NextAuth.jsのセッション
 *   - Railsは不要（Next.jsフルスタック構成）
 * 
 * 決定事項:
 *   Service Discovery + Rails API 構成から、
 *   Next.js フルスタック構成に変更
 * 
 * 理由:
 *   - アーキテクチャのシンプル化
 *   - TypeScriptで統一
 *   - Rails/Ruby の依存を削除
 */

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DashboardHeader } from './components/DashboardHeader';
import { CsvUploader } from './components/CsvUploader';
import { ResultsList } from './components/ResultsList';

export default async function DashboardPage() {
    // セッションを取得（NextAuth.js）
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // ★ 直接DBからデータを取得（Prisma経由）
    // Rails APIを経由せず、PostgreSQLに直接接続
    const [patient, results] = await Promise.all([
        // 患者情報を取得
        prisma.patient.findUnique({
            where: { id: parseInt(session.user.id) },
            select: { id: true, name: true, email: true },
        }),
        // 検査結果一覧を取得
        prisma.bloodTestResult.findMany({
            where: { patientId: parseInt(session.user.id) },
            orderBy: { testDate: 'desc' },
            select: {
                id: true,
                testDate: true,
                testItems: true,
                createdAt: true,
            },
        }),
    ]);

    if (!patient) {
        redirect('/login');
    }

    // 検査結果に項目数を追加
    const resultsWithCount = results.map(result => ({
        id: result.id,
        testDate: result.testDate,
        createdAt: result.createdAt,
        itemsCount: Object.keys(result.testItems as object).length,
    }));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー（Client Component: ログアウト機能） */}
            <DashboardHeader patientName={patient.name} />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* CSVアップロード（Client Component） */}
                <CsvUploader />

                {/* 検査結果一覧（Server Component） */}
                <ResultsList results={resultsWithCount} />
            </main>
        </div>
    );
}
