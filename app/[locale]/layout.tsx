import type { Metadata } from "next";
import { Libre_Baskerville, Josefin_Sans } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ChatWidgetLoader from "@/components/ChatWidgetLoader";



const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre",
  display: "swap",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "にほんごツール | 日本語教育の教材・ツールが見つかるサービス",
  description: "日本語教師のための教材・ツール検索サービス。授業で使えるワークシートや教材をすぐに見つけて活用できます。",
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
          {children}
          <ChatWidgetLoader />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}