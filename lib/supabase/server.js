import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseConfigStatus() {
  return {
    hasUrl: Boolean(supabaseUrl),
    hasPublishableKey: Boolean(supabasePublishableKey),
    hasServerKey: Boolean(supabaseSecretKey),
    proofBucket: process.env.SUPABASE_PROOF_BUCKET ?? 'proof-images',
  };
}

export function hasSupabaseServerConfig() {
  return Boolean(supabaseUrl && supabaseSecretKey);
}

export function createServerSupabaseClient() {
  if (!hasSupabaseServerConfig()) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.');
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function maybeCreateServerSupabaseClient() {
  return hasSupabaseServerConfig() ? createServerSupabaseClient() : null;
}

export function createPublicSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
