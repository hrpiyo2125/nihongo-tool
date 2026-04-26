"use client";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

function ChatWidgetWithSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [initialSessionId, setInitialSessionId] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const chatSession = searchParams.get("chatSession");
    if (chatSession) {
      setInitialSessionId(chatSession);
      // URLからパラメータを除去してクリーンに
      const params = new URLSearchParams(searchParams.toString());
      params.delete("chatSession");
      const newUrl = params.size > 0 ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;
  return <ChatWidget initialSessionId={initialSessionId} />;
}

export default function ChatWidgetLoader() {
  return (
    <Suspense fallback={null}>
      <ChatWidgetWithSession />
    </Suspense>
  );
}
