/**
 * 医療機関管理画面用APIクライアント
 * 
 * 概要:
 *   Rails API（医療機関用）との通信を行う Axios クライアント
 *   JWT トークンによる認証をサポート
 * 
 * 使用例:
 *   import { mcApiClient } from '@/lib/api/mc/client';
 *   const response = await mcApiClient.get('/api/v1/mc/dashboard');
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

// Axiosインスタンスの作成（医療機関管理画面用）
export const mcApiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// リクエストインターセプター: JWT トークンを自動追加
mcApiClient.interceptors.request.use(
  (config) => {
    // ブラウザ環境でのみCookieからトークンを取得
    if (typeof window !== 'undefined') {
      const token = Cookies.get('mc_auth_token'); // 医療機関用トークン
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
mcApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401エラー（未認証）の場合、ログインページにリダイレクト
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('mc_auth_token');
      window.location.href = '/mc/login';
    }
    return Promise.reject(error);
  }
);

