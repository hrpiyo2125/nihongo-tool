import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const securityHeaders = [
  // クリックジャッキング防止
  { key: 'X-Frame-Options', value: 'DENY' },
  // MIMEスニッフィング防止
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // リファラー情報を制限
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // 権限APIへのアクセスを制限
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // XSS対策・コンテンツソース制限
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
      "font-src 'self'",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
};

export default withNextIntl(nextConfig);
