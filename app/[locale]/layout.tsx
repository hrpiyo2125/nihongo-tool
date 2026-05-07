import type { Metadata } from "next";
import { siteConfig } from "@/lib/site.config";
import { Libre_Baskerville } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ChatWidgetLoader from "@/components/ChatWidgetLoader";
import DeployWatcher from "@/components/DeployWatcher";
import GoogleOneTap from "@/components/GoogleOneTap";
import { AuthProvider } from './AuthContext';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";
import { createClient as createServerClient } from '@/lib/supabase-server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  // サーバーサイドで認証状態・プロフィール・ユーザーデータを取得
  let initialUser = null;
  let initialProfile = null;
  let initialUserData = null;

  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      initialUser = {
        id: user.id,
        email: user.email ?? '',
        user_metadata: user.user_metadata ?? {},
        identities: user.identities ?? [],
      };

      const service = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const profileRes = await service.from('profiles').select('*').eq('id', user.id).single();

      if (profileRes.data && profileRes.data.status !== 'deleted') {
        initialProfile = profileRes.data;
      }
    }
  } catch {
    // サーバー取得失敗時はクライアントサイドにフォールバック
  }

  return (
   <html lang={locale} className={`${libreBaskerville.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>
            <AuthProvider
              initialUser={initialUser}
              initialProfile={initialProfile}
              initialUserData={initialUserData}
            >
              {children}
              <GoogleOneTap />
              <GlobalErrorHandler />
            </AuthProvider>
          </ErrorBoundary>
          <ChatWidgetLoader />
          <DeployWatcher />
          <Analytics />
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
