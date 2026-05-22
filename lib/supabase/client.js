import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseBrowserConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function createBrowserSupabaseClient() {
  if (!hasSupabaseBrowserConfig()) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }

  return createClient(supabaseUrl, supabasePublishableKey);
}
