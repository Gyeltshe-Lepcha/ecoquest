'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Gift, Leaf, Target, Trophy } from 'lucide-react';
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
  { href: '/dashboard', label: 'Challenges', icon: Target },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/badges', label: 'Rewards', icon: Gift },
];

function NotificationMenu() {
  const unread = notifications.filter((notification) => notification.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />}
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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ecoquest_user');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen min-w-[1180px] bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-6">
          <Link href="/dashboard" className="flex min-w-fit items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-black tracking-tight text-slate-950">EcoQuest Bhutan</p>
              <p className="text-xs font-medium text-slate-500">Smart campus challenge system</p>
            </div>
          </Link>

          <nav className="ml-4 flex flex-1 items-center gap-1">
            {navItems.map((item) => {
              const active = item.href === '/dashboard'
                ? pathname === '/dashboard' || pathname === '/dashboard/challenges'
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition',
                    active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
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
            <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-emerald-200">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-emerald-600 text-white">
                  {currentUser?.avatar || 'TG'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-950">{currentUser?.name || 'Team Green'}</p>
                <p className="text-xs font-medium text-slate-500">{currentUser?.campus || 'Level 4 Eco Ranger'}</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
