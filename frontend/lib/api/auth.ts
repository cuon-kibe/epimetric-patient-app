/**
 * 認証 API（クライアント用）
 * 
 * 概要:
 *   Client Componentで使用する認証API関数
 *   ブラウザからAPI Proxyを経由してバックエンドを呼び出す
 * 
 * 注意:
 *   SSR用の関数は auth.server.ts を使用
 */

import { apiClient } from './client';
import Cookies from 'js-cookie';

export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams {
    email: string;
    password: string;
    password_confirmation: string;
    name: string;
    date_of_birth?: string;
}

export interface Patient {
    id: number;
    email: string;
    name: string;
    date_of_birth: string | null;
    created_at: string;
}

export interface AuthResponse {
    token: string;
    patient: Patient;
}

/**
 * ログイン
 */
export async function login(params: LoginParams): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/login', params);

    if (response.data.token) {
        Cookies.set('auth_token', response.data.token, { expires: 1 });
    }

    return response.data;
}

/**
 * ログアウト
 */
export async function logout(): Promise<void> {
    try {
        await apiClient.delete('/api/v1/logout');
    } finally {
        Cookies.remove('auth_token');
    }
}

/**
 * 患者登録
 */
export async function register(params: RegisterParams): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/patients', {
        patient: params
    });

    if (response.data.token) {
        Cookies.set('auth_token', response.data.token, { expires: 1 });
    }

    return response.data;
}

/**
 * 現在ログイン中の患者情報を取得（CSR用）
 */
export async function getCurrentPatient(): Promise<Patient> {
    const response = await apiClient.get<{ patient: Patient }>('/api/v1/patients/me');
    return response.data.patient;
}

/**
 * 認証状態をチェック
 */
export function isAuthenticated(): boolean {
    return typeof window !== 'undefined' && !!Cookies.get('auth_token');
}
