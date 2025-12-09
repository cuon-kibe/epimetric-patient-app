/**
 * CSV取り込み画面
 * 
 * 概要:
 *   CSVファイルをアップロードして検査結果を一括登録
 * 
 * 機能:
 *   - CSVファイルのドラッグ&ドロップ
 *   - CSVテンプレートダウンロード
 *   - アップロード進捗表示
 *   - エラー表示
 */

'use client';

import { useState } from 'react';
import { uploadCsv, downloadCsvTemplate } from '@/lib/api/mc/results';

export default function CsvUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setResult(null);
      setError('');
    } else {
      setError('CSVファイルのみアップロード可能です');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const uploadResult = await uploadCsv(file);
      setResult(uploadResult);
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadCsvTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('テンプレートのダウンロードに失敗しました');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* テンプレートダウンロード */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📥 CSVテンプレート</h3>
        <p className="text-sm text-blue-800 mb-3">
          まずテンプレートをダウンロードして、フォーマットを確認してください
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          テンプレートをダウンロード
        </button>
      </div>

      {/* ファイルアップロード */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">CSVファイルをアップロード</h3>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors"
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-file-input"
          />
          <label htmlFor="csv-file-input" className="cursor-pointer">
            <div className="space-y-2">
              <div className="text-4xl">📁</div>
              <p className="text-gray-600">
                クリックしてファイルを選択、またはドラッグ&ドロップ
              </p>
              <p className="text-sm text-gray-500">CSV形式のみ対応</p>
            </div>
          </label>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              選択されたファイル: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </p>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* アップロード結果 */}
      {result && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">アップロード結果</h3>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">総行数:</span>
              <span className="font-bold">{result.summary.total_rows}行</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">成功:</span>
              <span className="font-bold text-green-600">{result.summary.success_rows}行</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">エラー:</span>
              <span className="font-bold text-red-600">{result.summary.error_rows}行</span>
            </div>
          </div>

          {result.summary.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">エラー詳細:</h4>
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">行</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">エラー</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.summary.errors.map((err: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{err.row}</td>
                        <td className="px-4 py-2 text-sm text-red-600">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              別のファイルをアップロード
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

