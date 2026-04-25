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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://client.crisp.chat",
      "style-src 'self' 'unsafe-inline' https://client.crisp.chat",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://client.crisp.chat https://image.crisp.chat",
      "font-src 'self' https://client.crisp.chat",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://game.crisp.chat",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://client.crisp.chat wss://client.crisp.chat https://*.crisp.chat wss://*.crisp.chat",
      "media-src https://client.crisp.chat",
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
