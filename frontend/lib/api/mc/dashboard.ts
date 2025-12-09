/**
 * 医療機関管理画面 ダッシュボードAPI
 * 
 * 概要:
 *   ダッシュボードの統計情報を取得
 * 
 * 使用例:
 *   import { getDashboard } from '@/lib/api/mc/dashboard';
 *   const data = await getDashboard();
 */

import { mcApiClient } from './client';

// ダッシュボードデータの型定義
export interface DashboardData {
  stats: {
    today: {
      uploads: number;
      results: number;
      errors: number;
    };
    this_month: {
      uploads: number;
      results: number;
      errors: number;
    };
    total: {
      uploads: number;
      results: number;
      patients: number;
    };
  };
  recent_uploads: Array<{
    id: number;
    file_name: string;
    status: string;
    total_rows: number;
    success_rows: number;
    error_rows: number;
    uploaded_by: string;
    uploaded_at: string;
  }>;
  recent_results: Array<{
    id: number;
    patient_name: string;
    test_date: string;
    items_count: number;
    registered_by: string;
    registered_at: string;
  }>;
}

/**
 * ダッシュボード情報を取得
 * @returns Promise<DashboardData>
 */
export const getDashboard = async (): Promise<DashboardData> => {
  const response = await mcApiClient.get<{ dashboard: DashboardData }>('/api/v1/mc/dashboard');
  return response.data.dashboard;
};

