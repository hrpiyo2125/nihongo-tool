"use client";

import { useEffect } from "react";
import { useAuth } from "../app/[locale]/AuthContext";
import { createClient } from "../lib/supabase";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: () => void;
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
  const { isLoggedIn, isAuthLoading } = useAuth();

  // スクリプトはページロード直後に読み込む（FedCMの時間枠に間に合わせるため）
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || window.google?.accounts) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // 認証状態が確定してからprompt/cancelを制御する
  useEffect(() => {
    if (isAuthLoading) return;

    if (isLoggedIn) {
      window.google?.accounts.id.cancel();
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;

    const init = async () => {
      const [rawNonce, hashedNonce] = await generateNonce();

      window.google?.accounts.id.initialize({
        client_id: clientId,
        nonce: hashedNonce,
        callback: async (response: { credential: string }) => {
          if (cancelled) return;
          const supabase = createClient();
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
      // スクリプトがまだロード中の場合は完了を待つ
      const interval = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(interval);
          init();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, [isLoggedIn, isAuthLoading]);

  return null;
}
