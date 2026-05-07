"use client";

import { useEffect } from "react";
import { createClient } from "../lib/supabase";

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

async function generateNonce(): Promise<[string, string]> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const raw = btoa(String.fromCharCode(...array));
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashed = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return [raw, hashed];
}

export default function GoogleOneTap() {
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;

    const init = async () => {
      if (cancelled) return;

      // Supabaseクライアント初期化を待ってからセッション確認
      const supabase = createClient();
      await new Promise<void>((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'INITIAL_SESSION') {
            subscription.unsubscribe();
            resolve();
          }
        });
      });
      if (cancelled) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || session) return;

      const [rawNonce, hashedNonce] = await generateNonce();

      window.google?.accounts.id.initialize({
        client_id: clientId,
        nonce: hashedNonce,
        callback: async (response: { credential: string }) => {
          if (cancelled) return;
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
            nonce: rawNonce,
          });
          if (error) {
            console.error("[GoogleOneTap] signInWithIdToken error:", error);
          } else {
            window.location.reload();
          }
        },
        cancel_on_tap_outside: false,
      });
      window.google?.accounts.id.prompt();
    };

    if (window.google?.accounts) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
