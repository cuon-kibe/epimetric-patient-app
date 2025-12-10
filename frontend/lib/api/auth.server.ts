/**
 * 認証 API（SSR用）
 * 
 * 概要:
 *   Server Component専用の認証API関数
 *   Service Discovery経由でバックエンドAPIを呼び出し
 * 
 * 注意:
 *   このファイルはServer Componentからのみインポート可能
 */

import { serverFetch } from './server';

export interface Patient {
    id: number;
    email: string;
    name: string;
    date_of_birth: string | null;
    created_at: string;
}

/**
 * 現在ログイン中の患者情報を取得（SSR用）
 */
export async function getCurrentPatientServer(): Promise<Patient> {
    const data = await serverFetch<{ patient: Patient }>('/api/v1/patients/me');
    return data.patient;
}

