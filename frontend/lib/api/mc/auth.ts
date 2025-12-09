/**
 * 医療機関管理画面 認証API
 * 
 * 概要:
 *   医療機関スタッフのログイン・ログアウト処理
 * 
 * 主な機能:
 *   - ログイン（JWTトークン取得）
 *   - ログアウト（トークン削除）
 *   - ログイン中のスタッフ情報取得
 * 
 * 使用例:
 *   import { mcLogin, mcLogout, getMcCurrentStaff } from '@/lib/api/mc/auth';
 *   const { token, staff } = await mcLogin({ email, password });
 */

import { mcApiClient } from './client';
import Cookies from 'js-cookie';

// ログインパラメータの型定義
export interface McLoginParams {
  email: string;
  password: string;
}

// スタッフ情報の型定義
export interface McStaff {
  id: number;
  email: string;
  name: string;
  role: string;
  medical_center: {
    id: number;
    name: string;
    code: string;
    email: string;
  };
}

// ログインレスポンスの型定義
export interface McLoginResponse {
  token: string;
  staff: McStaff;
}

/**
 * 医療機関スタッフのログイン
 * @param params ログインパラメータ
 * @returns Promise<McLoginResponse>
 */
export const mcLogin = async (params: McLoginParams): Promise<McLoginResponse> => {
  const response = await mcApiClient.post<McLoginResponse>('/api/v1/mc/login', {
    session: params,
  });

  // トークンをCookieに保存（7日間有効）
  Cookies.set('mc_auth_token', response.data.token, { expires: 7 });

  return response.data;
};

/**
 * 医療機関スタッフのログアウト
 */
export const mcLogout = async (): Promise<void> => {
  try {
    await mcApiClient.delete('/api/v1/mc/logout');
  } finally {
    // トークンを削除
    Cookies.remove('mc_auth_token');
  }
};

/**
 * ログイン中のスタッフ情報を取得
 * @returns Promise<McStaff>
 */
export const getMcCurrentStaff = async (): Promise<McStaff> => {
  const response = await mcApiClient.get<{ staff: McStaff }>('/api/v1/mc/me');
  return response.data.staff;
};

/**
 * ログイン済みかチェック
 * @returns boolean
 */
export const isMcLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!Cookies.get('mc_auth_token');
};

