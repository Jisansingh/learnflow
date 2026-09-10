import { createClient } from '@supabase/supabase-js';

// Simple Supabase client for the LearnFlow frontend.
// Uses only the public (publishable) key. Never expose secret keys.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Controls where the Supabase Auth session is stored.
// - true (default): localStorage, so the session survives browser restarts
//   ("Keep me signed in for 30 days"). The actual maximum lifetime is
//   bounded by the Supabase Auth project's refresh-token settings; the
//   client auto-refreshes the access token while the session is valid.
// - false: in-memory only, so the session ends with the page session
//   (the default sign-in behavior when "remember me" is unchecked).
let persistSessionInLocalStorage = true;
const memoryStore = {};

function useLocalStorage() {
  return typeof window !== 'undefined' && persistSessionInLocalStorage;
}

const sessionStorageProxy = {
  getItem: (key) => {
    if (useLocalStorage()) {
      try {
        const value = window.localStorage.getItem(key);
        if (value !== null) return value;
      } catch {
        // Fall through to the in-memory store.
      }
    }
    return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
  },
  setItem: (key, value) => {
    if (useLocalStorage()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fall through to the in-memory store.
      }
    }
    memoryStore[key] = value;
  },
  removeItem: (key) => {
    delete memoryStore[key];
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore (e.g. server-side rendering).
    }
  },
};

// Must be called before sign-in to select session persistence.
// Never stores passwords or credentials — only Supabase session tokens,
// exactly as the default Supabase Auth behavior does.
export function setSessionPersistence(persist) {
  persistSessionInLocalStorage = persist !== false;
}

// Removes any Supabase Auth session previously persisted to localStorage,
// without touching the in-memory session. Used after signing in without
// "remember me" so a stale persisted session cannot restore itself later.
export function clearPersistedSession() {
  if (typeof window === 'undefined') return;
  try {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && /^sb-.*-auth-token$/.test(key)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore storage errors; sign-in still succeeds.
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorageProxy,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
