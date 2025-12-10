/**
 * SSR用 API クライアント
 * 
 * 概要:
 *   Server Component から Rails API を呼び出すためのクライアント
 *   Next.js の cookies() を使用してサーバーサイドで認証トークンを取得
 * 
 * 使用例:
 *   import { serverFetch, getAuthToken } from '@/lib/api/server';
 *   const data = await serverFetch('/api/v1/blood_test_results');
 * 
 * 制限事項:
 *   - Server Component または Server Action でのみ使用可能
 *   - 'use client' コンポーネントでは使用不可
 * 
 * 適用範囲:
 *   - SSRでのデータ取得（ダッシュボード、検査結果一覧など）
 *   - Service Discovery経由でバックエンドと通信
 */

import { cookies } from 'next/headers';

/**
 * バックエンドAPIのベースURL
 * 
 * 決定事項:
 *   Service Discovery経由でバックエンドにアクセスするため、
 *   Docker/ECS内部のホスト名を使用
 * 
 * 理由:
 *   - SSRはサーバー側で実行されるため、内部ネットワークを使用可能
 *   - 外部に公開されていないバックエンドに直接アクセス
 */
const API_BASE_URL = process.env.API_URL || 'http://backend:3000';

/**
 * 認証トークンを取得
 * 
 * @returns 認証トークン（存在しない場合はnull）
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
}

/**
 * 認証ヘッダーを取得
 * 
 * @returns Authorization ヘッダーオブジェクト
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * SSR用 fetch ラッパー
 * 
 * 概要:
 *   Service Discovery経由でバックエンドAPIを呼び出す
 *   認証トークンを自動的に付与
 * 
 * @param path APIパス（例: '/api/v1/blood_test_results'）
 * @param options fetch オプション
 * @returns レスポンスデータ
 * @throws APIエラー時
 * 
 * 使用例:
 *   const results = await serverFetch<BloodTestResult[]>('/api/v1/blood_test_results');
 */
export async function serverFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}${path}`;
  
  // デバッグログ（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SSR Fetch] ${options.method || 'GET'} ${url}`);
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    // キャッシュ設定（必要に応じて調整）
    cache: options.cache || 'no-store',
  });
  
  if (!response.ok) {
    // エラーレスポンスの詳細をログ出力
    const errorText = await response.text();
    console.error(`[SSR Fetch Error] ${response.status}: ${errorText}`);
    
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 認証状態をチェック（サーバーサイド）
 * 
 * @returns 認証されている場合はtrue
 */
export async function isAuthenticatedServer(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

