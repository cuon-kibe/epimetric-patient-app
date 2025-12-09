/**
 * 患者検索画面
 * 
 * 概要:
 *   患者を検索して情報を確認
 * 
 * 機能:
 *   - メールアドレスで検索
 *   - 氏名で検索
 *   - 患者一覧表示
 */

'use client';

import { useState } from 'react';
import { mcApiClient } from '@/lib/api/mc/client';

interface Patient {
  id: number;
  name: string;
  email: string;
  date_of_birth: string;
  total_results: number;
  latest_test_date: string | null;
  registered_by_us: number;
}

export default function PatientsSearchPage() {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchName, setSearchName] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await mcApiClient.get('/api/v1/mc/patients', {
        params: {
          email: searchEmail || undefined,
          name: searchName || undefined,
        },
      });
      setPatients(response.data.patients);
    } catch (err) {
      setError('患者の検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 検索フォーム */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">患者検索</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              氏名
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="山田"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || (!searchEmail && !searchName)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '検索中...' : '検索'}
        </button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* 検索結果 */}
      {searched && !loading && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            検索結果 ({patients.length}件)
          </h3>

          {patients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              該当する患者が見つかりませんでした
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">氏名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">メールアドレス</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">生年月日</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">検査結果数</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">当院登録数</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">最終検査日</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{patient.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{patient.date_of_birth}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{patient.total_results}件</td>
                      <td className="px-4 py-3 text-sm text-indigo-600 font-semibold">
                        {patient.registered_by_us}件
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {patient.latest_test_date || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

