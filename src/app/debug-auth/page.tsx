"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabaseAuth } from "@/lib/supabase-auth";

export default function DebugAuthPage() {
  const { user, session, loading } = useAuth();
  const [clientUser, setClientUser] = useState<unknown>(null);
  const [clientSession, setClientSession] = useState<unknown>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const callbackInfo = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        href: "",
        hasMagicLinkParams: false,
      };
    }

    const url = new URL(window.location.href);
    const hasMagicLinkParams = [
      "access_token",
      "refresh_token",
      "token_hash",
      "code",
      "type",
    ].some((key) => url.searchParams.has(key) || url.hash.includes(`${key}=`));

    return {
      href: window.location.href,
      hasMagicLinkParams,
    };
  }, []);

  useEffect(() => {
    const authClient = supabaseAuth;

    if (!authClient) {
      return;
    }

    const loadAuthState = async () => {
      const {
        data: { user: currentUser },
        error: userError,
      } = await authClient.auth.getUser();

      const {
        data: { session: currentSession },
        error: sessionError,
      } = await authClient.auth.getSession();

      if (userError) {
        console.error("[Debug Auth] getUser error:", userError.message);
      }

      if (sessionError) {
        console.error("[Debug Auth] getSession error:", sessionError.message);
      }

      setClientUser(currentUser ?? null);
      setClientSession(currentSession ?? null);
    };

    const { data: { subscription } } = authClient.auth.onAuthStateChange((event, nextSession) => {
      console.log("[Debug Auth] Auth state changed:", event, nextSession ? "has session" : "no session");
      setLastEvent(event);
      setClientUser(nextSession?.user ?? null);
      setClientSession(nextSession ?? null);
    });

    void loadAuthState();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Debug Auth</h1>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
          <p><strong>loading:</strong> {String(loading)}</p>
          <p><strong>last auth event:</strong> {lastEvent ?? "none"}</p>
          <p><strong>has callback params:</strong> {String(callbackInfo.hasMagicLinkParams)}</p>
          <p><strong>current url:</strong> {callbackInfo.href || "n/a"}</p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-lg font-medium mb-3">Context User</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-lg font-medium mb-3">Context Session</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(session, null, 2)}</pre>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-lg font-medium mb-3">Supabase getUser()</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(clientUser, null, 2)}</pre>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-lg font-medium mb-3">Supabase getSession()</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(clientSession, null, 2)}</pre>
        </section>
      </div>
    </main>
  );
}
