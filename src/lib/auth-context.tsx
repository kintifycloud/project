"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabaseAuth } from "./supabase-auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[Auth Context] Initializing...");
    const url = new URL(window.location.href);
    const hasMagicLinkParams = [
      "access_token",
      "refresh_token",
      "token_hash",
      "code",
      "type",
    ].some((key) => url.searchParams.has(key) || url.hash.includes(`${key}=`));

    console.log("[Auth Context] URL on init:", window.location.href);
    console.log("[Auth Context] Magic link params detected:", hasMagicLinkParams);

    const checkSession = async () => {
      if (!supabaseAuth) {
        console.error("[Auth Context] ERROR: supabaseAuth is null");
        setLoading(false);
        return;
      }

      console.log("[Auth Context] Checking session...");

      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabaseAuth.auth.getSession();

        if (sessionError) {
          console.error("[Auth Context] getSession error:", sessionError.message);
        }

        console.log("[Auth Context] Current session:", currentSession ? "available" : "missing");
        setSession(currentSession ?? null);

        const {
          data: { user: currentUser },
          error,
        } = await supabaseAuth.auth.getUser();

        if (error) {
          console.error("[Auth Context] getUser error:", error.message);
        }

        console.log("[Auth Context] Current user:", currentUser ? "authenticated" : "not authenticated");
        setUser(currentUser ?? null);
      } catch (err) {
        console.error("[Auth Context] Session check failed:", err);
        setSession(null);
        setUser(null);
      } finally {
        if (!hasMagicLinkParams) {
          setLoading(false);
          console.log("[Auth Context] Initialization complete");
        } else {
          console.log("[Auth Context] Waiting for auth state change to complete magic link session setup");
        }
      }
    };

    console.log("[Auth Context] Setting up auth state listener");
    const { data: { subscription } } = supabaseAuth?.auth.onAuthStateChange(
      (event, session) => {
        console.log("[Auth Context] Auth state changed:", event, session ? "has session" : "no session");
        setSession(session ?? null);
        setUser(session?.user ?? null);
        if (hasMagicLinkParams || event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          setLoading(false);
          console.log("[Auth Context] Auth flow resolved after state change");
        }
      }
    ) ?? { data: { subscription: null } };

    checkSession();

    const fallbackTimeout = window.setTimeout(() => {
      console.log("[Auth Context] Fallback timeout reached; ending loading state");
      setLoading(false);
    }, hasMagicLinkParams ? 5000 : 1500);

    return () => {
      window.clearTimeout(fallbackTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("[Auth Context] Signing out...");
    if (!supabaseAuth) return;
    
    try {
      const { error } = await supabaseAuth.auth.signOut();
      if (error) {
        console.error("[Auth Context] Sign out error:", error.message);
      } else {
        console.log("[Auth Context] Sign out successful");
      }
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("[Auth Context] Sign out error:", error);
    }
  };

  const refreshUser = async () => {
    if (!supabaseAuth) return;

    try {
      const { data: { session: currentSession } } = await supabaseAuth.auth.getSession();
      const { data: { user: currentUser } } = await supabaseAuth.auth.getUser();
      setSession(currentSession ?? null);
      setUser(currentUser ?? null);
    } catch {
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
