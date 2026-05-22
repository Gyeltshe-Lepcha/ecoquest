'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Leaf, LayoutDashboard, Target, FileCheck, Trash2, Users, Settings, LogOut, Menu, X, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { notifications } from '@/lib/ecoquest-data';
const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/challenges', label: 'Challenges', icon: Target },
    { href: '/admin/submissions', label: 'Submissions', icon: FileCheck },
    { href: '/admin/bins', label: 'Smart Bins', icon: Trash2 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];
function AdminNotificationMenu() {
    const adminNotifications = notifications.filter((notification) => notification.type === 'bin_alert' || notification.type === 'verification');
    const unread = adminNotifications.filter((notification) => notification.unread).length;
    return (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5"/>
          {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"/>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Admin Alerts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {adminNotifications.map((notification) => (<DropdownMenuItem key={notification.id} className="items-start gap-3 p-3">
            <span className={cn("mt-1 h-2 w-2 rounded-full", notification.priority === "high" ? "bg-destructive" : "bg-accent")}/>
            <span>
              <span className="block text-sm font-medium">{notification.title}</span>
              <span className="block text-xs text-muted-foreground">{notification.body}</span>
            </span>
          </DropdownMenuItem>))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="justify-center text-chart-4">
            Alert settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);
}
export default function AdminLayout({ children, }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (<div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-chart-4 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white"/>
            </div>
            <span className="font-semibold">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <AdminNotificationMenu />
            <button onClick={() => setSidebarOpen(true)} className="p-2">
              <Menu className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (<div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}/>)}

      {/* Sidebar */}
      <aside className={cn("fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300", "lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-chart-4 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white"/>
              </div>
              <div>
                <span className="font-semibold text-sidebar-foreground block">EcoQuest</span>
                <span className="text-xs text-sidebar-foreground/60">Admin Panel</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2">
              <X className="w-5 h-5 text-sidebar-foreground"/>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
            const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
            return (<Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", isActive
                    ? "bg-chart-4/10 text-chart-4"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
                  <item.icon className="w-5 h-5"/>
                  {item.label}
                </Link>);
        })}
          </nav>

          {/* Back to User Dashboard */}
          <div className="p-4 border-t border-sidebar-border">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full gap-2 text-sm">
                <Leaf className="w-4 h-4"/>
                Back to User Dashboard
              </Button>
            </Link>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src="/avatars/admin.jpg"/>
                    <AvatarFallback className="bg-chart-4 text-white text-sm">AD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-sidebar-foreground">Admin User</div>
                    <div className="text-xs text-sidebar-foreground/60">System Administrator</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4"/>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-2 text-destructive">
                    <LogOut className="w-4 h-4"/>
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-border bg-card/50">
          <div>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage EcoQuest Bhutan platform</p>
          </div>
          <div className="flex items-center gap-3">
            <AdminNotificationMenu />
            <Avatar className="w-9 h-9">
              <AvatarImage src="/avatars/admin.jpg"/>
              <AvatarFallback className="bg-chart-4 text-white text-sm">AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>);
}
