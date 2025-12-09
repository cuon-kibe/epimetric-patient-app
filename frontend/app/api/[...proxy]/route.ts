/**
 * Next.js API Route Proxy
 * 
 * 目的:
 *   ブラウザからバックエンドへの直接アクセスを防ぎ、
 *   すべてのAPI呼び出しをNext.js経由にする
 * 
 * ECS Service Discoveryとの対応:
 *   - 本番: フロントエンド → Cloud Map → バックエンド
 *   - 開発: フロントエンド → Docker DNS → バックエンド
 * 
 * 使用例:
 *   ブラウザ: fetch('/api/v1/login', {...})
 *   ↓
 *   Next.js: http://backend:3000/api/v1/login にプロキシ
 */

import { NextRequest, NextResponse } from 'next/server';

// バックエンドのURL（環境変数から取得）
const BACKEND_URL = process.env.BACKEND_API_URL || process.env.API_URL || 'http://backend:3000';

// ログ出力のヘルパー
function log(method: string, path: string, status: number, message?: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API Proxy] ${method} ${path} -> ${status}${message ? ` (${message})` : ''}`);
}

/**
 * すべてのHTTPメソッドを処理する共通ハンドラー
 */
async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> }
): Promise<NextResponse> {
  const method = request.method;

  // Next.js 16: paramsはPromiseなのでawaitでアンラップ
  const params = await context.params;
  const proxyPath = params.proxy;
  const path = proxyPath.join('/');

  // バックエンドのフルURL
  const backendUrl = `${BACKEND_URL}/api/${path}${request.nextUrl.search}`;

  try {
    // リクエストヘッダーをコピー（一部除外）
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // ホスト関連のヘッダーは除外
      // Service Discovery環境では、Hostヘッダーがブロックされる原因になるため除外
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Content-Typeが設定されていない場合はJSONを設定
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    // バックエンドにリクエスト
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // GETとHEAD以外はボディを含める
    if (method !== 'GET' && method !== 'HEAD') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    log(method, path, 0, `Proxying to ${backendUrl}`);

    const response = await fetch(backendUrl, fetchOptions);

    // レスポンスヘッダーをコピー
    const responseHeaders = new Headers(response.headers);

    // 一部のヘッダーは除外（Next.jsが自動設定）
    responseHeaders.delete('connection');
    responseHeaders.delete('keep-alive');
    responseHeaders.delete('transfer-encoding');

    // レスポンスボディを取得
    const responseBody = await response.arrayBuffer();

    log(method, path, response.status, `${responseBody.byteLength} bytes`);

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    log(method, path, 500, `Error: ${error.message}`);

    return NextResponse.json(
      {
        error: 'Backend API connection failed',
        message: error.message,
        backend_url: BACKEND_URL
      },
      { status: 500 }
    );
  }
}

// 各HTTPメソッドのエクスポート
export async function GET(request: NextRequest, context: { params: Promise<{ proxy: string[] }> }) {
  return handleRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ proxy: string[] }> }) {
  return handleRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ proxy: string[] }> }) {
  return handleRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ proxy: string[] }> }) {
  return handleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ proxy: string[] }> }) {
  return handleRequest(request, context);
}

export async function HEAD(request: NextRequest, context: { params: Promise<{ proxy: string[] }> }) {
  return handleRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ proxy: string[] }> }) {
  return handleRequest(request, context);
}
