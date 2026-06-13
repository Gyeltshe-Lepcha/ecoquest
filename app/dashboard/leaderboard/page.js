'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Crown,
  Flame,
  Medal,
  Minus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

function getRankChange(current, prev) {
  if (current < prev) return { icon: TrendingUp, color: 'text-emerald-600', label: `+${prev - current}` };
  if (current > prev) return { icon: TrendingDown, color: 'text-rose-600', label: `-${current - prev}` };
  return { icon: Minus, color: 'text-muted-foreground', label: '0' };
}

function getRankBadge(rank) {
  switch (rank) {
    case 1:
      return { icon: Crown, color: 'text-amber-500', bg: 'bg-amber-50' };
    case 2:
      return { icon: Medal, color: 'text-slate-500', bg: 'bg-slate-100' };
    case 3:
      return { icon: Medal, color: 'text-orange-500', bg: 'bg-orange-50' };
    default:
      return null;
  }
}

function pointsToNextRank(rows, currentUser) {
  if (!currentUser || currentUser.rank <= 1) return 0;
  const next = rows.find((row) => row.rank === currentUser.rank - 1);
  if (!next) return 0;
  return Math.max(0, next.points - currentUser.points + 1);
}

function LeaderboardRow({ user }) {
  const rankChange = getRankChange(user.rank, user.prevRank);
  const RankIcon = rankChange.icon;

  return (
    <div className={cn('flex items-center gap-4 p-4 transition-colors hover:bg-muted/50', user.isCurrentUser && 'bg-emerald-50/80')}>
      <div className="w-8 text-center font-bold text-muted-foreground">{user.rank}</div>
      <div className="flex w-8 items-center justify-center">
        <RankIcon className={cn('h-4 w-4', rankChange.color)} />
      </div>
      <Avatar className="h-10 w-10">
        <AvatarFallback className={cn('font-medium', user.isCurrentUser ? 'bg-emerald-600 text-white' : 'bg-muted')}>
          {user.avatar}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn('truncate font-medium', user.isCurrentUser && 'text-emerald-700')}>{user.name}</p>
          {user.isCurrentUser && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">You</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{user.campus}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Flame className="h-4 w-4 text-amber-500" />
        {user.streak}
      </div>
      <div className="min-w-[90px] text-right">
        <p className="font-semibold">{user.points.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>
    </div>
  );
}

function EmptyLeaderboard({ title, body }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Users className="h-7 w-7" />
      </div>
      <p className="mt-4 text-base font-bold text-slate-950">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('alltime');
  const [leaderboard, setLeaderboard] = useState({
    individual: [],
    campus: [],
    connected: false,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  async function loadLeaderboard() {
    try {
      const response = await fetch('/api/leaderboard', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Could not load leaderboard.');
      }

      setLeaderboard({
        individual: result.individual ?? [],
        campus: result.campus ?? [],
        connected: Boolean(result.connected),
        error: result.error ?? null,
      });
    } catch (error) {
      setLeaderboard((current) => ({
        ...current,
        error: error.message,
      }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!alive) return;
      await loadLeaderboard();
    }

    load();
    const interval = setInterval(load, 5000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const individualRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const rowsBelowPodium = leaderboard.individual.filter((user) => user.rank > 3);
    if (!query) return rowsBelowPodium;

    return rowsBelowPodium.filter((user) => (
      user.name.toLowerCase().includes(query) ||
      user.campus.toLowerCase().includes(query)
    ));
  }, [leaderboard.individual, searchQuery]);

  const campusRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return leaderboard.campus;

    return leaderboard.campus.filter((campus) => campus.name.toLowerCase().includes(query));
  }, [leaderboard.campus, searchQuery]);

  const currentUserRank = leaderboard.individual.find((user) => user.isCurrentUser);
  const topThree = [1, 2, 3]
    .map((rank) => leaderboard.individual.find((user) => user.rank === rank))
    .filter(Boolean);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  const neededPoints = pointsToNextRank(leaderboard.individual, currentUserRank);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Dynamic ranking from registered Supabase users and EcoPoints.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Today</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={loadLeaderboard}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
            aria-label="Refresh leaderboard"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {leaderboard.error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          Leaderboard data could not be loaded. {leaderboard.error}
        </div>
      )}

      {currentUserRank && (
        <Card className="border-emerald-200 bg-emerald-50/80">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white">
                  #{currentUserRank.rank}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Current Rank</p>
                  <p className="text-lg font-semibold">
                    {currentUserRank.rank === 1 ? 'You are leading the board' : `Chasing rank #${currentUserRank.rank - 1}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-700">{currentUserRank.points.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">total points</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-200 pt-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">{currentUserRank.streak} day streak</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {neededPoints > 0 ? `${neededPoints} points to climb one rank` : 'Top rank reached'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {podiumOrder.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {podiumOrder.map((user, index) => {
          const badge = getRankBadge(user.rank);
          const BadgeIcon = badge?.icon;

          return (
            <motion.div
              key={user.user_id ?? user.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn('flex flex-col items-center', user.rank === 1 ? '-mt-4' : 'mt-4')}
            >
              <div className={cn('relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl lg:h-20 lg:w-20', badge?.bg)}>
                {BadgeIcon && <BadgeIcon className={cn('h-8 w-8 lg:h-10 lg:w-10', badge.color)} />}
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-card text-xs font-bold">
                  {user.rank}
                </div>
              </div>
              <Avatar className="mb-2 h-12 w-12 lg:h-14 lg:w-14">
                <AvatarFallback className={cn('font-medium', user.isCurrentUser ? 'bg-emerald-600 text-white' : 'bg-primary text-primary-foreground')}>
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <p className="max-w-full truncate px-2 text-center text-sm font-semibold lg:text-base">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.campus}</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">{user.points.toLocaleString()}</p>
            </motion.div>
          );
          })}
        </div>
      )}

      <Tabs defaultValue="individual" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="individual" className="gap-2">
              <Users className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="campus" className="gap-2">
              <Building className="h-4 w-4" />
              Campus
            </TabsTrigger>
          </TabsList>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-48 pl-9" />
          </div>
        </div>

        <TabsContent value="individual">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {individualRows.length > 0
                  ? individualRows.map((user) => (
                      <LeaderboardRow key={user.user_id ?? user.name} user={user} />
                    ))
                  : (
                    <EmptyLeaderboard
                      title="No registered users yet"
                      body="Once users register and profiles are saved in Supabase, they will appear here ranked by EcoPoints."
                    />
                    )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campus">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {campusRows.length > 0 ? campusRows.map((campus) => {
                  const badge = getRankBadge(campus.rank);
                  const BadgeIcon = badge?.icon;

                  return (
                    <div key={campus.rank} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        {BadgeIcon ? <BadgeIcon className={cn('h-5 w-5', badge.color)} /> : <span className="font-bold text-muted-foreground">{campus.rank}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{campus.name}</p>
                        <p className="text-sm text-muted-foreground">{campus.members} members</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {campus.change === 'up' && <TrendingUp className="h-4 w-4 text-emerald-600" />}
                        {campus.change === 'down' && <TrendingDown className="h-4 w-4 text-rose-600" />}
                        {campus.change === 'same' && <Minus className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="min-w-[100px] text-right">
                        <p className="font-semibold">{campus.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">total points</p>
                      </div>
                    </div>
                  );
                }) : (
                  <EmptyLeaderboard
                    title="No campus scores yet"
                    body="Campus totals will appear after registered users are available in Supabase profiles."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
