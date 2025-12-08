/**
 * API クライアント
 * 
 * 概要:
 *   Rails API との通信を行う Axios クライアント
 *   JWT トークンによる認証をサポート
 * 
 * 使用例:
 *   import { apiClient } from '@/lib/api/client';
 *   const response = await apiClient.get('/api/v1/blood_test_results');
 * 
 * 制限事項:
 *   - SSRとCSRで異なるbase URLを使用
 *   - トークンはCookieから自動取得
 */

import axios from 'axios';
import Cookies from 'js-cookie';

// APIのベースURL
// サーバーサイド(SSR)では内部URL、クライアントサイド(CSR)では外部URLを使用
const getBaseURL = () => {
  // サーバーサイドレンダリング時
  if (typeof window === 'undefined') {
    return process.env.API_URL || 'http://backend:3000';
  }
  // クライアントサイドレンダリング時
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

// Axiosインスタンスの作成
export const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// リクエストインターセプター: JWT トークンを自動追加
apiClient.interceptors.request.use(
  (config) => {
    // ブラウザ環境でのみCookieからトークンを取得
    if (typeof window !== 'undefined') {
      const token = Cookies.get('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター: エラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラー時はトークンを削除してログインページにリダイレクト
      if (typeof window !== 'undefined') {
        Cookies.remove('auth_token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

