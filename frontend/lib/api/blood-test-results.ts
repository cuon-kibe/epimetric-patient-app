/**
 * 血液検査結果 API（クライアント用）
 * 
 * 概要:
 *   Client Componentで使用するAPI関数
 *   ブラウザからAPI Proxyを経由してバックエンドを呼び出す
 * 
 * 注意:
 *   SSR用の関数は blood-test-results.server.ts を使用
 */

import { apiClient } from './client';

export interface BloodTestResult {
    id: number;
    test_date: string;
    created_at: string;
    items_count: number;
}

export interface BloodTestResultDetail {
    id: number;
    test_date: string;
    test_items: Record<string, TestItemValue>;
    notes: string | null;
    s3_file_key: string | null;
    created_at: string;
    updated_at: string;
}

export interface TestItemValue {
    value: string;
    reference_min?: string;
    reference_max?: string;
    unit?: string;
}

export interface BloodTestResultsResponse {
    blood_test_results: BloodTestResult[];
}

export interface BloodTestResultDetailResponse {
    blood_test_result: BloodTestResultDetail;
}

export interface UploadResponse {
    message: string;
    blood_test_result: BloodTestResult;
}

/**
 * 血液検査結果一覧を取得（CSR用）
 */
export async function getBloodTestResults(params?: {
    start_date?: string;
    end_date?: string;
}): Promise<BloodTestResult[]> {
    const response = await apiClient.get<BloodTestResultsResponse>('/api/v1/blood_test_results', {
        params
    });
    return response.data.blood_test_results;
}

/**
 * 血液検査結果詳細を取得（CSR用）
 */
export async function getBloodTestResult(id: number): Promise<BloodTestResultDetail> {
    const response = await apiClient.get<BloodTestResultDetailResponse>(
        `/api/v1/blood_test_results/${id}`
    );
    return response.data.blood_test_result;
}

/**
 * CSVファイルをアップロード
 */
export async function uploadBloodTestResult(
    file: File,
    testDate?: string
): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (testDate) {
        formData.append('test_date', testDate);
    }

    const response = await apiClient.post<UploadResponse>(
        '/api/v1/blood_test_results/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
}
