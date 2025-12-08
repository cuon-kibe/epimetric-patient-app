/**
 * 検査結果詳細ページ
 * 
 * 概要:
 *   特定の血液検査結果の詳細を表示
 * 
 * 機能:
 *   - 検査項目と結果値の表示
 *   - 基準値との比較
 *   - ダッシュボードへ戻るリンク
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getBloodTestResult, BloodTestResultDetail } from '@/lib/api/blood-test-results';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ResultDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [result, setResult] = useState<BloodTestResultDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadResult();
    }, [id]);

    const loadResult = async () => {
        try {
            setLoading(true);
            const data = await getBloodTestResult(parseInt(id));
            setResult(data);
        } catch (err: any) {
            setError('検査結果の読み込みに失敗しました');
            if (err.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const isOutOfRange = (value: string, min?: string, max?: string) => {
        if (!min && !max) return false;
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;

        if (min && numValue < parseFloat(min)) return true;
        if (max && numValue > parseFloat(max)) return true;
        return false;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">読み込み中...</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">{error || '検査結果が見つかりません'}</p>
                    <Link
                        href="/dashboard"
                        className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                    >
                        ダッシュボードに戻る
                    </Link>
                </div>
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
                            検査結果詳細
                        </h1>
                        <Link
                            href="/dashboard"
                            className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                        >
                            ← ダッシュボードに戻る
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* 検査情報 */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">検査情報</h2>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">検査日</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {format(new Date(result.test_date), 'yyyy年MM月dd日')}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">登録日時</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {format(new Date(result.created_at), 'yyyy年MM月dd日 HH:mm')}
                            </dd>
                        </div>
                    </dl>
                    {result.notes && (
                        <div className="mt-4">
                            <dt className="text-sm font-medium text-gray-500">備考</dt>
                            <dd className="mt-1 text-sm text-gray-900">{result.notes}</dd>
                        </div>
                    )}
                </div>

                {/* 検査項目一覧 */}
                <div className="rounded-lg bg-white shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">検査項目</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        項目名
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        結果値
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        基準値
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        単位
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {Object.entries(result.test_items).map(([itemName, itemData]) => {
                                    const outOfRange = isOutOfRange(
                                        itemData.value,
                                        itemData.reference_min,
                                        itemData.reference_max
                                    );

                                    return (
                                        <tr key={itemName} className={outOfRange ? 'bg-red-50' : ''}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {itemName}
                                            </td>
                                            <td
                                                className={`whitespace-nowrap px-6 py-4 text-sm ${outOfRange ? 'font-semibold text-red-600' : 'text-gray-900'
                                                    }`}
                                            >
                                                {itemData.value}
                                                {outOfRange && ' ⚠️'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {itemData.reference_min && itemData.reference_max
                                                    ? `${itemData.reference_min} - ${itemData.reference_max}`
                                                    : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {itemData.unit || '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 注意事項 */}
                <div className="mt-6 rounded-lg bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                        ⚠️ 基準値を外れている項目は赤色で表示されます。詳細は医師にご相談ください。
                    </p>
                </div>
            </main>
        </div>
    );
}

