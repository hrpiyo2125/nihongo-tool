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
      "style-src 'self' 'unsafe-inline' https://*.tidio.co https://accounts.google.com",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://*.tidio.co",
      "font-src 'self' https://*.tidio.co",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://*.tidio.co https://challenges.cloudflare.com https://accounts.google.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.tidio.co wss://*.tidio.co https://*.sentry.io https://o*.ingest.sentry.io https://challenges.cloudflare.com https://accounts.google.com",
      "media-src https://*.tidio.co",
    ].join('; '),
  },
]

const CONTENT_IDS = ['hiragana','katakana','kanji','joshi','kaiwa','season','food','animal','body','color','number','adjective','verb','conjunction','grammar','familiar','kotoba','vegefruit','myself'];
const METHOD_IDS = ['drill','test','card','nurie','roleplay','bingo','interview','presentation','sentence','essay','check','sugoroku','poster'];

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      ...CONTENT_IDS.flatMap((cat) => [
        { source: `/${cat}`, destination: `/?content=${cat}&method=all`, permanent: true },
        { source: `/en/${cat}`, destination: `/en?content=${cat}&method=all`, permanent: true },
      ]),
      ...METHOD_IDS.flatMap((cat) => [
        { source: `/${cat}`, destination: `/?content=all&method=${cat}`, permanent: true },
        { source: `/en/${cat}`, destination: `/en?content=all&method=${cat}`, permanent: true },
      ]),
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/liff',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.line-scdn.net https://*.line.me",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.line-scdn.net https://*.line.me",
              "font-src 'self'",
              "frame-src https://*.line.me https://*.line-scdn.net",
              "connect-src 'self' https://*.line.me https://*.line-scdn.net https://api.line.me wss://*.line.me",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  disableLogger: true,
  tunnelRoute: "/monitoring",
});
