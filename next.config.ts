import type { NextConfig } from "next";

/**
 * Next.js 設定ファイル
 *
 * 概要:
 *   Next.jsアプリケーションの設定を定義
 *
 * 主な仕様:
 *   - output: "standalone" - Docker/ECSデプロイ用に最適化されたビルド出力
 *   - 環境変数は .env.local または環境変数で設定
 */
const nextConfig: NextConfig = {
  // Docker/ECS/Vercelデプロイ用にstandalone出力を有効化
  output: "standalone",
};

export default nextConfig;
