/**
 * 医療機関ダッシュボード
 * 
 * 概要:
 *   統計情報と最近の活動を表示
 * 
 * 機能:
 *   - 本日・今月・累計の統計
 *   - 最近のCSV取り込み履歴
 *   - 最近登録した検査結果
 */

'use client';

import { useEffect, useState } from 'react';
import { getDashboard, DashboardData } from '@/lib/api/mc/dashboard';
import Link from 'next/link';

export default function McDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboard();
        setData(dashboardData);
      } catch (err) {
        setError('ダッシュボード情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 本日 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">本日</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">CSV取り込み</span>
              <span className="font-bold text-indigo-600">{data.stats.today.uploads}件</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">検査結果登録</span>
              <span className="font-bold text-green-600">{data.stats.today.results}件</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">エラー</span>
              <span className="font-bold text-red-600">{data.stats.today.errors}件</span>
            </div>
          </div>
        </div>

        {/* 今月 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">今月</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">CSV取り込み</span>
              <span className="font-bold text-indigo-600">{data.stats.this_month.uploads}件</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">検査結果登録</span>
              <span className="font-bold text-green-600">{data.stats.this_month.results}件</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">エラー</span>
              <span className="font-bold text-red-600">{data.stats.this_month.errors}件</span>
            </div>
          </div>
        </div>

        {/* 累計 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">累計</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">CSV取り込み</span>
              <span className="font-bold text-indigo-600">{data.stats.total.uploads}件</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">検査結果登録</span>
              <span className="font-bold text-green-600">{data.stats.total.results}件</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">患者数</span>
              <span className="font-bold text-blue-600">{data.stats.total.patients}人</span>
            </div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">クイックアクション</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/mc/results/upload"
            className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            📤 CSV取り込み
          </Link>
          <Link
            href="/mc/results"
            className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            🔬 検査結果を見る
          </Link>
        </div>
      </div>

      {/* 最近のCSV取り込み */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">最近のCSV取り込み</h3>
        {data.recent_uploads.length === 0 ? (
          <p className="text-gray-500 text-center py-4">まだCSV取り込みがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ファイル名</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">件数</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">登録者</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">日時</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recent_uploads.map((upload) => (
                  <tr key={upload.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{upload.file_name}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        upload.status === 'completed' ? 'bg-green-100 text-green-800' :
                        upload.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {upload.status === 'completed' ? '完了' :
                         upload.status === 'failed' ? '失敗' : '処理中'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {upload.success_rows}/{upload.total_rows}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{upload.uploaded_by}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(upload.uploaded_at).toLocaleString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

