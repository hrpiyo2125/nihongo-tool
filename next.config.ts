import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://code.tidio.co https://*.tidio.co https://challenges.cloudflare.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://*.tidio.co",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://*.tidio.co",
      "font-src 'self' https://*.tidio.co",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://*.tidio.co https://challenges.cloudflare.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.tidio.co wss://*.tidio.co https://*.sentry.io https://o*.ingest.sentry.io https://challenges.cloudflare.com",
      "media-src https://*.tidio.co",
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

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  disableLogger: true,
  tunnelRoute: "/monitoring",
});
