'use client';

import { useMemo, useState } from 'react';
import { Award, Download, Flame, Search, ShieldCheck, UserRound, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { users } from '@/lib/ecoquest-data';

const userRows = [
  ...users.filter((user) => user.role === 'user'),
  { user_id: 'USR-0112', name: 'Sonam Choden', email: 'sonam@jnec.edu.bt', campus: 'Jigme Namgyel Engineering College', hostel: 'Pemagatshel', total_points: 1980, streak_days: 8, role: 'user', avatar: 'SC' },
  { user_id: 'USR-0120', name: 'Dorji Wangchuk', email: 'dorji@gcbs.edu.bt', campus: 'Gaeddu College of Business Studies', hostel: 'Geddu', total_points: 1875, streak_days: 7, role: 'user', avatar: 'DW' },
  users.find((user) => user.role === 'admin'),
].filter(Boolean);

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');

  const filtered = useMemo(() => userRows.filter((user) => {
    const matchesRole = role === 'all' ? true : user.role === role;
    const matchesQuery = `${user.name} ${user.email} ${user.campus}`.toLowerCase().includes(query.toLowerCase());
    return matchesRole && matchesQuery;
  }), [query, role]);

  return (
    <div className="space-y-6">
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
          { label: 'Total users', value: userRows.length, icon: Users, color: 'text-primary' },
          { label: 'Admins', value: userRows.filter((user) => user.role === 'admin').length, icon: ShieldCheck, color: 'text-chart-4' },
          { label: 'Average streak', value: '8.7', icon: Flame, color: 'text-accent' },
          { label: 'Points issued', value: '10.7K', icon: Award, color: 'text-chart-5' },
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
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users..." className="w-52 pl-9" />
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
          <div className="divide-y divide-border/50">
            {filtered.map((user, index) => (
              <div key={user.user_id} className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                  {user.avatar ?? user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{index + 1}. {user.name}</p>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.campus} / {user.hostel}</p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
