'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { wasteTrend } from '@/lib/ecoquest-data';

// fallback chart data (stays as seed until Supabase provides real data)
const wasteTypeData = [
  { name: 'Plastic', value: 35, color: '#22c55e' },
  { name: 'Paper',   value: 25, color: '#3b82f6' },
  { name: 'Organic', value: 22, color: '#f59e0b' },
  { name: 'Glass',   value: 10, color: '#8b5cf6' },
  { name: 'Metal',   value: 8,  color: '#ef4444' },
];

function relativeTime(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function shortCampus(campus = '') {
  if (!campus) return '?';
  if (campus.length <= 6) return campus.toUpperCase();
  const initials = campus.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('');
  return initials.slice(0, 5) || campus.slice(0, 4).toUpperCase();
}

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [binAlerts, setBinAlerts] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState(wasteTrend);

  const fetchAll = useCallback(async () => {
    const [statsRes, subsRes, binsRes] = await Promise.allSettled([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/submissions').then((r) => r.json()),
      fetch('/api/admin/bins').then((r) => r.json()),
    ]);

    if (statsRes.status === 'fulfilled') {
      const s = statsRes.value;
      setStatsData(s);
      if (s.weekly_activity?.length) setWeeklyActivity(s.weekly_activity);
    }

    if (subsRes.status === 'fulfilled') {
      const subs = (subsRes.value.submissions ?? []).slice(0, 5);
      setRecentSubmissions(
        subs.map((s) => ({
          id: s.submission_id,
          user: s.user?.name ?? 'Unknown',
          campus: shortCampus(s.user?.campus),
          challenge: s.challenge_title ?? 'Challenge',
          status: s.status ?? 'pending',
          time: relativeTime(s.submitted_at),
        })),
      );
    }

    if (binsRes.status === 'fulfilled') {
      const alertBins = (binsRes.value.bins ?? [])
        .filter((b) => b.fill_level_pct >= 70)
        .slice(0, 3)
        .map((b) => ({
          id: b.bin_id,
          name: b.location_name,
          fillLevel: b.fill_level_pct,
          status: b.fill_level_pct >= 80 ? 'critical' : 'warning',
        }));
      setBinAlerts(alertBins);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const stats = [
    {
      title: 'Total Users',
      value: statsData ? statsData.total_users.toLocaleString() : '—',
      change: '+12.5%',
      changeType: 'positive',
      icon: Users,
      description: 'Active platform users',
    },
    {
      title: 'Challenges Completed',
      value: statsData ? statsData.challenges_completed.toLocaleString() : '—',
      change: '+8.2%',
      changeType: 'positive',
      icon: CheckCircle2,
      description: 'Total approved submissions',
    },
    {
      title: 'Pending Reviews',
      value: statsData ? statsData.pending_reviews.toLocaleString() : '—',
      change: statsData?.pending_reviews === 0 ? '0' : '-5.1%',
      changeType: statsData?.pending_reviews === 0 ? 'positive' : 'negative',
      icon: Clock,
      description: 'Awaiting verification',
    },
    {
      title: 'Smart Bins Active',
      value: statsData ? statsData.active_bins.toLocaleString() : '—',
      change: `${statsData?.bins_critical ?? 0} critical`,
      changeType: (statsData?.bins_critical ?? 0) > 0 ? 'negative' : 'positive',
      icon: Trash2,
      description: 'Across all campuses',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="border-border/50">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl lg:text-3xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4 text-chart-5" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                      <span className={`text-xs font-medium ${stat.changeType === 'positive' ? 'text-chart-5' : 'text-destructive'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-chart-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Weekly Activity</CardTitle>
            <CardDescription>Challenges completed and smart bin usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivity}>
                  <defs>
                    <linearGradient id="colorChallenges" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="challenges" stroke="var(--primary)" fillOpacity={1} fill="url(#colorChallenges)" name="Challenges" />
                  <Area type="monotone" dataKey="binUsage" stroke="var(--chart-2)" fillOpacity={1} fill="url(#colorBins)" name="Bin Usage" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Waste Type Distribution */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Waste Distribution</CardTitle>
            <CardDescription>By category this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={wasteTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {wasteTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {wasteTypeData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-muted-foreground">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Recent Submissions</CardTitle>
            <CardDescription>Latest challenge submissions for review</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {submission.user.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{submission.user}</p>
                        <p className="text-xs text-muted-foreground">{submission.challenge}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        submission.status === 'approved' ? 'bg-chart-5/10 text-chart-5' :
                        submission.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                        'bg-accent/10 text-accent'
                      }`}>
                        {submission.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{submission.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bin Alerts */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent" />
              Bin Alerts
            </CardTitle>
            <CardDescription>Smart bins requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {binAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All bins are within normal range.</p>
            ) : (
              <div className="space-y-4">
                {binAlerts.map((bin) => (
                  <div key={bin.id} className={`p-4 rounded-lg border ${bin.status === 'critical' ? 'border-destructive/50 bg-destructive/5' : 'border-accent/50 bg-accent/5'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trash2 className={`w-4 h-4 ${bin.status === 'critical' ? 'text-destructive' : 'text-accent'}`} />
                        <span className="font-medium text-sm">{bin.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${bin.status === 'critical' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
                        {bin.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bin.status === 'critical' ? 'bg-destructive' : 'bg-accent'}`} style={{ width: `${bin.fillLevel}%` }} />
                      </div>
                      <span className="text-sm font-medium">{bin.fillLevel}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
