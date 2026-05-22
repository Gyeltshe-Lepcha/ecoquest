'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Battery, Wifi, WifiOff, AlertTriangle, CheckCircle2, Plus, Search, Settings, Activity, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const smartBins = [
    {
        id: 'BIN-001',
        name: 'CST Block A',
        location: 'College of Science and Technology, Main Building',
        fillLevel: 92,
        status: 'critical',
        lastSync: '2 min ago',
        online: true,
        totalDeposits: 1247,
        todayDeposits: 45,
        batteryLevel: 78,
    },
    {
        id: 'BIN-002',
        name: 'CST Canteen',
        location: 'College of Science and Technology, Canteen Area',
        fillLevel: 45,
        status: 'normal',
        lastSync: '5 min ago',
        online: true,
        totalDeposits: 2156,
        todayDeposits: 67,
        batteryLevel: 92,
    },
    {
        id: 'BIN-003',
        name: 'CST Library',
        location: 'College of Science and Technology, Library',
        fillLevel: 78,
        status: 'warning',
        lastSync: '3 min ago',
        online: true,
        totalDeposits: 892,
        todayDeposits: 32,
        batteryLevel: 65,
    },
    {
        id: 'BIN-004',
        name: 'RTC Main Hall',
        location: 'Royal Thimphu College, Main Hall',
        fillLevel: 23,
        status: 'normal',
        lastSync: '1 min ago',
        online: true,
        totalDeposits: 1578,
        todayDeposits: 54,
        batteryLevel: 88,
    },
    {
        id: 'BIN-005',
        name: 'RTC Library',
        location: 'Royal Thimphu College, Library',
        fillLevel: 85,
        status: 'warning',
        lastSync: '8 min ago',
        online: true,
        totalDeposits: 987,
        todayDeposits: 28,
        batteryLevel: 45,
    },
    {
        id: 'BIN-006',
        name: 'JNEC Canteen',
        location: 'Jigme Namgyel Engineering College',
        fillLevel: 56,
        status: 'normal',
        lastSync: '2 hours ago',
        online: false,
        totalDeposits: 765,
        todayDeposits: 0,
        batteryLevel: 12,
    },
];
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
        case 'critical':
            return { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/50' };
        case 'warning':
            return { text: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/50' };
        case 'normal':
            return { text: 'text-chart-5', bg: 'bg-chart-5/10', border: 'border-chart-5/50' };
        default:
            return { text: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' };
    }
}
function getFillColor(fillLevel) {
    if (fillLevel >= 80)
        return 'bg-destructive';
    if (fillLevel >= 60)
        return 'bg-accent';
    return 'bg-chart-5';
}
function BinCard({ bin }) {
    const statusColors = getStatusColor(bin.status);
    const [detailsOpen, setDetailsOpen] = useState(false);
    return (<>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Card className={`border-border/50 hover:shadow-lg transition-all cursor-pointer ${!bin.online && 'opacity-60'}`} onClick={() => setDetailsOpen(true)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${statusColors.bg} flex items-center justify-center`}>
                  <Trash2 className={`w-6 h-6 ${statusColors.text}`}/>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{bin.name}</h3>
                    {bin.online ? (<Wifi className="w-4 h-4 text-chart-5"/>) : (<WifiOff className="w-4 h-4 text-destructive"/>)}
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
                  <div className={`h-full rounded-full transition-all ${getFillColor(bin.fillLevel)}`} style={{ width: `${bin.fillLevel}%` }}/>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3"/>
                  <span>{bin.lastSync}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Battery className={`w-3 h-3 ${bin.batteryLevel < 20 ? 'text-destructive' : ''}`}/>
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

      {/* Bin Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className={`w-5 h-5 ${statusColors.text}`}/>
              {bin.name}
            </DialogTitle>
            <DialogDescription>{bin.location}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Fill Level</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${bin.fillLevel >= 80 ? 'text-destructive' :
            bin.fillLevel >= 60 ? 'text-accent' : 'text-chart-5'}`}>{bin.fillLevel}%</span>
                  {bin.fillLevel >= 80 && <AlertTriangle className="w-5 h-5 text-destructive"/>}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Connection</p>
                <div className="flex items-center gap-2">
                  {bin.online ? (<>
                      <CheckCircle2 className="w-5 h-5 text-chart-5"/>
                      <span className="font-medium text-chart-5">Online</span>
                    </>) : (<>
                      <WifiOff className="w-5 h-5 text-destructive"/>
                      <span className="font-medium text-destructive">Offline</span>
                    </>)}
                </div>
              </div>
            </div>

            {/* Usage Chart */}
            <div>
              <h4 className="font-medium mb-3">Today&apos;s Activity</h4>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageData}>
                    <defs>
                      <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                    <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10}/>
                    <YAxis stroke="var(--muted-foreground)" fontSize={10}/>
                    <Tooltip contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
        }}/>
                    <Area type="monotone" dataKey="deposits" stroke="var(--primary)" fillOpacity={1} fill="url(#colorDeposits)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Grid */}
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

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2">
                <RefreshCw className="w-4 h-4"/>
                Refresh Data
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Settings className="w-4 h-4"/>
                Configure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>);
}
export default function SmartBinsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [addBinOpen, setAddBinOpen] = useState(false);
    const criticalBins = smartBins.filter(b => b.status === 'critical');
    const warningBins = smartBins.filter(b => b.status === 'warning');
    const offlineBins = smartBins.filter(b => !b.online);
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Smart Bins</h1>
          <p className="text-muted-foreground">Monitor and manage IoT-enabled waste bins</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <Input placeholder="Search bins..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-64"/>
          </div>
          <Dialog open={addBinOpen} onOpenChange={setAddBinOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4"/>
                Add Bin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Smart Bin</DialogTitle>
                <DialogDescription>
                  Add a new smart bin to the monitoring system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="binId">Bin ID</Label>
                  <Input id="binId" placeholder="BIN-XXX"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="binName">Name</Label>
                  <Input id="binName" placeholder="Enter bin name"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campus"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cst">College of Science and Technology</SelectItem>
                      <SelectItem value="rtc">Royal Thimphu College</SelectItem>
                      <SelectItem value="jnec">Jigme Namgyel Engineering College</SelectItem>
                      <SelectItem value="gcbs">Gaeddu College of Business Studies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specificLocation">Specific Location</Label>
                  <Input id="specificLocation" placeholder="e.g., Main Building Entrance"/>
                </div>
                <Button className="w-full">Register Bin</Button>
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
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-primary"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{smartBins.length}</p>
                <p className="text-xs text-muted-foreground">Total Bins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-chart-5"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{smartBins.length - offlineBins.length}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalBins.length}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{smartBins.reduce((sum, b) => sum + b.todayDeposits, 0)}</p>
                <p className="text-xs text-muted-foreground">Deposits Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(criticalBins.length > 0 || offlineBins.length > 0) && (<div className="space-y-3">
          {criticalBins.map((bin) => (<div key={bin.id} className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive"/>
                <div>
                  <p className="font-medium text-destructive">{bin.name} is almost full</p>
                  <p className="text-sm text-muted-foreground">Fill level: {bin.fillLevel}%</p>
                </div>
              </div>
              <Button variant="destructive" size="sm">Schedule Pickup</Button>
            </div>))}
          {offlineBins.map((bin) => (<div key={bin.id} className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-muted-foreground"/>
                <div>
                  <p className="font-medium">{bin.name} is offline</p>
                  <p className="text-sm text-muted-foreground">Last sync: {bin.lastSync}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Diagnose</Button>
            </div>))}
        </div>)}

      {/* Bins Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {smartBins.map((bin) => (<BinCard key={bin.id} bin={bin}/>))}
      </div>
    </div>);
}
