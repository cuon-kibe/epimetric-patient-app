/**
 * ヘルスチェックAPI
 * 
 * 概要:
 *   Next.jsアプリケーションのヘルスチェックエンドポイント
 *   ECSのヘルスチェックで使用
 */

import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
}

