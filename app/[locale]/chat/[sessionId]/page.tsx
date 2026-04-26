"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ChatResumePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const sessionId = params.sessionId as string;

  useEffect(() => {
    router.replace(`/${locale}?chatSession=${sessionId}`);
  }, [locale, sessionId, router]);

  return null;
}
