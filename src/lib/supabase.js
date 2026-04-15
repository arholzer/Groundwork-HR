import { createClient } from "@supabase/supabase-js";

// Expect env vars from a Supabase project created only for GroundWork HR
// (never reuse URL/keys from other products such as Route of Flight).
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

let client;

/** Singleton Supabase client (browser). */
export function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!client) client = createClient(url, anonKey);
  return client;
}
