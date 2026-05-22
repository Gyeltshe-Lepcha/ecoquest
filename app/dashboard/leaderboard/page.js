'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Medal, Flame, Users, Building, Crown, TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { cn } from '@/lib/utils';
const individualLeaderboard = [
    { rank: 1, prevRank: 1, name: 'Tshering Dorji', campus: 'CST', points: 2450, streak: 15, avatar: 'TD' },
    { rank: 2, prevRank: 3, name: 'Karma Wangmo', campus: 'RTC', points: 2280, streak: 12, avatar: 'KW' },
    { rank: 3, prevRank: 2, name: 'Pema Gyalpo', campus: 'CST', points: 2150, streak: 10, avatar: 'PG' },
    { rank: 4, prevRank: 5, name: 'Sonam Choden', campus: 'JNEC', points: 1980, streak: 8, avatar: 'SC' },
    { rank: 5, prevRank: 4, name: 'Dorji Wangchuk', campus: 'GCBS', points: 1875, streak: 7, avatar: 'DW' },
    { rank: 6, prevRank: 6, name: 'Kinley Zam', campus: 'SCE', points: 1790, streak: 9, avatar: 'KZ' },
    { rank: 7, prevRank: 9, name: 'Ugyen Tenzin', campus: 'CST', points: 1725, streak: 6, avatar: 'UT' },
    { rank: 8, prevRank: 7, name: 'Dechen Pelden', campus: 'RTC', points: 1680, streak: 5, avatar: 'DP' },
    { rank: 9, prevRank: 8, name: 'Sangay Dorji', campus: 'CNR', points: 1645, streak: 4, avatar: 'SD' },
    { rank: 10, prevRank: 11, name: 'Tashi Yangzom', campus: 'JNEC', points: 1590, streak: 6, avatar: 'TY' },
    { rank: 11, prevRank: 10, name: 'Pema Tshomo', campus: 'CST', points: 1545, streak: 3, avatar: 'PT' },
    { rank: 12, prevRank: 12, name: 'You', campus: 'CST', points: 1520, streak: 15, avatar: 'ME', isCurrentUser: true },
];
const campusLeaderboard = [
    { rank: 1, name: 'College of Science and Technology (CST)', members: 450, points: 45800, change: 'up' },
    { rank: 2, name: 'Royal Thimphu College (RTC)', members: 380, points: 42100, change: 'up' },
    { rank: 3, name: 'Jigme Namgyel Engineering College (JNEC)', members: 320, points: 38500, change: 'down' },
    { rank: 4, name: 'Gaeddu College of Business Studies (GCBS)', members: 290, points: 35200, change: 'same' },
    { rank: 5, name: 'Samtse College of Education (SCE)', members: 275, points: 32400, change: 'up' },
    { rank: 6, name: 'College of Natural Resources (CNR)', members: 240, points: 28900, change: 'down' },
];
function getRankChange(current, prev) {
    if (current < prev)
        return { icon: TrendingUp, color: 'text-chart-5', label: `+${prev - current}` };
    if (current > prev)
        return { icon: TrendingDown, color: 'text-destructive', label: `-${current - prev}` };
    return { icon: Minus, color: 'text-muted-foreground', label: '0' };
}
function getRankBadge(rank) {
    switch (rank) {
        case 1:
            return { icon: Crown, color: 'text-accent', bg: 'bg-accent/10' };
        case 2:
            return { icon: Medal, color: 'text-muted-foreground', bg: 'bg-muted' };
        case 3:
            return { icon: Medal, color: 'text-chart-3', bg: 'bg-chart-3/10' };
        default:
            return null;
    }
}
export default function LeaderboardPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [timeFilter, setTimeFilter] = useState('weekly');
    const currentUserRank = individualLeaderboard.find(u => u.isCurrentUser);
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you stack up against other eco-warriors</p>
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
        </div>
      </div>

      {/* Your Position Card */}
      {currentUserRank && (<Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  #{currentUserRank.rank}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Current Rank</p>
                  <p className="text-lg font-semibold">Top 5% of {currentUserRank.campus}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{currentUserRank.points.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">total points</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent"/>
                <span className="text-sm font-medium">{currentUserRank.streak} day streak</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {individualLeaderboard[currentUserRank.rank - 2]?.points - currentUserRank.points || 0} points to rank #{currentUserRank.rank - 1}
              </p>
            </div>
          </CardContent>
        </Card>)}

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4">
        {individualLeaderboard.slice(0, 3).map((user, index) => {
            const badge = getRankBadge(user.rank);
            const positions = [1, 0, 2]; // Silver, Gold, Bronze ordering
            const actualIndex = positions[index];
            const actualUser = individualLeaderboard[actualIndex];
            const actualBadge = getRankBadge(actualUser.rank);
            return (<motion.div key={actualUser.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={cn("flex flex-col items-center", actualUser.rank === 1 ? "-mt-4" : "mt-4")}>
              <div className={cn("relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mb-3", actualBadge?.bg)}>
                {actualBadge && <actualBadge.icon className={cn("w-8 h-8 lg:w-10 lg:h-10", actualBadge.color)}/>}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center text-xs font-bold">
                  {actualUser.rank}
                </div>
              </div>
              <Avatar className="w-12 h-12 lg:w-14 lg:h-14 mb-2">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {actualUser.avatar}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold text-sm lg:text-base text-center truncate max-w-full px-2">
                {actualUser.name}
              </p>
              <p className="text-xs text-muted-foreground">{actualUser.campus}</p>
              <p className="text-lg font-bold text-primary mt-1">{actualUser.points.toLocaleString()}</p>
            </motion.div>);
        })}
      </div>

      {/* Tabs for Individual vs Campus */}
      <Tabs defaultValue="individual" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="individual" className="gap-2">
              <Users className="w-4 h-4"/>
              Individual
            </TabsTrigger>
            <TabsTrigger value="campus" className="gap-2">
              <Building className="w-4 h-4"/>
              Campus
            </TabsTrigger>
          </TabsList>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-48"/>
          </div>
        </div>

        <TabsContent value="individual">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {individualLeaderboard.slice(3).map((user) => {
            const rankChange = getRankChange(user.rank, user.prevRank);
            return (<div key={user.rank} className={cn("flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors", user.isCurrentUser && "bg-primary/5")}>
                      <div className="w-8 text-center font-bold text-muted-foreground">
                        {user.rank}
                      </div>
                      <div className="w-8 flex items-center justify-center">
                        <rankChange.icon className={cn("w-4 h-4", rankChange.color)}/>
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={cn("font-medium", user.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("font-medium truncate", user.isCurrentUser && "text-primary")}>
                            {user.name}
                          </p>
                          {user.isCurrentUser && (<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              You
                            </span>)}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.campus}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Flame className="w-4 h-4 text-accent"/>
                        {user.streak}
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-semibold">{user.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>);
        })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campus">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {campusLeaderboard.map((campus) => {
            const badge = getRankBadge(campus.rank);
            return (<div key={campus.rank} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted">
                        {badge ? (<badge.icon className={cn("w-5 h-5", badge.color)}/>) : (<span className="font-bold text-muted-foreground">{campus.rank}</span>)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{campus.name}</p>
                        <p className="text-sm text-muted-foreground">{campus.members} members</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {campus.change === 'up' && <TrendingUp className="w-4 h-4 text-chart-5"/>}
                        {campus.change === 'down' && <TrendingDown className="w-4 h-4 text-destructive"/>}
                        {campus.change === 'same' && <Minus className="w-4 h-4 text-muted-foreground"/>}
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="font-semibold">{campus.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">total points</p>
                      </div>
                    </div>);
        })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);
}
