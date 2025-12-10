/**
 * CSVアップローダーコンポーネント
 * 
 * 概要:
 *   血液検査結果のCSVファイルをアップロードするClient Component
 *   Server Action を使用して直接DBに保存
 * 
 * アーキテクチャ:
 *   ブラウザ → Server Action → Prisma → PostgreSQL
 *   ※ Rails APIは経由しない
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPatientBloodTestResult } from '@/app/actions/blood-test';

export function CsvUploader() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData(e.currentTarget);

      // ★ Server Action を呼び出し（直接DBに保存）
      const result = await uploadPatientBloodTestResult(formData);

      if (result.success) {
        setSuccessMessage('CSVファイルをアップロードしました');
        // フォームをリセット
        (e.target as HTMLFormElement).reset();
        // ページをリフレッシュして新しいデータを取得
        router.refresh();
      } else {
        setError(result.error || 'アップロードに失敗しました');
      }
    } catch (err) {
      setError('アップロード中にエラーが発生しました');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        血液検査結果のアップロード
      </h2>

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

      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
          <span>{uploading ? 'アップロード中...' : 'CSVファイルを選択'}</span>
          <input
            type="file"
            name="file"
            accept=".csv"
            required
            disabled={uploading}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                e.target.form?.requestSubmit();
              }
            }}
          />
        </label>
        <p className="text-sm text-gray-600">
          CSVファイルをアップロードして検査結果を登録
        </p>
      </form>
    </div>
  );
}
