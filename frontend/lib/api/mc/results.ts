/**
 * 医療機関管理画面 検査結果API
 * 
 * 概要:
 *   検査結果の管理・CSV取り込み
 * 
 * 使用例:
 *   import { uploadCsv, getResults } from '@/lib/api/mc/results';
 */

import { mcApiClient } from './client';

// 検査結果の型定義
export interface BloodTestResult {
  id: number;
  patient: {
    id: number;
    name: string;
    email: string;
  };
  test_date: string;
  items_count: number;
  registered_by: string;
  registered_at: string;
  csv_file_name?: string;
}

// CSV取り込み結果の型定義
export interface CsvUploadResult {
  message: string;
  summary: {
    total_rows: number;
    success_rows: number;
    error_rows: number;
    errors: Array<{
      row: number;
      error: string;
    }>;
  };
  upload_log_id: number;
}

/**
 * CSVファイルをアップロードして検査結果を登録
 * @param file CSVファイル
 * @returns Promise<CsvUploadResult>
 */
export const uploadCsv = async (file: File): Promise<CsvUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await mcApiClient.post<CsvUploadResult>(
    '/api/v1/mc/blood_test_results/upload_csv',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * 検査結果一覧を取得
 * @param page ページ番号
 * @returns Promise<{ results: BloodTestResult[], pagination: any }>
 */
export const getResults = async (page: number = 1) => {
  const response = await mcApiClient.get('/api/v1/mc/blood_test_results', {
    params: { page },
  });
  return response.data;
};

/**
 * CSVテンプレートをダウンロード
 */
export const downloadCsvTemplate = async (): Promise<Blob> => {
  const response = await mcApiClient.get('/api/v1/mc/blood_test_results/template', {
    responseType: 'blob',
  });
  return response.data;
};

