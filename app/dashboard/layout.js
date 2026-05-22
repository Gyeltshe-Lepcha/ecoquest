'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  Bell,
  FileText,
  Flame,
  Gift,
  Leaf,
  Play,
  QrCode,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { notifications } from '@/lib/ecoquest-data';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/scan', label: 'Smart Bin', icon: QrCode },
  { href: '/dashboard/challenges', label: 'Challenges', icon: Target },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/badges', label: 'Rewards', icon: Gift },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
];

const basePlayerStats = [
  { label: 'EcoPoints', value: '320', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
  { label: 'Daily streak', value: '6 days', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Current rank', value: '#2', icon: Trophy, color: 'text-sky-600', bg: 'bg-sky-100' },
  { label: 'Bin status', value: 'Available', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
];

function NotificationMenu() {
  const unread = notifications.filter((notification) => notification.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-800 shadow-sm shadow-emerald-900/5 transition hover:bg-emerald-50">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Quest Alerts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.slice(0, 4).map((notification) => (
          <DropdownMenuItem key={notification.id} className="items-start gap-3 p-3">
            <span className={cn('mt-1 h-2 w-2 rounded-full', notification.unread ? 'bg-emerald-500' : 'bg-muted-foreground/30')} />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{notification.title}</span>
              <span className="block text-xs text-muted-foreground">{notification.body}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [ecoPoints, setEcoPoints] = useState(320);

  useEffect(() => {
    let alive = true;

    async function loadPlayerStats() {
      try {
        const response = await fetch('/api/iot/dashboard', { cache: 'no-store' });
        const result = await response.json();

        if (alive && response.ok) {
          setEcoPoints(Number(result.profile?.eco_points ?? 320));
        }
      } catch {
        if (alive) {
          setEcoPoints(320);
        }
      }
    }

    loadPlayerStats();
    const interval = setInterval(loadPlayerStats, 8000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const playerStats = useMemo(() => (
    basePlayerStats.map((stat) => (
      stat.label === 'EcoPoints'
        ? { ...stat, value: ecoPoints.toLocaleString() }
        : stat
    ))
  ), [ecoPoints]);

  return (
    <div className="min-h-screen min-w-[1280px] bg-[linear-gradient(135deg,#f8fff8_0%,#ecfbff_42%,#fff8dc_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-xl">
        <div className="flex h-20 items-center gap-4 px-4 lg:px-6">
          <Link href="/dashboard" className="flex min-w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-lg shadow-emerald-900/15">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-emerald-950">EcoQuest Bhutan</p>
              <p className="text-xs font-semibold text-emerald-700/70">Campus Sustainability Game</p>
            </div>
          </Link>

          <nav className="ml-4 flex flex-1 items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition',
                    active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-slate-500 hover:bg-sky-50 hover:text-sky-700',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <NotificationMenu />
            <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-white px-3 py-2 shadow-sm shadow-emerald-900/5">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-emerald-600 text-white">TG</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-black text-emerald-950">Team Green</p>
                <p className="text-xs font-semibold text-emerald-700">Level 4 Eco Ranger</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className="sticky top-20 z-20 h-[calc(100vh-5rem)] w-72 shrink-0 border-r border-emerald-100 bg-white/95 p-4"
        >

        <div className="rounded-lg bg-[linear-gradient(135deg,#10b981,#22c55e)] p-4 text-white shadow-xl shadow-emerald-900/15">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-white/70">Current Team</p>
              <p className="mt-1 text-2xl font-black">Team Green</p>
            </div>
            <Award className="h-10 w-10 text-yellow-200" />
          </div>
          <div className="mt-4 rounded-lg bg-white/15 p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span>Level 4 Eco Ranger</span>
              <span>78%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/25">
              <div className="h-full w-[78%] rounded-full bg-yellow-300" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {playerStats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3 shadow-sm shadow-emerald-900/5">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.bg)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <span className="text-sm font-semibold text-slate-500">{stat.label}</span>
              </div>
              <span className="font-black text-slate-950">{stat.value}</span>
            </div>
          ))}
        </div>

        <Link href="/dashboard/challenges">
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 font-black text-emerald-950 shadow-lg shadow-yellow-500/20 transition hover:bg-yellow-300">
            <Play className="h-4 w-4 fill-current" />
            Start Quest
          </button>
        </Link>

        <nav className="mt-5 grid gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition',
                  active ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 rounded-lg border border-sky-100 bg-sky-50 p-4">
          <p className="text-sm font-black text-sky-900">Bin is ready.</p>
          <p className="mt-1 text-xs leading-5 text-sky-700">CST Block A smart bin is available for your next scan.</p>
        </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
