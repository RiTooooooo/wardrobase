import type { NextConfig } from "next";

/**
 * セキュリティヘッダー。
 *
 * 画像はブラウザが S3 互換ストレージ（presigned URL）と直接やり取りするため、
 * img-src（表示）と connect-src（アップロード PUT）に S3 のオリジンを許可する。
 * オリジンは環境変数 S3_ENDPOINT から導出し、環境差（MinIO / Supabase）を吸収する。
 */

function s3Origin(): string {
  const endpoint = process.env.S3_ENDPOINT;

  if (endpoint === undefined || endpoint === "") return "";

  return new URL(endpoint).origin;
}

function contentSecurityPolicy(): string {
  const s3 = s3Origin();
  // Next.js は起動用のインラインスクリプトを挿入するため unsafe-inline が要る。
  // 開発時はさらに eval（React Fast Refresh）と ws（HMR）を許可する。
  const isDev = process.env.NODE_ENV === "development";

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: ${s3}`.trimEnd(),
    `connect-src 'self' ${s3}${isDev ? " ws:" : ""}`.replace(/\s+/g, " ").trimEnd(),
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  return directives.join("; ");
}

const nextConfig: NextConfig = {
  headers() {
    return Promise.resolve([
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          // HTTPS 強制（2年）。http のローカル開発ではブラウザが無視する
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]);
  },
};

export default nextConfig;
