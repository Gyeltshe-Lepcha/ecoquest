'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bot, Download, KeyRound, Lock, RadioTower, ShieldCheck, SlidersHorizontal, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

const apiChecks = [
  'JWT auth guard for user endpoints',
  'Admin role guard for challenge and report endpoints',
  'Device token guard for SmartBin+ endpoints',
  'Photo upload malware scan before AI verification',
  'HTTPS-only deployment configuration',
];

const DEFAULT_SETTINGS = {
  ai_confidence_threshold: 70,
  ai_review_threshold: 70,
  offline_retry_buffer: true,
  bin_full_alert: true,
  demo_mode_local_fallback: true,
  demo_mode_simulate_latency: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'saved' | null
  const debounceRef = useRef(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSettings({ ...DEFAULT_SETTINGS, ...(data.settings ?? {}) });
    } catch (err) {
      setError(`Failed to load settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const persistSetting = useCallback(async (key, value) => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      setError(err.message);
      setSaveStatus(null);
    }
  }, []);

  const handleSliderCommit = (key, [value]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persistSetting(key, value), 400);
  };

  const handleToggle = (key, checked) => {
    setSettings((prev) => ({ ...prev, [key]: checked }));
    persistSetting(key, checked);
  };

  const THRESHOLD_PCT = settings.ai_confidence_threshold ?? 70;
  const REVIEW_PCT = settings.ai_review_threshold ?? 70;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Security, AI verification, exports, and device operations.</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          {saveStatus === 'saving' && <span className="text-xs text-muted-foreground">Saving…</span>}
          {saveStatus === 'saved' && <span className="text-xs text-chart-5">Saved</span>}
          <Button asChild variant="outline" className="gap-2">
            <a href="/reports/activity">
              <Download className="h-4 w-4" />
              Export activity CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        {/* AI Thresholds */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5 text-primary" />
              AI Verification Thresholds
            </CardTitle>
            <CardDescription>Photo proof routes follow the SRS confidence decision logic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Auto-approve threshold</Label>
                <span className="font-semibold text-chart-5">{THRESHOLD_PCT}%</span>
              </div>
              <Slider
                value={[THRESHOLD_PCT]}
                min={50}
                max={100}
                step={1}
                disabled={loading}
                onValueCommit={(v) => handleSliderCommit('ai_confidence_threshold', v)}
                onValueChange={([v]) => setSettings((prev) => ({ ...prev, ai_confidence_threshold: v }))}
              />
              <p className="mt-2 text-sm text-muted-foreground">Submissions above this score get points immediately.</p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Admin review threshold</Label>
                <span className="font-semibold text-accent">{REVIEW_PCT}%</span>
              </div>
              <Slider
                value={[REVIEW_PCT]}
                min={0}
                max={THRESHOLD_PCT}
                step={1}
                disabled={loading}
                onValueCommit={(v) => handleSliderCommit('ai_review_threshold', v)}
                onValueChange={([v]) => setSettings((prev) => ({ ...prev, ai_review_threshold: v }))}
              />
              <p className="mt-2 text-sm text-muted-foreground">Scores below 50% ask the user to try again; 50% and above are accepted.</p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-accent-foreground">
              <div className="mb-1 flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4 text-accent" />
                Fallback enabled
              </div>
              If the AI service is unavailable, all photo submissions are routed to admin review.
            </div>
          </CardContent>
        </Card>

        {/* Device Operations */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RadioTower className="h-5 w-5 text-chart-4" />
              Device Operations
            </CardTitle>
            <CardDescription>SmartBin+ sync and alert configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Device token prefix</Label>
              <Input id="token" defaultValue="eq-device-live-" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Offline retry buffer</p>
                  <p className="text-sm text-muted-foreground">ESP32 stores events and syncs when Wi-Fi returns.</p>
                </div>
              </div>
              <Switch
                checked={Boolean(settings.offline_retry_buffer)}
                onCheckedChange={(checked) => handleToggle('offline_retry_buffer', checked)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
              <div>
                <p className="font-medium">Admin bin-full alert</p>
                <p className="text-sm text-muted-foreground">Notify admins when fill level exceeds 80%.</p>
              </div>
              <Switch
                checked={Boolean(settings.bin_full_alert)}
                onCheckedChange={(checked) => handleToggle('bin_full_alert', checked)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Checklist */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-chart-5" />
            SRS Security Readiness
          </CardTitle>
          <CardDescription>Prototype checklist for the production backend handoff.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {apiChecks.map((check) => (
            <div key={check} className="rounded-lg border border-border/60 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-chart-5/10">
                {check.includes('JWT') || check.includes('Admin') ? (
                  <Lock className="h-4 w-4 text-chart-5" />
                ) : (
                  <KeyRound className="h-4 w-4 text-chart-5" />
                )}
              </div>
              <p className="text-sm font-medium">{check}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Demo Mode */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="h-5 w-5 text-accent" />
            Demo Mode
          </CardTitle>
          <CardDescription>Keep the hackathon demo reliable while API and hardware are being swapped in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Use local JSON backup during demos</p>
              <p className="text-sm text-muted-foreground">Fallback if the managed database is unavailable.</p>
            </div>
            <Switch
              checked={Boolean(settings.demo_mode_local_fallback)}
              onCheckedChange={(checked) => handleToggle('demo_mode_local_fallback', checked)}
              disabled={loading}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Simulate AI latency under 5 seconds</p>
              <p className="text-sm text-muted-foreground">Matches SRS performance target for verification.</p>
            </div>
            <Switch
              checked={Boolean(settings.demo_mode_simulate_latency)}
              onCheckedChange={(checked) => handleToggle('demo_mode_simulate_latency', checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
