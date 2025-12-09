/**
 * 検査結果一覧画面
 * 
 * 概要:
 *   登録した検査結果の一覧表示
 * 
 * 機能:
 *   - 検査結果一覧表示
 *   - ページネーション
 */

'use client';

import { useEffect, useState } from 'react';
import { getResults, BloodTestResult } from '@/lib/api/mc/results';

export default function ResultsListPage() {
  const [results, setResults] = useState<BloodTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await getResults(page);
        setResults(data.blood_test_results);
        setPagination(data.pagination);
      } catch (err) {
        setError('検査結果の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [page]);

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          検査結果一覧 ({pagination?.total_count || 0}件)
        </h3>

        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            まだ検査結果が登録されていません
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">メール</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">検査日</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">項目数</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">登録者</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">登録日時</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CSV</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{result.patient.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{result.patient.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.test_date}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.items_count}項目</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{result.registered_by || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(result.registered_at).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {result.csv_file_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ページネーション */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {pagination.total_count}件中 {(page - 1) * pagination.per_page + 1} - {Math.min(page * pagination.per_page, pagination.total_count)}件を表示
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    前へ
                  </button>
                  <span className="px-3 py-1">
                    {page} / {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.total_pages}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    次へ
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

