import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { users, submissions, smartBins, wasteTrend } from '@/lib/ecoquest-data';

export async function GET() {
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const [usersRes, approvedRes, pendingRes, binsRes, detectionsRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('smart_bins').select('bin_id, fill_level_pct, online'),
      supabase
        .from('detections')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 86_400_000).toISOString()),
    ]);

    const bins = binsRes.data ?? [];

    // Build 7-day activity by overlaying real detection counts over seed baselines
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayBinUsage = {};
    for (const d of detectionsRes.data ?? []) {
      const label = dayNames[new Date(d.created_at).getDay()];
      dayBinUsage[label] = (dayBinUsage[label] ?? 0) + 1;
    }
    const weeklyActivity = wasteTrend.map((row) => ({
      ...row,
      binUsage: dayBinUsage[row.day] ?? row.binUsage,
    }));

    return NextResponse.json({
      connected: true,
      total_users: usersRes.count ?? 0,
      challenges_completed: approvedRes.count ?? 0,
      pending_reviews: pendingRes.count ?? 0,
      active_bins: bins.filter((b) => b.online).length,
      bins_critical: bins.filter((b) => b.fill_level_pct >= 80).length,
      weekly_activity: weeklyActivity,
    });
  }

  return NextResponse.json({
    connected: false,
    total_users: users.filter((u) => u.role === 'user').length,
    challenges_completed: submissions.filter((s) => s.status === 'approved').length,
    pending_reviews: submissions.filter((s) => s.status === 'pending').length,
    active_bins: smartBins.filter((b) => b.online).length,
    bins_critical: smartBins.filter((b) => b.fill_level_pct >= 80).length,
    weekly_activity: wasteTrend,
  });
}
