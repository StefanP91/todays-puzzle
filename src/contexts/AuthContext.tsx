import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { mergeAndSyncAllStats, pushStatsToCloud } from "../lib/statsSync";
import { getSupabase, isSupabaseClientReady, loadPublicAuthConfig } from "../lib/supabase";
import type { GameLangCode } from "../lib/gameLanguage";
import type { Stats } from "../lib/storage";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncStatsForLang: (lang: GameLangCode, stats: Stats) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [configured, setConfigured] = useState(isSupabaseClientReady());
  const [loading, setLoading] = useState(isSupabaseClientReady());

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const config = await loadPublicAuthConfig();
      if (!active) return;

      if (!config.authEnabled) {
        setConfigured(false);
        setLoading(false);
        return;
      }

      setConfigured(true);
      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error("auth session failed:", error);
      } finally {
        if (active) setLoading(false);
      }

      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (nextUser) {
          try {
            await mergeAndSyncAllStats(nextUser.id);
            window.dispatchEvent(new CustomEvent("puzzle-stats-synced"));
          } catch (error) {
            console.error("stats sync failed:", error);
          }
        }
      });

      return () => listener.subscription.unsubscribe();
    }

    let unsubscribe: (() => void) | undefined;

    void bootstrap().then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Auth is not configured");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Auth is not configured");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Auth is not configured");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const syncStatsForLang = useCallback(async (lang: GameLangCode, stats: Stats) => {
    if (!user) return;
    await pushStatsToCloud(user.id, lang, stats);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      syncStatsForLang,
    }),
    [user, loading, configured, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, syncStatsForLang],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
