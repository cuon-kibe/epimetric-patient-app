/**
 * API プロキシルート（Service Discovery シミュレーション用）
 * 
 * 概要:
 *   ブラウザからのAPI呼び出しをバックエンドにプロキシする
 *   ECS Service Discoveryと同じ動作をシミュレート
 * 
 * 動作:
 *   GET  /api/v1/patients     → backend:3000/api/v1/patients
 *   POST /api/v1/login        → backend:3000/api/v1/login
 *   すべてのAPI呼び出しをバックエンドに転送
 * 
 * 使用例:
 *   // フロントエンドから
 *   fetch('/api/v1/patients', {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 * 
 * 制限事項:
 *   - Service Discovery環境でのみ使用
 *   - 通常の開発環境では直接バックエンドにアクセス
 */

import { NextRequest, NextResponse } from 'next/server';

// バックエンドAPIのベースURL
const BACKEND_URL = process.env.BACKEND_API_URL || process.env.API_URL || 'http://backend:3000';

/**
 * すべてのHTTPメソッドを処理
 * バックエンドAPIへプロキシする
 */
async function handleRequest(request: NextRequest, method: string) {
  try {
    // リクエストパスからプロキシ部分を取得
    const url = new URL(request.url);
    const proxyPath = url.pathname.replace('/api/', '/api/');
    
    // バックエンドへのリクエストURL構築
    const backendUrl = `${BACKEND_URL}${proxyPath}${url.search}`;
    
    console.log(`[API Proxy] ${method} ${proxyPath} -> ${backendUrl}`);
    
    // リクエストヘッダーをコピー（認証情報を含む）
    const headers: HeadersInit = {};
    request.headers.forEach((value, key) => {
      // Host, Connectionなどのヘッダーは転送しない
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });
    
    // リクエストボディを取得
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const text = await request.text();
        if (text) {
          body = text;
        }
      } catch (e) {
        console.error('[API Proxy] Error reading request body:', e);
      }
    }
    
    // バックエンドにリクエスト転送
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
      // クッキーを転送
      credentials: 'include',
    });
    
    // レスポンスヘッダーをコピー
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    
    // CORS ヘッダーを追加
    responseHeaders.set('Access-Control-Allow-Origin', url.origin);
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    
    // レスポンスボディを取得
    const responseBody = await response.text();
    
    console.log(`[API Proxy] Response: ${response.status} ${response.statusText}`);
    
    // レスポンスを返す
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        backend_url: BACKEND_URL 
      },
      { status: 502 }
    );
  }
}

// HTTPメソッドごとのハンドラー
export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

export async function OPTIONS(request: NextRequest) {
  // プリフライトリクエストへの対応
  const url = new URL(request.url);
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': url.origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

