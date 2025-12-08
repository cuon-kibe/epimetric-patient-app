/**
 * 認証 API
 * 
 * 概要:
 *   ログイン、ログアウト、患者登録機能を提供
 * 
 * 主な機能:
 *   - ログイン: POST /api/v1/login
 *   - ログアウト: DELETE /api/v1/logout
 *   - 患者登録: POST /api/v1/patients
 *   - 現在の患者情報取得: GET /api/v1/patients/me
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
 * 
 * @param params ログインパラメータ
 * @returns 認証トークンと患者情報
 */
export const login = async (params: LoginParams): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/v1/login', params);
  
  // トークンをCookieに保存
  if (response.data.token) {
    Cookies.set('auth_token', response.data.token, { expires: 1 }); // 1日間有効
  }
  
  return response.data;
};

/**
 * ログアウト
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.delete('/api/v1/logout');
  } finally {
    // トークンを削除
    Cookies.remove('auth_token');
  }
};

/**
 * 患者登録
 * 
 * @param params 登録パラメータ
 * @returns 認証トークンと患者情報
 */
export const register = async (params: RegisterParams): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/v1/patients', {
    patient: params
  });
  
  // トークンをCookieに保存
  if (response.data.token) {
    Cookies.set('auth_token', response.data.token, { expires: 1 }); // 1日間有効
  }
  
  return response.data;
};

/**
 * 現在ログイン中の患者情報を取得
 * 
 * @returns 患者情報
 */
export const getCurrentPatient = async (): Promise<Patient> => {
  const response = await apiClient.get<{ patient: Patient }>('/api/v1/patients/me');
  return response.data.patient;
};

/**
 * 認証状態をチェック
 * 
 * @returns 認証されている場合はtrue
 */
export const isAuthenticated = (): boolean => {
  return typeof window !== 'undefined' && !!Cookies.get('auth_token');
};

