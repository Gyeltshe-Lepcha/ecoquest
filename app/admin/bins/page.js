'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trash2, Battery, Wifi, WifiOff, AlertTriangle, CheckCircle2,
  Plus, Search, Settings, Activity, RefreshCw, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── helpers ──────────────────────────────────────────────────────────────────

function relativeTime(isoString) {
  if (!isoString) return 'unknown';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`;
}

function computeStatus(bin) {
  if (!bin.online) return 'offline';
  if (bin.fill_level_pct >= 80) return 'critical';
  if (bin.fill_level_pct >= 60) return 'warning';
  return 'normal';
}

function normalizeBin(raw) {
  return {
    id: raw.bin_id,
    name: raw.location_name,
    location: raw.location ?? raw.location_name,
    fillLevel: Number(raw.fill_level_pct ?? 0),
    status: computeStatus(raw),
    lastSync: relativeTime(raw.last_synced_at),
    online: Boolean(raw.online),
    totalDeposits: Number(raw.total_deposits ?? 0),
    todayDeposits: Number(raw.today_deposits ?? 0),
    batteryLevel: Number(raw.battery_level_pct ?? 0),
  };
}

const usageData = [
  { time: '6am', deposits: 12 },
  { time: '8am', deposits: 45 },
  { time: '10am', deposits: 38 },
  { time: '12pm', deposits: 67 },
  { time: '2pm', deposits: 52 },
  { time: '4pm', deposits: 43 },
  { time: '6pm', deposits: 35 },
  { time: '8pm', deposits: 18 },
];

function getStatusColor(status) {
  switch (status) {
    case 'critical': return { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/50' };
    case 'warning':  return { text: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/50' };
    case 'normal':   return { text: 'text-chart-5', bg: 'bg-chart-5/10', border: 'border-chart-5/50' };
    default:         return { text: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' };
  }
}

function getFillColor(fillLevel) {
  if (fillLevel >= 80) return 'bg-destructive';
  if (fillLevel >= 60) return 'bg-accent';
  return 'bg-chart-5';
}

// ─── BinCard ──────────────────────────────────────────────────────────────────

function BinCard({ bin }) {
  const statusColors = getStatusColor(bin.status);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`border-border/50 hover:shadow-lg transition-all cursor-pointer ${!bin.online && 'opacity-60'}`}
          onClick={() => setDetailsOpen(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${statusColors.bg} flex items-center justify-center`}>
                  <Trash2 className={`w-6 h-6 ${statusColors.text}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{bin.name}</h3>
                    {bin.online ? <Wifi className="w-4 h-4 text-chart-5" /> : <WifiOff className="w-4 h-4 text-destructive" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{bin.id}</p>
                </div>
              </div>
              <Badge variant="outline" className={`${statusColors.bg} ${statusColors.text} border-0`}>
                {bin.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Fill Level</span>
                  <span className="font-medium">{bin.fillLevel}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${getFillColor(bin.fillLevel)}`} style={{ width: `${bin.fillLevel}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{bin.lastSync}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Battery className={`w-3 h-3 ${bin.batteryLevel < 20 ? 'text-destructive' : ''}`} />
                  <span>{bin.batteryLevel}%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{bin.todayDeposits}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{bin.totalDeposits.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className={`w-5 h-5 ${statusColors.text}`} />
              {bin.name}
            </DialogTitle>
            <DialogDescription>{bin.location}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Fill Level</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${bin.fillLevel >= 80 ? 'text-destructive' : bin.fillLevel >= 60 ? 'text-accent' : 'text-chart-5'}`}>
                    {bin.fillLevel}%
                  </span>
                  {bin.fillLevel >= 80 && <AlertTriangle className="w-5 h-5 text-destructive" />}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Connection</p>
                <div className="flex items-center gap-2">
                  {bin.online ? (
                    <><CheckCircle2 className="w-5 h-5 text-chart-5" /><span className="font-medium text-chart-5">Online</span></>
                  ) : (
                    <><WifiOff className="w-5 h-5 text-destructive" /><span className="font-medium text-destructive">Offline</span></>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Today&apos;s Activity</h4>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageData}>
                    <defs>
                      <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="deposits" stroke="var(--primary)" fillOpacity={1} fill="url(#colorDeposits)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{bin.todayDeposits}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{bin.totalDeposits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className={`text-2xl font-bold ${bin.batteryLevel < 20 ? 'text-destructive' : ''}`}>
                  {bin.batteryLevel}%
                </p>
                <p className="text-xs text-muted-foreground">Battery</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Settings className="w-4 h-4" />
                Configure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function SmartBinsPage() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addBinOpen, setAddBinOpen] = useState(false);
  const [newBinId, setNewBinId] = useState('');
  const [newBinName, setNewBinName] = useState('');
  const [newBinCampus, setNewBinCampus] = useState('');
  const [addingBin, setAddingBin] = useState(false);

  const fetchBins = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bins');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBins((data.bins ?? []).map(normalizeBin));
      setError(null);
    } catch (err) {
      setError(`Failed to load bins: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBins();
    const interval = setInterval(fetchBins, 30_000);
    return () => clearInterval(interval);
  }, [fetchBins]);

  const registerBin = async () => {
    if (!newBinId.trim() || !newBinName.trim()) return;
    setAddingBin(true);
    try {
      const res = await fetch('/api/admin/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bin_id: newBinId.trim(), location_name: newBinName.trim(), campus: newBinCampus }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      const { bin } = await res.json();
      setBins((prev) => [normalizeBin(bin), ...prev]);
      setAddBinOpen(false);
      setNewBinId('');
      setNewBinName('');
      setNewBinCampus('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingBin(false);
    }
  };

  const filtered = bins.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
  });

  const criticalBins = bins.filter((b) => b.status === 'critical');
  const offlineBins  = bins.filter((b) => !b.online);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Smart Bins</h1>
          <p className="text-muted-foreground">Monitor and manage IoT-enabled waste bins</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search bins..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-64" />
          </div>
          <Dialog open={addBinOpen} onOpenChange={setAddBinOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" />Add Bin</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Smart Bin</DialogTitle>
                <DialogDescription>Add a new smart bin to the monitoring system.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="binId">Bin ID</Label>
                  <Input id="binId" placeholder="BIN-XXX" value={newBinId} onChange={(e) => setNewBinId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="binName">Name</Label>
                  <Input id="binName" placeholder="Enter bin name" value={newBinName} onChange={(e) => setNewBinName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={newBinCampus} onValueChange={setNewBinCampus}>
                    <SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="College of Science and Technology">College of Science and Technology</SelectItem>
                      <SelectItem value="Royal Thimphu College">Royal Thimphu College</SelectItem>
                      <SelectItem value="Jigme Namgyel Engineering College">Jigme Namgyel Engineering College</SelectItem>
                      <SelectItem value="Gaeddu College of Business Studies">Gaeddu College of Business Studies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={registerBin} disabled={addingBin || !newBinId.trim() || !newBinName.trim()}>
                  {addingBin ? 'Registering…' : 'Register Bin'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Trash2 className="w-5 h-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{loading ? '—' : bins.length}</p><p className="text-xs text-muted-foreground">Total Bins</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-5/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-chart-5" /></div>
              <div><p className="text-2xl font-bold">{loading ? '—' : bins.length - offlineBins.length}</p><p className="text-xs text-muted-foreground">Online</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
              <div><p className="text-2xl font-bold">{loading ? '—' : criticalBins.length}</p><p className="text-xs text-muted-foreground">Critical</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Activity className="w-5 h-5 text-accent" /></div>
              <div><p className="text-2xl font-bold">{loading ? '—' : bins.reduce((s, b) => s + b.todayDeposits, 0)}</p><p className="text-xs text-muted-foreground">Deposits Today</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(criticalBins.length > 0 || offlineBins.length > 0) && (
        <div className="space-y-3">
          {criticalBins.map((bin) => (
            <div key={bin.id} className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">{bin.name} is almost full</p>
                  <p className="text-sm text-muted-foreground">Fill level: {bin.fillLevel}%</p>
                </div>
              </div>
              <Button variant="destructive" size="sm">Schedule Pickup</Button>
            </div>
          ))}
          {offlineBins.map((bin) => (
            <div key={bin.id} className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{bin.name} is offline</p>
                  <p className="text-sm text-muted-foreground">Last sync: {bin.lastSync}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Diagnose</Button>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 rounded-xl border border-border/50 bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bin) => <BinCard key={bin.id} bin={bin} />)}
        </div>
      )}
    </div>
  );
}
