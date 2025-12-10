/**
 * 血液検査結果 API（SSR用）
 * 
 * 概要:
 *   Server Component専用のAPI関数
 *   Service Discovery経由でバックエンドAPIを呼び出し
 * 
 * 注意:
 *   このファイルはServer Componentからのみインポート可能
 *   'use client'コンポーネントからはインポート不可
 */

import { serverFetch } from './server';

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

interface BloodTestResultsResponse {
    blood_test_results: BloodTestResult[];
}

interface BloodTestResultDetailResponse {
    blood_test_result: BloodTestResultDetail;
}

/**
 * 血液検査結果一覧を取得（SSR用）
 */
export async function getBloodTestResultsServer(): Promise<BloodTestResult[]> {
    const data = await serverFetch<BloodTestResultsResponse>('/api/v1/blood_test_results');
    return data.blood_test_results;
}

/**
 * 血液検査結果詳細を取得（SSR用）
 */
export async function getBloodTestResultServer(id: number): Promise<BloodTestResultDetail> {
    const data = await serverFetch<BloodTestResultDetailResponse>(
        `/api/v1/blood_test_results/${id}`
    );
    return data.blood_test_result;
}

