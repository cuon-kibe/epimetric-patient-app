/**
 * Prisma クライアント
 * 
 * 概要:
 *   データベース接続を管理するPrismaクライアントのシングルトンインスタンス
 *   開発環境でのホットリロード時に接続が増殖しないよう管理
 * 
 * 使用例:
 *   import { prisma } from '@/lib/prisma';
 *   const patients = await prisma.patient.findMany();
 * 
 * 適用範囲:
 *   - Server Components
 *   - Server Actions
 *   - API Routes
 *   ※ Client Componentsでは使用不可
 */

import { PrismaClient } from '@prisma/client';

// グローバル変数の型定義
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Prismaクライアントインスタンス
 * 
 * 決定事項:
 *   開発環境ではグローバル変数にキャッシュしてホットリロード時の接続増殖を防止
 * 
 * 理由:
 *   Next.jsの開発モードではファイル変更のたびにモジュールが再読み込みされる
 *   その度に新しいPrismaClientインスタンスが作成されると、DB接続が枯渇する
 */
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    });

// 開発環境ではグローバル変数にキャッシュ
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

