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
import AuthInitializer from "@/components/AuthInitializer";
import { DesktopUIProvider } from "@/components/DesktopUIProvider";
import { Suspense } from "react";

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/toolio_icon_circle.png", type: "image/png" },
    ],
  },
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

  return (
    <html lang={locale} className={`${libreBaskerville.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>
            <DesktopUIProvider>
              <AuthProvider>
                <Suspense fallback={null}>
                  <AuthInitializer />
                </Suspense>
                {children}
                <GoogleOneTap />
                <GlobalErrorHandler />
              </AuthProvider>
            </DesktopUIProvider>
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
