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

export default function GoogleOneTap() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      window.google?.accounts.id.cancel();
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const init = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          const supabase = createClient();
          await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });
        },
        cancel_on_tap_outside: false,
      });
      window.google?.accounts.id.prompt();
    };

    if (window.google?.accounts) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.head.appendChild(script);

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, [isLoggedIn]);

  return null;
}
