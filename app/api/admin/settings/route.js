import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { getSettings, patchSettings } from '@/lib/admin-settings';

export async function GET() {
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.from('admin_settings').select('key, value');
    if (!error && data && data.length > 0) {
      const settings = Object.fromEntries(data.map((row) => [row.key, row.value]));
      return NextResponse.json({ settings });
    }
  }

  return NextResponse.json({ settings: getSettings() });
}

export async function PATCH(request) {
  const body = await request.json().catch(() => ({}));

  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'No settings provided' }, { status: 400 });
  }

  const updated = patchSettings(body);

  const supabase = maybeCreateServerSupabaseClient();
  if (supabase) {
    const upserts = Object.entries(body).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));
    await supabase.from('admin_settings').upsert(upserts, { onConflict: 'key' }).catch(() => {});
  }

  return NextResponse.json({ settings: updated });
}
