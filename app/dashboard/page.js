'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  BarChart3,
  Bike,
  Camera,
  CheckCircle2,
  Clock,
  Crown,
  Gift,
  GraduationCap,
  Leaf,
  Lock,
  Medal,
  Pizza,
  QrCode,
  Recycle,
  Sparkles,
  Star,
  Target,
  Ticket,
  Trophy,
  Wifi,
  Zap,
} from 'lucide-react';

const defaultCounts = {
  total: 124,
  plastic: 58,
  paper: 36,
  bottle: 22,
  unknown: 8,
};

const metricMeta = [
  { label: 'Total Waste Logged', value: '124', icon: BarChart3, bg: 'bg-emerald-100', color: 'text-emerald-700' },
  { label: 'Plastic Items', value: '58', icon: Recycle, bg: 'bg-sky-100', color: 'text-sky-700' },
  { label: 'Paper Items', value: '36', icon: GraduationCap, bg: 'bg-yellow-100', color: 'text-yellow-700' },
  { label: 'Bottle Items', value: '22', icon: Leaf, bg: 'bg-lime-100', color: 'text-lime-700' },
  { label: 'Unknown', value: '8', icon: Sparkles, bg: 'bg-rose-100', color: 'text-rose-700' },
];

const wasteBarMeta = [
  { label: 'Plastic', value: 58, color: 'bg-sky-400', text: 'text-sky-700' },
  { label: 'Paper', value: 36, color: 'bg-yellow-400', text: 'text-yellow-700' },
  { label: 'Bottle', value: 22, color: 'bg-lime-400', text: 'text-lime-700' },
  { label: 'Unknown', value: 8, color: 'bg-rose-400', text: 'text-rose-700' },
];

const leaderboard = [
  { rank: 1, name: 'Hostel A', points: '1,250', icon: Crown, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { rank: 2, name: 'Team Green', points: '1,040', icon: Medal, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { rank: 3, name: 'Class 2B', points: '880', icon: Trophy, color: 'bg-sky-100 text-sky-700 border-sky-200' },
];

const badges = [
  { name: 'Plastic Saver', icon: Recycle, unlocked: true, color: 'bg-sky-100 text-sky-700' },
  { name: 'Paper Hero', icon: GraduationCap, unlocked: true, color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Compost Starter', icon: Leaf, unlocked: true, color: 'bg-lime-100 text-lime-700' },
  { name: 'Streak Master', icon: Zap, unlocked: false, color: 'bg-slate-100 text-slate-400' },
];

const rewards = [
  { name: 'Canteen Coupon', icon: Ticket, status: 'Unlocked', color: 'text-yellow-700 bg-yellow-100' },
  { name: 'Eco Certificate', icon: Award, status: 'Ready', color: 'text-emerald-700 bg-emerald-100' },
  { name: 'Campus Recognition', icon: Star, status: 'Locked', color: 'text-slate-500 bg-slate-100' },
];

const insights = [
  { text: 'Canteen peak waste time: 1-2 PM', icon: Clock, bg: 'bg-sky-100', color: 'text-sky-700' },
  { text: 'Hostel A produces the most plastic waste', icon: Recycle, bg: 'bg-emerald-100', color: 'text-emerald-700' },
  { text: 'Paper waste increases before exams', icon: GraduationCap, bg: 'bg-yellow-100', color: 'text-yellow-700' },
];

function Card({ className = '', children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`rounded-lg border border-white/80 bg-white/88 shadow-xl shadow-emerald-900/6 backdrop-blur ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SmartBinIllustration() {
  return (
    <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,#dffaf0,#dff5ff_55%,#fff2ba)]">
      <motion.div
        className="absolute left-8 top-7 rounded-full bg-white/70 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        +10 pts
      </motion.div>
      <motion.div
        className="absolute right-8 top-10 text-yellow-400"
        animate={{ rotate: [0, 16, -8, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 2.8, repeat: Infinity }}
      >
        <Sparkles className="h-8 w-8 fill-current" />
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-10 text-emerald-500"
        animate={{ y: [0, -10, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Leaf className="h-9 w-9 fill-current" />
      </motion.div>
      <motion.div
        className="absolute bottom-12 right-11 text-sky-500"
        animate={{ y: [0, -8, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        <Recycle className="h-9 w-9" />
      </motion.div>

      <div className="relative w-32 rounded-b-lg border-4 border-emerald-800/15 bg-emerald-700 shadow-2xl shadow-emerald-900/20">
        <motion.div
          className="h-8 rounded-t-lg bg-emerald-400"
          animate={{ rotate: [0, -12, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.5 }}
          style={{ transformOrigin: '10% 100%' }}
        />
        <div className="relative h-36 overflow-hidden rounded-b">
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(0deg,#bbf7d0,#34d39933)]"
            animate={{ height: ['46%', '62%', '46%'] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="absolute left-1/2 top-9 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-lg bg-white/18">
            <QrCode className="h-9 w-9 text-white" />
          </div>
          <motion.div
            className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.8)]"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Waiting for first bin event';

  const delta = Date.now() - new Date(timestamp).getTime();
  if (Number.isNaN(delta)) return 'Just updated';

  const minutes = Math.max(0, Math.round(delta / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} mins ago`;

  const hours = Math.round(minutes / 60);
  return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
}

function WorkflowStep({ step, active }) {
  return (
    <div className={`rounded-lg border p-3 ${active ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <step.icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-black ${active ? 'text-emerald-900' : 'text-slate-800'}`}>{step.title}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{step.body}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [iotData, setIotData] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadIotData() {
      try {
        const response = await fetch('/api/iot/dashboard', { cache: 'no-store' });
        const result = await response.json();
        if (alive && response.ok) {
          setIotData(result);
        }
      } catch {
        if (alive) {
          setIotData(null);
        }
      }
    }

    loadIotData();
    const interval = setInterval(loadIotData, 8000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const counts = iotData?.counts?.total > 0 ? iotData.counts : defaultCounts;
  const latest = iotData?.latest;
  const latestLabel = latest?.label ? latest.label[0].toUpperCase() + latest.label.slice(1) : 'Plastic';
  const latestConfidence = latest?.confidence_pct ?? 91;
  const latestFillLevel = latest?.fill_level_pct ?? 62;
  const latestStatus = latest?.status === 'full' ? 'Full' : latest?.status === 'review_needed' ? 'Review' : 'Not Full';
  const ecoPoints = iotData?.profile?.eco_points ?? 320;
  const hasLiveEvent = Boolean(latest);
  const binIsFull = latestStatus === 'Full';
  const questProgress = Math.min(3, counts.plastic ?? 0);
  const questProgressPct = Math.round((questProgress / 3) * 100);
  const donutTotal = Math.max(1, counts.total);
  const plasticStop = (counts.plastic / donutTotal) * 100;
  const paperStop = plasticStop + (counts.paper / donutTotal) * 100;
  const bottleStop = paperStop + (counts.bottle / donutTotal) * 100;
  const donutBackground = `conic-gradient(#38bdf8 0 ${plasticStop}%, #facc15 ${plasticStop}% ${paperStop}%, #84cc16 ${paperStop}% ${bottleStop}%, #fb7185 ${bottleStop}% 100%)`;
  const workflowSteps = [
    {
      title: binIsFull ? 'Red LED: bin full' : 'Green LED: bin available',
      body: binIsFull ? 'The bin should stay closed until emptied.' : 'The dustbin is ready for the next campus quest.',
      icon: CheckCircle2,
      active: true,
    },
    {
      title: 'Ultrasonic checks person',
      body: hasLiveEvent ? 'Person/object detection has triggered the recent waste event.' : 'Waiting for distance below 25 cm.',
      icon: Wifi,
      active: hasLiveEvent,
    },
    {
      title: 'Servo opens lid',
      body: hasLiveEvent ? 'Lid opened for waste entry and then closed after the event.' : 'Servo remains closed until a person is near.',
      icon: Zap,
      active: hasLiveEvent,
    },
    {
      title: 'IR sensor detects waste',
      body: hasLiveEvent ? `${latestLabel} was captured from ${latest?.bin_id ?? 'BIN-001'}.` : 'IR sensor is waiting for an item to pass.',
      icon: Target,
      active: hasLiveEvent,
    },
    {
      title: 'Backend captures image',
      body: hasLiveEvent ? 'Laptop backend pulled a JPEG from ESP32-CAM.' : 'Next.js waits for the DevKit /log-waste call.',
      icon: Camera,
      active: hasLiveEvent,
    },
    {
      title: 'AI classifies waste',
      body: hasLiveEvent ? `${latestLabel} at ${latestConfidence}% confidence.` : 'Model service is ready at the verification step.',
      icon: Sparkles,
      active: hasLiveEvent,
    },
    {
      title: 'Dashboard updates',
      body: hasLiveEvent ? `Updated ${formatTimeAgo(latest?.created_at)}.` : 'Counts, trends, and points update after first event.',
      icon: BarChart3,
      active: hasLiveEvent,
    },
    {
      title: 'Backend success + buzzer',
      body: hasLiveEvent ? 'ESP32 receives success and can beep before repeat.' : 'Buzzer waits for backend success.',
      icon: Trophy,
      active: hasLiveEvent,
    },
  ];

  const metrics = useMemo(() => {
    const values = [counts.total, counts.plastic, counts.paper, counts.bottle, counts.unknown];
    return metricMeta.map((metric, index) => ({
      ...metric,
      value: String(values[index] ?? metric.value),
    }));
  }, [counts]);

  const wasteBars = useMemo(() => {
    const values = [counts.plastic, counts.paper, counts.bottle, counts.unknown];
    const max = Math.max(1, ...values);
    return wasteBarMeta.map((bar, index) => ({
      ...bar,
      value: values[index] ?? bar.value,
      width: `${Math.max(8, ((values[index] ?? bar.value) / max) * 100)}%`,
    }));
  }, [counts]);

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden p-0">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-black uppercase tracking-[1.8px] text-yellow-700">
                <Sparkles className="h-4 w-4" />
                Great sorting!
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-emerald-950 lg:text-5xl">
                Turn Waste Sorting Into a Campus Challenge
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                AI smart bins classify waste, reward eco-actions, and reveal campus waste patterns.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/dashboard/scan">
                  <button className="rounded-lg bg-emerald-600 px-5 py-3 font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-700">
                    View Smart Bin Activity
                  </button>
                </Link>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-700">Your team is catching up!</span>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-black text-yellow-700">{ecoPoints} EcoPoints</span>
              </div>
            </div>
            <SmartBinIllustration />
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[1.8px] text-emerald-700">Today&apos;s Quest</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Sort 3 plastic items correctly</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500">Almost there! {questProgress} / 3 completed from SmartBin events</p>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${questProgressPct}%` }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e,#38bdf8,#facc15)]"
            />
          </div>
          <div className="mt-5 flex items-center justify-between rounded-lg bg-emerald-50 p-4">
            <span className="text-sm font-bold text-slate-600">Reward</span>
            <span className="text-2xl font-black text-emerald-700">+25 EcoPoints</span>
          </div>
        </Card>
      </section>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[1.8px] text-emerald-700">Live IoT Workflow</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">From sensor trigger to dashboard update</h2>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${hasLiveEvent ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {hasLiveEvent ? 'Hardware linked' : 'Waiting for ESP32'}
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step) => (
            <WorkflowStep key={step.title} step={step} active={step.active} />
          ))}
        </div>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[1.8px] text-sky-700">AI Smart Bin Activity</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Latest detection: {latestLabel}</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{latestStatus}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
            <div className="space-y-3">
              {[
                { label: 'Confidence', value: `${latestConfidence}%`, width: `${latestConfidence}%`, color: 'bg-sky-400' },
                { label: 'Bin fill level', value: `${latestFillLevel}%`, width: `${latestFillLevel}%`, color: 'bg-emerald-400' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-600">{item.label}</span>
                    <span className="font-black text-slate-950">{item.value}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                  </div>
                </div>
              ))}
              <div className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Bin is ready.</div>
            </div>

            <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-sky-200 bg-sky-50">
              <div className="absolute inset-4 rounded-lg border-2 border-sky-300" />
              <motion.div
                className="absolute left-5 right-5 h-1 rounded-full bg-sky-400"
                animate={{ top: ['24%', '76%', '24%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              />
              <div className="grid h-full min-h-[160px] place-items-center">
                <div className="text-center">
                  <Camera className="mx-auto h-9 w-9 text-sky-600" />
                  <p className="mt-2 text-xs font-black uppercase tracking-[1.5px] text-sky-700">Camera Scan</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[1.8px] text-emerald-700">Waste Statistics</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Campus waste split</h2>
            </div>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">Live pattern</span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
            <div className="space-y-3">
              {wasteBars.map((bar) => (
                <div key={bar.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className={`font-black ${bar.text}`}>{bar.label}</span>
                    <span className="font-bold text-slate-500">{bar.value}</span>
                  </div>
                  <div className="h-7 overflow-hidden rounded-lg bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: bar.width }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7 }}
                      className={`flex h-full items-center justify-end rounded-lg pr-2 text-xs font-black text-white ${bar.color}`}
                    >
                      {bar.value}
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid place-items-center rounded-lg bg-slate-50 p-4">
              <div
                className="relative h-36 w-36 rounded-full"
                style={{
                  background: donutBackground,
                }}
              >
                <div className="absolute inset-5 grid place-items-center rounded-full bg-white text-center">
                  <p className="text-2xl font-black text-emerald-700">{counts.total}</p>
                  <p className="text-xs font-bold text-slate-500">items</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-slate-100 bg-white p-3">
                <metric.icon className={`mb-2 h-5 w-5 ${metric.color}`} />
                <p className="text-xl font-black text-slate-950">{metric.value}</p>
                <p className="text-xs font-semibold leading-4 text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[1.8px] text-yellow-700">Leaderboard</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Team competition</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">#2 today</span>
          </div>
          <div className="space-y-3">
            {leaderboard.map((row) => (
              <div key={row.rank} className={`flex items-center gap-3 rounded-lg border p-3 ${row.color}`}>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/70">
                  <row.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black">{row.name}</p>
                  <p className="text-xs font-bold opacity-70">Rank {row.rank}</p>
                </div>
                <p className="text-lg font-black">{row.points} pts</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-lg bg-sky-50 p-3 text-sm font-bold text-sky-700">Your team is catching up!</p>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[1.8px] text-emerald-700">Rewards and Badges</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Unlockable sustainability wins</h2>
            </div>
            <Gift className="h-7 w-7 text-yellow-500" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div key={badge.name} className={`relative rounded-lg p-4 ${badge.color}`}>
                  {!badge.unlocked && (
                    <div className="absolute right-2 top-2 rounded-full bg-white/80 p-1">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <badge.icon className="mb-3 h-7 w-7" />
                  <p className="text-sm font-black">{badge.name}</p>
                  <p className="mt-1 text-xs font-bold opacity-70">{badge.unlocked ? 'Unlocked' : 'Locked'}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div key={reward.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${reward.color}`}>
                      <reward.icon className="h-5 w-5" />
                    </div>
                    <p className="font-black text-slate-800">{reward.name}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-slate-500">{reward.status}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[1.8px] text-sky-700">Campus Insights</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Friendly sustainability nudges</h2>
          </div>
          <Bike className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {insights.map((insight) => (
            <div key={insight.text} className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm shadow-emerald-900/5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${insight.bg}`}>
                <insight.icon className={`h-5 w-5 ${insight.color}`} />
              </div>
              <p className="font-black text-slate-900">{insight.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-3">
        {['Great sorting!', 'Almost there!', 'Bin is ready.'].map((copy, index) => (
          <motion.div
            key={copy}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.08 }}
            className="rounded-lg border border-white/80 bg-white/80 p-4 text-center text-sm font-black text-emerald-700 shadow-sm shadow-emerald-900/5"
          >
            {copy}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
