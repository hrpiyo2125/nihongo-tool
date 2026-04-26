"use client";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

function ChatWidgetWithSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [chatSessionId, setChatSessionId] = useState<string | undefined>(undefined);

  // Googleログイン後にチャットページへ戻す
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        const returnTo = localStorage.getItem("auth_return_to");
        if (returnTo) {
          localStorage.removeItem("auth_return_to");
          window.location.href = returnTo;
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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

  // これらのページではウィジェットを非表示
  if (pathname.includes("/auth") || pathname.includes("/welcome-back") || pathname.includes("/chat/")) return null;

  return <ChatWidget key={chatSessionId ?? "default"} initialSessionId={chatSessionId} />;
}

export default function ChatWidgetLoader() {
  return (
    <Suspense fallback={null}>
      <ChatWidgetWithSession />
    </Suspense>
  );
}
