/**
 * CSVアップローダーコンポーネント
 * 
 * 概要:
 *   血液検査結果のCSVファイルをアップロードするClient Component
 *   SSRページ内でインタラクティブな機能を提供
 * 
 * 適用範囲:
 *   - ダッシュボードページでのCSVアップロード機能
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadBloodTestResult } from '@/lib/api/blood-test-results';

/**
 * CSVアップローダーコンポーネント
 */
export function CsvUploader() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * ファイルアップロード処理
   * 
   * @param e ファイル選択イベント
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      await uploadBloodTestResult(file);
      setSuccessMessage('CSVファイルをアップロードしました');
      // ページをリフレッシュして新しいデータを取得（SSR再実行）
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'アップロードに失敗しました';
      setError(errorMessage);
    } finally {
      setUploading(false);
      // ファイル入力をリセット
      e.target.value = '';
    }
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        血液検査結果のアップロード
      </h2>
      
      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      {/* 成功メッセージ */}
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}
      
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
  );
}

