'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, Download, Flame, Search, ShieldCheck, UserRound, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function normalizeUser(raw) {
  return {
    user_id: raw.user_id,
    name: raw.name ?? 'Unknown',
    email: raw.email ?? '',
    campus: raw.campus ?? '',
    hostel: raw.hostel ?? '',
    role: raw.role ?? 'user',
    avatar: raw.avatar ?? (raw.name ?? 'U').slice(0, 2).toUpperCase(),
    total_points: Number(raw.eco_points ?? raw.total_points ?? 0),
    streak_days: Number(raw.streak_days ?? 0),
  };
}

export default function AdminUsersPage() {
  const [userRows, setUserRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUserRows((data.users ?? []).map(normalizeUser));
      setError(null);
    } catch (err) {
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = useMemo(
    () =>
      userRows.filter((user) => {
        const matchesRole = role === 'all' || user.role === role;
        const matchesQuery = `${user.name} ${user.email} ${user.campus}`.toLowerCase().includes(query.toLowerCase());
        return matchesRole && matchesQuery;
      }),
    [userRows, query, role],
  );

  const totalUsers = userRows.length;
  const totalAdmins = userRows.filter((u) => u.role === 'admin').length;
  const avgStreak = userRows.length
    ? (userRows.reduce((s, u) => s + u.streak_days, 0) / userRows.length).toFixed(1)
    : '0';
  const totalPoints = userRows.reduce((s, u) => s + u.total_points, 0);
  const totalPointsLabel =
    totalPoints >= 1000 ? `${(totalPoints / 1000).toFixed(1)}K` : String(totalPoints);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Profiles, points, streaks, roles, and campus grouping.</p>
        </div>
        <Button asChild variant="outline" className="gap-2 self-start sm:self-center">
          <a href="/reports/activity">
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total users', value: loading ? '—' : totalUsers, icon: Users, color: 'text-primary' },
          { label: 'Admins', value: loading ? '—' : totalAdmins, icon: ShieldCheck, color: 'text-chart-4' },
          { label: 'Average streak', value: loading ? '—' : avgStreak, icon: Flame, color: 'text-accent' },
          { label: 'Points issued', value: loading ? '—' : totalPointsLabel, icon: Award, color: 'text-chart-5' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">User Directory</CardTitle>
            <CardDescription>Leaderboard filters can use class, hostel, or campus.</CardDescription>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="w-52 pl-9" />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading users…</div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((user, index) => (
                <div key={user.user_id} className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{index + 1}. {user.name}</p>
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.campus}{user.hostel ? ` / ${user.hostel}` : ''}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">{user.total_points.toLocaleString()} pts</p>
                    <p className="text-muted-foreground">{user.streak_days} day streak</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2">
                    <UserRound className="h-4 w-4" />
                    View
                  </Button>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No users match your search.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
