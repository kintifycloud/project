"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabaseAuth } from "./supabase-auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (!supabaseAuth) {
        setLoading(false);
        return;
      }

      try {
        const { data: { user: currentUser } } = await supabaseAuth.auth.getUser();
        setUser(currentUser ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabaseAuth?.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    ) ?? { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (!supabaseAuth) return;
    
    try {
      await supabaseAuth.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("[Auth] Sign out error:", error);
    }
  };

  const refreshUser = async () => {
    if (!supabaseAuth) return;

    try {
      const { data: { user: currentUser } } = await supabaseAuth.auth.getUser();
      setUser(currentUser ?? null);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
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
