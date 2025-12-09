/**
 * ダッシュボードページ（SSR版）
 * 
 * 概要:
 *   ログイン後のメインダッシュボード
 *   血液検査結果の一覧とCSVアップロード機能
 * 
 * SSR構成:
 *   - Server Component: ページ本体、検査結果一覧
 *   - Client Component: ヘッダー（ログアウト）、CSVアップロード
 * 
 * データ取得:
 *   - Service Discovery経由でバックエンドAPIを呼び出し
 *   - サーバーサイドでデータを取得してHTMLを生成
 *   - ブラウザには完成したHTMLを返す（API呼び出し不要）
 * 
 * 決定事項:
 *   CSR版からSSR版に変更
 *   理由: 初期表示の高速化、SEO向上、Service Discovery活用
 * 
 * 適用範囲:
 *   認証済みユーザーのみアクセス可能（middleware.tsで制御）
 */

import { redirect } from 'next/navigation';
import { getCurrentPatientServer } from '@/lib/api/auth.server';
import { getBloodTestResultsServer } from '@/lib/api/blood-test-results.server';
import { DashboardHeader } from './components/DashboardHeader';
import { CsvUploader } from './components/CsvUploader';
import { ResultsList } from './components/ResultsList';

/**
 * ダッシュボードページ（Server Component）
 * 
 * 処理フロー:
 *   1. サーバーサイドで患者情報と検査結果を取得
 *   2. データをHTMLに埋め込んで返却
 *   3. ブラウザは完成したHTMLを受け取る（追加API不要）
 */
export default async function DashboardPage() {
    try {
        // サーバーサイドでデータを取得（Service Discovery経由）
        // ★ これがSSRの核心：ブラウザではなくサーバーでAPIを呼ぶ
        const [patient, results] = await Promise.all([
            getCurrentPatientServer(),
            getBloodTestResultsServer(),
        ]);

        return (
            <div className="min-h-screen bg-gray-50">
                {/* ヘッダー（Client Component: ログアウト機能） */}
                <DashboardHeader patientName={patient.name} />

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* CSVアップロード（Client Component: ファイル選択機能） */}
                    <CsvUploader />

                    {/* 検査結果一覧（Server Component: 静的表示） */}
                    <ResultsList results={results} />
                </main>
            </div>
        );
    } catch (error) {
        // 認証エラーまたはAPI エラーの場合はログインページにリダイレクト
        console.error('[Dashboard SSR Error]', error);
        redirect('/login');
    }
}
