import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const buildUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const buildAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

let client: SupabaseClient | null =
  buildUrl && buildAnonKey ? createClient(buildUrl, buildAnonKey) : null;

export function isSupabaseClientReady(): boolean {
  return client !== null;
}

export function getSupabase(): SupabaseClient | null {
  return client;
}

/** @deprecated use isSupabaseClientReady — kept for existing imports */
export const isSupabaseConfigured = Boolean(buildUrl && buildAnonKey);

/** @deprecated use getSupabase */
export const supabase = client;

export interface PublicAuthConfig {
  authEnabled: boolean;
  url?: string;
  anonKey?: string;
}

export function initSupabaseClient(url: string, anonKey: string): SupabaseClient {
  client = createClient(url.trim(), anonKey.trim());
  return client;
}

export async function loadPublicAuthConfig(): Promise<PublicAuthConfig> {
  if (client) return { authEnabled: true, url: buildUrl, anonKey: buildAnonKey };

  try {
    const response = await fetch("/api/public-config", { cache: "no-store" });
    if (!response.ok) return { authEnabled: false };
    const data = (await response.json()) as PublicAuthConfig;
    if (data.authEnabled && data.url && data.anonKey) {
      initSupabaseClient(data.url, data.anonKey);
      return data;
    }
    return { authEnabled: false };
  } catch {
    return { authEnabled: false };
  }
}
