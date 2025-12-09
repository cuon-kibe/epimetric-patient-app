/**
 * 検査結果一覧コンポーネント
 * 
 * 概要:
 *   血液検査結果の一覧を表示するServer Component
 *   SSRで事前にデータを取得して表示
 * 
 * 適用範囲:
 *   - ダッシュボードページでの検査結果一覧表示
 */

import Link from 'next/link';
import { format } from 'date-fns';
import { BloodTestResult } from '@/lib/api/blood-test-results.server';

interface ResultsListProps {
    /** 検査結果一覧 */
    results: BloodTestResult[];
}

/**
 * 検査結果一覧コンポーネント
 * 
 * @param props コンポーネントプロパティ
 */
export function ResultsList({ results }: ResultsListProps) {
    return (
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
    );
}

