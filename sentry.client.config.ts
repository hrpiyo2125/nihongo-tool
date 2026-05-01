import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // パフォーマンス監視: 本番は10%サンプリング、開発は100%
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // セッションリプレイ: エラー発生時のみ記録
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
