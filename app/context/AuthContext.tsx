"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "devdeakin.token";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "paid";
};

type AuthValue = {
  user: SessionUser | null;
  token: string | null;
  ready: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  authHeaders: () => Record<string, string>;
};

const AuthContext = createContext<AuthValue | null>(null);

// localStorage is an external store, so it is subscribed to rather than copied
// into state. "storage" fires for other tabs, the local set notifies this one.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

// The server has no localStorage, so it always renders as a visitor
function getServerToken(): string | null {
  return null;
}

// Reads the claims without verifying, which is fine for display only. Anything
// that matters is re-verified against the signature on the server.
function readClaims(token: string): SessionUser | null {
  try {
    const [, payload] = token.split(".");
    const claims = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (typeof claims.exp === "number" && claims.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: String(claims.sub),
      name: String(claims.name),
      email: String(claims.email),
      plan: claims.plan === "paid" ? "paid" : "free",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getToken, getServerToken);
  // False during server render, true once mounted, so the navbar does not
  // flash a logged out state
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const user = stored ? readClaims(stored) : null;
  // An expired or malformed token counts as no session
  const token = user ? stored : null;

  const signIn = useCallback((next: string) => {
    localStorage.setItem(STORAGE_KEY, next);
    notify();
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    notify();
  }, []);

  // Attached to every request that needs the session
  const authHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const value = useMemo<AuthValue>(
    () => ({ token, user, ready, signIn, signOut, authHeaders }),
    [token, user, ready, signIn, signOut, authHeaders]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return value;
}
