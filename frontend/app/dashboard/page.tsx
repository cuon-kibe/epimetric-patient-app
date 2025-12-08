/**
 * ダッシュボードページ
 * 
 * 概要:
 *   ログイン後のメインダッシュボード
 *   血液検査結果の一覧とCSVアップロード機能
 * 
 * 機能:
 *   - 血液検査結果一覧表示
 *   - CSVファイルアップロード
 *   - 検査結果詳細へのリンク
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    getBloodTestResults,
    uploadBloodTestResult,
    BloodTestResult,
} from '@/lib/api/blood-test-results';
import { logout, getCurrentPatient } from '@/lib/api/auth';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [results, setResults] = useState<BloodTestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [patientData, resultsData] = await Promise.all([
                getCurrentPatient(),
                getBloodTestResults(),
            ]);
            setPatient(patientData);
            setResults(resultsData);
        } catch (err: any) {
            setError('データの読み込みに失敗しました');
            if (err.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');
        setSuccessMessage('');

        try {
            await uploadBloodTestResult(file);
            setSuccessMessage('CSVファイルをアップロードしました');
            loadData(); // リストを再読み込み
        } catch (err: any) {
            setError(err.response?.data?.errors?.[0] || 'アップロードに失敗しました');
        } finally {
            setUploading(false);
            // ファイル入力をリセット
            e.target.value = '';
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            患者マイページ
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {patient?.name} さん
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

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* メッセージ表示 */}
                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 rounded-md bg-green-50 p-4">
                        <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                )}

                {/* CSVアップロード */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        血液検査結果のアップロード
                    </h2>
                    <div className="flex items-center gap-4">
                        <label className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                            <span>{uploading ? 'アップロード中...' : 'CSVファイルを選択'}</span>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                        <p className="text-sm text-gray-600">
                            CSVファイルをアップロードして検査結果を登録
                        </p>
                    </div>
                </div>

                {/* 検査結果一覧 */}
                <div className="rounded-lg bg-white shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">検査結果履歴</h2>
                    </div>

                    {results.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                            <p className="text-gray-600">検査結果がありません</p>
                            <p className="mt-2 text-sm text-gray-500">
                                CSVファイルをアップロードして検査結果を登録してください
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {results.map((result) => (
                                <li key={result.id} className="px-6 py-4 hover:bg-gray-50">
                                    <Link href={`/results/${result.id}`} className="block">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    検査日: {format(new Date(result.test_date), 'yyyy年MM月dd日')}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    検査項目数: {result.items_count}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-blue-600 hover:text-blue-800">
                                                    詳細を見る →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}

