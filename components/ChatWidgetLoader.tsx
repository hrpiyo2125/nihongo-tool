"use client";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

function ChatWidgetWithSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [chatSessionId, setChatSessionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const chatSession = searchParams.get("chatSession");
    if (chatSession) {
      setChatSessionId(chatSession);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("chatSession");
      const newUrl = params.size > 0 ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // 認証関連ページではウィジェットを非表示
  if (pathname.includes("/auth") || pathname.includes("/welcome-back")) return null;

  return <ChatWidget key={chatSessionId ?? "default"} initialSessionId={chatSessionId} />;
}

export default function ChatWidgetLoader() {
  return (
    <Suspense fallback={null}>
      <ChatWidgetWithSession />
    </Suspense>
  );
}
