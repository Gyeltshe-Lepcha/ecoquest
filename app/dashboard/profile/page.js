'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, BadgeCheck, Building2, Camera, Flame, Leaf, Pencil, Save, Trophy, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { badgeCollection, campuses, users } from '@/lib/ecoquest-data';

const user = users[0];

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/5"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),var(--accent),var(--chart-4))]" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-primary text-xl text-primary-foreground">{user.avatar}</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                <Camera className="h-4 w-4 text-primary" />
              </button>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified user
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{user.campus} / {user.hostel}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{user.total_points.toLocaleString()} points</span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-accent">{user.streak_days}-day streak</span>
                <span className="rounded-full bg-chart-4/10 px-3 py-1 text-chart-4">Rank #12 CST</span>
              </div>
            </div>
          </div>
          <Button onClick={() => setEditing((value) => !value)} className="gap-2 self-start sm:self-center">
            {editing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {editing ? 'Save Profile' : 'Edit Profile'}
          </Button>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Profile Details</CardTitle>
            <CardDescription>Name, contact, campus, and hostel information from the SRS profile model.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue={user.name} disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email} disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={user.phone} disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label>Campus</Label>
              <Select disabled={!editing} defaultValue="cst">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.value} value={campus.value}>
                      {campus.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="hostel">Hostel / location group</Label>
              <Input id="hostel" defaultValue={user.hostel} disabled={!editing} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Impact Snapshot</CardTitle>
            <CardDescription>Fast progress signals for a first-time user.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Challenges complete', value: '47', icon: Trophy, color: 'text-primary' },
              { label: 'Current streak', value: `${user.streak_days} days`, icon: Flame, color: 'text-accent' },
              { label: 'Waste diverted', value: '12.5 kg', icon: Leaf, color: 'text-chart-5' },
              { label: 'Campus group', value: 'Kuenphen', icon: Building2, color: 'text-chart-4' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-5 w-5 text-accent" />
            Badge Collection
          </CardTitle>
          <CardDescription>Milestones are shown on the profile as required by the SRS.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {badgeCollection.map((badge, index) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-border/60 bg-muted/30 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="capitalize">{badge.rarity}</Badge>
              </div>
              <h3 className="font-semibold">{badge.name}</h3>
              <p className="mt-1 min-h-10 text-sm text-muted-foreground">{badge.milestone}</p>
              <Progress value={badge.progress} className="mt-4 h-2" />
              <p className="mt-2 text-xs text-muted-foreground">{badge.progress}% complete</p>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
