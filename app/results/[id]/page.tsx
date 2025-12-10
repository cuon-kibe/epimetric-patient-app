/**
 * 検査結果詳細ページ（SSR + Prisma）
 * 
 * 概要:
 *   特定の血液検査結果の詳細を表示
 *   Server Componentで直接DBからデータを取得
 * 
 * 機能:
 *   - 検査項目と結果値の表示
 *   - 基準値との比較
 *   - ダッシュボードへ戻るリンク
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface TestItemValue {
    value: string;
    unit?: string;
    reference_min?: string;
    reference_max?: string;
}

interface ResultDetailPageProps {
    params: Promise<{ id: string }>;
}

/**
 * 基準値の範囲外かどうかをチェック
 */
function isOutOfRange(value: string, min?: string, max?: string): boolean {
    if (!min && !max) return false;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;

    if (min && numValue < parseFloat(min)) return true;
    if (max && numValue > parseFloat(max)) return true;
    return false;
}

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
    const { id } = await params;

    // セッションを取得
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    // 直接DBからデータを取得
    const result = await prisma.bloodTestResult.findFirst({
        where: {
            id: parseInt(id),
            patientId: parseInt(session.user.id),
        },
    });

    if (!result) {
        notFound();
    }

    const testItems = result.testItems as Record<string, TestItemValue>;

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
                                {format(new Date(result.testDate), 'yyyy年MM月dd日')}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">登録日時</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {format(new Date(result.createdAt), 'yyyy年MM月dd日 HH:mm')}
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
                                {Object.entries(testItems).map(([itemName, itemData]) => {
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
