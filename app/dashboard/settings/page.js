'use client';

import { Bell, CheckCircle2, Languages, LockKeyhole, MailCheck, Shield, Smartphone, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const notificationSettings = [
  { label: 'New challenge assigned', description: 'In-app alert when daily and weekly challenges arrive.', icon: Bell, checked: true },
  { label: 'Deadline reminder', description: 'Reminder two hours before a challenge expires.', icon: MailCheck, checked: true },
  { label: 'Verification result', description: 'Approved, rejected, or pending updates after proof is checked.', icon: CheckCircle2, checked: true },
  { label: 'Badge earned', description: 'Celebrate milestone badges when they unlock.', icon: Trophy, checked: false },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Notifications, security, language, and account preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>SRS reminder and verification result alerts for users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationSettings.map((setting) => (
              <div key={setting.label} className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
                <div className="flex items-start gap-3">
                  <setting.icon className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <Switch defaultChecked={setting.checked} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-chart-4" />
                Security
              </CardTitle>
              <CardDescription>Password reset and session safety.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input id="current-password" type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" placeholder="Minimum 8 characters" />
              </div>
              <Button className="w-full gap-2">
                <LockKeyhole className="h-4 w-4" />
                Update password
              </Button>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Persistent session</p>
                  <p className="text-sm text-muted-foreground">Stay signed in until logout.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Languages className="h-5 w-5 text-accent" />
                Experience
              </CardTitle>
              <CardDescription>English is required; Dzongkha is a stretch goal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="dz" disabled>Dzongkha (stretch goal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Mobile-first controls</p>
                    <p className="text-sm text-muted-foreground">Keep key actions within three taps.</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
