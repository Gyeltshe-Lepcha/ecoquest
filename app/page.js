'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Camera,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Leaf,
  Menu,
  QrCode,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react';

const navItems = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#modules', label: 'Platform' },
  { href: '#iot', label: 'SmartBin' },
  { href: '#proof', label: 'Coverage' },
];

const ticker = [
  { label: 'Active Users', value: '2,001' },
  { label: 'SmartBins Online', value: '52' },
  { label: 'Challenges Done', value: '500' },
  { label: 'Waste Diverted', value: '500 kg' },
  { label: 'Badges Earned', value: '3,091' },
  { label: 'AI Verifications', value: '212' },
  { label: 'System Uptime', value: '99.9%' },
];

const metrics = [
  { label: 'Active users', value: '2,001', icon: Users, trend: '+12% this week' },
  { label: 'Smart bins', value: '52', icon: Cpu, trend: 'All campuses' },
  { label: 'Challenges done', value: '500', icon: Target, trend: 'And counting' },
  { label: 'Waste diverted', value: '500 kg', icon: Leaf, trend: 'Real impact' },
];

const modules = [
  {
    num: '01',
    title: 'Challenge Engine',
    body: 'Daily and weekly tasks with photo, smart bin, quiz, and peer-vote proof types. Every milestone mapped to SRS.',
    icon: Target,
    tag: 'FR-CHALL',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    num: '02',
    title: 'AI Verification',
    body: 'Confidence-gated approval: ≥70% auto-approves with instant EcoPoints. Below threshold — no award, try again.',
    icon: Bot,
    tag: 'FR-VER',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    num: '03',
    title: 'SmartBin+ IoT',
    body: 'IR auto-open lid, ESP32-CAM waste capture, ultrasonic fill sensing, LED bin-full alert, Wi-Fi sync.',
    icon: QrCode,
    tag: 'FR-IOT',
    accent: 'from-violet-500 to-purple-400',
  },
  {
    num: '04',
    title: 'Admin Command',
    body: 'Real-time submission review, challenge CRUD, bin monitoring, alert management, and CSV export.',
    icon: BarChart3,
    tag: 'FR-DASH',
    accent: 'from-amber-500 to-orange-400',
  },
];

const flowSteps = [
  { label: 'Challenge Assigned', body: 'Daily task appears with deadline, EcoPoints value, and proof type.', icon: Bell, step: '01' },
  { label: 'Bin Deposit', body: 'User approaches SmartBin — lid auto-opens, ESP32-CAM captures waste image.', icon: Camera, step: '02' },
  { label: 'AI Verifies', body: 'Model checks label + confidence ≥70%. Points awarded instantly if passed.', icon: ShieldCheck, step: '03' },
  { label: 'Leaderboard Updates', body: 'EcoPoints credited, badges unlock, streak advances in real time.', icon: Trophy, step: '04' },
];

const coverage = [
  'Email, phone, profile, password reset, and admin access screens (FR-ACC)',
  'Daily and weekly challenge cards with all four SRS proof types (FR-CHALL)',
  'AI confidence gate: ≥70% auto-approve, below threshold = reject with feedback (FR-VER)',
  'Leaderboard filters, badge collection, streaks, and EcoPoint milestones (FR-GAME)',
  'Admin challenge CRUD, submission review, bin alerts, CSV export (FR-DASH)',
  'REST route handlers + ESP32 firmware sketch for SmartBin prototype (FR-IOT)',
];

const liveEvents = [
  { time: '14:38', label: 'Bottle', confidence: 94.1, points: 25, status: 'approved' },
  { time: '14:33', label: 'Paper', confidence: 87.3, points: 20, status: 'approved' },
  { time: '14:27', label: 'Plastic', confidence: 78.9, points: 15, status: 'approved' },
  { time: '14:19', label: 'Unknown', confidence: 61.2, points: 0, status: 'rejected' },
  { time: '14:11', label: 'Bottle', confidence: 91.5, points: 25, status: 'approved' },
];

function HeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#e4fdf0_0%,#c5f0da_38%,#f5e9a8_58%,#d0f0c0_100%)]" />

      {[
        [14, 55, 0.22, 6.5],
        [54, 80, 0.15, 9],
        [87, 40, 0.18, 11],
      ].map(([leftPct, top, opacity, duration], i) => (
        <motion.div
          key={i}
          className="absolute h-24 w-24 rounded-full bg-white blur-3xl"
          style={{ left: `${leftPct}%`, top }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
          style={{ left: `${leftPct}%`, top, opacity, width: 96, height: 96 }}
        />
      ))}

      <motion.div
        className="absolute right-[16%] top-[11%] rounded-full bg-[radial-gradient(circle,#fff9c2_0%,#f7d76f_55%,rgba(247,215,111,0)_75%)]"
        style={{ width: 72, height: 72 }}
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg className="absolute bottom-0 h-[68%] w-full" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
        <polygon points="0,410 110,275 230,355 350,220 475,340 600,190 725,315 845,175 970,300 1085,250 1210,350 1330,275 1440,330 1440,600 0,600" fill="#8cc7a0" opacity="0.74" />
        <polygon points="350,220 374,244 397,229 377,210" fill="rgba(255,255,255,0.54)" />
        <polygon points="600,190 626,218 652,200 632,180" fill="rgba(255,255,255,0.48)" />
        <polygon points="845,175 875,204 902,187 878,164" fill="rgba(255,255,255,0.56)" />
        <polygon points="0,485 90,365 195,425 310,310 415,402 530,275 635,382 750,288 855,392 975,305 1090,410 1210,325 1325,402 1440,356 1440,600 0,600" fill="#43a66f" opacity="0.82" />
        <polygon points="0,558 75,455 165,505 268,415 380,488 490,395 610,465 727,380 830,455 950,385 1060,468 1175,398 1290,458 1385,418 1440,448 1440,600 0,600" fill="#126f55" />
        <rect x="0" y="558" width="1440" height="42" fill="#0f614c" />
      </svg>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,255,250,0.97)_0%,rgba(248,255,250,0.82)_44%,rgba(248,255,250,0.18)_80%,rgba(248,255,250,0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(0deg,#f6fbf5_0%,rgba(246,251,245,0)_100%)]" />

      <motion.div
        className="absolute bottom-[14%] right-[7%] hidden lg:block"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.85, delay: 0.4 }}
      >
        <div className="relative w-52">
          <motion.div
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.55)]" />
          </motion.div>

          <div className="relative mx-auto w-36 rounded-b-2xl border border-emerald-800/20 bg-[#0f513f] shadow-2xl shadow-emerald-900/20">
            <motion.div
              className="h-8 rounded-t-xl border border-emerald-700/30 bg-emerald-400"
              animate={{ rotate: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              style={{ transformOrigin: '8% 100%' }}
            />
            <div className="relative h-40 overflow-hidden rounded-b-2xl">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(0deg,rgba(167,243,208,0.65),rgba(16,185,129,0.12))]"
                animate={{ height: ['58%', '76%', '58%'] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-lime-300"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <div className="absolute right-2.5 top-2.5 rounded-full bg-white/15 px-2 py-0.5 font-mono text-xs text-white">72%</div>
              <div className="absolute inset-x-6 top-14 grid place-items-center rounded-xl border border-white/15 bg-white/10 py-4">
                <QrCode className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="p-2 text-center font-mono text-[9px] tracking-widest text-emerald-100">
              BIN-001 · ONLINE
            </div>
          </div>

          {[
            { label: 'Fill: 72%', cls: 'top-4 -right-4', delay: 0 },
            { label: 'QR Linked', cls: 'bottom-14 -left-6', delay: 1.1 },
            { label: 'Wi-Fi OK', cls: 'top-1/2 -right-10', delay: 2.2 },
          ].map((pill) => (
            <motion.div
              key={pill.label}
              className={`absolute ${pill.cls} rounded-full border border-emerald-200 bg-white/90 px-3 py-1 font-mono text-[10px] tracking-wider text-emerald-700 shadow-lg`}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: pill.delay }}
            >
              {pill.label}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'border-b border-emerald-100/80 bg-white/96 shadow-sm shadow-emerald-900/5 backdrop-blur-xl'
        : 'bg-white/72 backdrop-blur-md'
    }`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/IMG_2014.png" alt="EcoQuest Bhutan" className="h-16 w-16 object-cover mix-blend-multiply" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-semibold text-emerald-950/58 transition-colors hover:text-emerald-700">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login">
              <button className="rounded-xl border border-emerald-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 transition-all hover:border-emerald-400 hover:bg-emerald-50">
                Log in
              </button>
            </Link>
            <Link href="/register">
              <button
                className="bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-700"
                style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))' }}
              >
                Get Started
              </button>
            </Link>
          </div>

          <button className="rounded-lg p-2 text-emerald-800 hover:bg-emerald-50 md:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-emerald-100 pb-5"
            >
              <div className="space-y-3 pt-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block text-sm font-semibold text-emerald-900/70 hover:text-emerald-700">
                    {item.label}
                  </Link>
                ))}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href="/login"><button className="w-full rounded-xl border border-emerald-200 py-2.5 text-sm font-semibold text-emerald-900">Log in</button></Link>
                  <Link href="/register"><button className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white">Get Started</button></Link>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function StatsTicker() {
  const doubled = [...ticker, ...ticker];
  return (
    <div className="overflow-hidden border-y border-emerald-100 bg-white/90 backdrop-blur-sm">
      <motion.div
        className="flex w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 border-r border-emerald-100 px-10 py-3.5">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-emerald-900/42">{item.label}</span>
            <span className="font-mono text-sm font-black tracking-wide text-emerald-700">{item.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-px w-8 bg-emerald-500" />
      <span className="text-[11px] font-black uppercase tracking-[3.5px] text-emerald-600">{children}</span>
    </div>
  );
}

function LiveDashboard() {
  const [fillLevel, setFillLevel] = useState(72);
  const [activeEvent, setActiveEvent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEvent((e) => (e + 1) % liveEvents.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fill = setInterval(() => {
      setFillLevel((f) => (f >= 84 ? 62 : f + 1));
    }, 380);
    return () => clearInterval(fill);
  }, []);

  const event = liveEvents[activeEvent];

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-900/20 bg-[#0b3d2e] font-mono shadow-2xl shadow-emerald-900/30">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#082a1f] px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-rose-500/80" />
        <div className="h-3 w-3 rounded-full bg-amber-400/80" />
        <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-[11px] tracking-[2px] text-emerald-400/55">SMARTBIN LIVE — BIN-001</span>
        <motion.span
          className="ml-auto h-2 w-2 rounded-full bg-emerald-400"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[2px] text-emerald-500/65">Location</div>
            <div className="mt-0.5 text-sm font-bold text-emerald-100">CST Campus · Block A</div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5">
            <motion.div
              className="h-2 w-2 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <span className="text-[11px] font-bold text-emerald-300">ONLINE</span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[2px] text-emerald-500/65">Fill Level</span>
            <span className={`text-sm font-black ${fillLevel >= 80 ? 'text-rose-400' : 'text-emerald-300'}`}>{fillLevel}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-emerald-900/60">
            <motion.div
              className={`h-full rounded-full ${fillLevel >= 80 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
              animate={{ width: `${fillLevel}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {fillLevel >= 80 && (
            <motion.p
              className="mt-1.5 text-[10px] font-bold text-rose-400"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ⚠ Alert threshold reached — admin notified
            </motion.p>
          )}
        </div>

        <div className="border-t border-white/10" />

        <div>
          <div className="mb-2.5 text-[10px] uppercase tracking-[2px] text-emerald-500/65">Latest AI Detection</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEvent}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className={`rounded-xl border p-3.5 ${
                event.status === 'approved'
                  ? 'border-emerald-500/25 bg-emerald-500/10'
                  : 'border-rose-500/25 bg-rose-500/10'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-black text-emerald-100">{event.label}</span>
                <span className={`text-xs font-black ${event.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {event.status === 'approved' ? `+${event.points} EcoPoints` : 'Rejected'}
                </span>
              </div>
              <div className="mb-1.5 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-emerald-900/50">
                  <motion.div
                    className={`h-full rounded-full ${event.confidence >= 70 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${event.confidence}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-[11px] font-bold text-emerald-400/70">{event.confidence}%</span>
              </div>
              <div className="text-[10px] text-emerald-500/50">
                {event.time} · {event.status === 'approved' ? '✓ Confidence ≥70% — threshold met' : '✗ Confidence <70% — no points awarded'}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div>
          <div className="mb-2.5 text-[10px] uppercase tracking-[2px] text-emerald-500/65">Event Log</div>
          <div className="space-y-2">
            {liveEvents.slice(0, 4).map((e, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[11px]"
                style={{ opacity: 1 - i * 0.17 }}
              >
                <span className="w-10 text-emerald-500/50">{e.time}</span>
                <span className={`w-16 font-bold ${e.status === 'approved' ? 'text-emerald-300' : 'text-rose-400'}`}>{e.label}</span>
                <span className="text-emerald-500/45">{e.confidence}%</span>
                <span className={`ml-auto font-black ${e.status === 'approved' ? 'text-emerald-400' : 'text-rose-400/60'}`}>
                  {e.status === 'approved' ? `+${e.points}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], ['0%', '9%']);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#f6fbf5] text-emerald-950">
      <Header />

      {/* ── HERO ── */}
      <section className="relative min-h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <HeroScene />
        </motion.div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-24 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <motion.div
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-emerald-200 bg-white/78 px-4 py-2 shadow-sm backdrop-blur"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="text-[11px] font-black uppercase tracking-[2.5px] text-emerald-700">
                EcoTech Bhutan 2026
              </span>
            </motion.div>

            <h1 className="mb-6 text-6xl font-black leading-[0.92] tracking-tight text-emerald-950 sm:text-7xl lg:text-8xl">
              Zero <span className="text-emerald-600">Waste.</span>
              <br />
              <span className="text-emerald-950/16 [-webkit-text-stroke:2px_rgba(5,95,70,0.42)]">
                One Scan.
              </span>
            </h1>

            <p className="mb-10 max-w-lg text-lg leading-8 text-emerald-950/62">
              A gamified campus waste-reduction platform combining IoT smart bins, AI verification,
              and real-time leaderboards — built for Bhutan's universities.
            </p>

            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
            >
              <Link href="/register">
                <button
                  className="flex items-center gap-2.5 bg-emerald-600 px-7 py-3.5 text-sm font-black uppercase tracking-[1.5px] text-white shadow-xl shadow-emerald-900/22 transition-all hover:bg-emerald-700"
                  style={{ clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))' }}
                >
                  Start Your Quest <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/dashboard/challenges">
                <button className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-white/82 px-7 py-3.5 text-sm font-bold uppercase tracking-[1.5px] text-emerald-800 backdrop-blur transition-all hover:border-emerald-400 hover:bg-white">
                  View Dashboard <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </motion.div>

            <motion.p
              className="mt-6 text-[11px] font-bold uppercase tracking-[2px] text-emerald-950/32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52 }}
            >
              CST · GCIT · JNEC · GCBS · SCE · CNR
            </motion.p>
          </motion.div>
        </div>
      </section>

      <StatsTicker />

      {/* ── IMPACT METRICS ── */}
      <section id="experience" className="border-b border-emerald-100 bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-black uppercase tracking-[3px] text-emerald-600">Live Platform Metrics</p>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight text-emerald-950">Real Impact. Right Now.</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white px-6 py-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
              >
                <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-emerald-50/80" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <metric.icon className="h-5 w-5 text-emerald-700" />
                </div>
                <p className="mt-3 font-mono text-3xl font-black tracking-tight text-emerald-900">{metric.value}</p>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-[1.5px] text-emerald-950/42">{metric.label}</p>
                <span className="mt-2.5 inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                  {metric.trend}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-[#f6fbf5] py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel>How It Works</SectionLabel>
              <h2 className="mb-5 text-4xl font-black leading-tight tracking-tight text-emerald-950 sm:text-5xl">
                From Bin to Badge<br />in 60 Seconds.
              </h2>
              <p className="mb-8 text-base leading-7 text-emerald-950/58">
                The full challenge loop — deposit, verify, earn — plays out automatically.
                IoT, AI, and gamification work as one seamless system with no manual steps.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/challenges">
                  <button
                    className="flex items-center gap-2 bg-emerald-600 px-6 py-3 text-sm font-bold uppercase tracking-[1.5px] text-white transition-colors hover:bg-emerald-700"
                    style={{ clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))' }}
                  >
                    Try Challenges <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/admin/submissions">
                  <button className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-6 py-3 text-sm font-bold uppercase tracking-[1.5px] text-emerald-800 transition-colors hover:border-emerald-400 hover:bg-emerald-50">
                    Review Submissions
                  </button>
                </Link>
              </div>
            </motion.div>

            <div className="relative">
              <div className="absolute left-[29px] top-10 hidden h-[calc(100%-80px)] w-px bg-[linear-gradient(180deg,#10b981_0%,rgba(16,185,129,0.06)_100%)] lg:block" />
              <div className="flex flex-col gap-3">
                {flowSteps.map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-5 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                  >
                    <div
                      className="relative z-10 flex h-[58px] w-[58px] shrink-0 items-center justify-center bg-emerald-600 text-white shadow-lg shadow-emerald-900/15"
                      style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))' }}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 py-0.5">
                      <p className="mb-1 text-base font-black text-emerald-950">{step.label}</p>
                      <p className="text-sm leading-6 text-emerald-950/55">{step.body}</p>
                    </div>
                    <span className="shrink-0 pt-0.5 font-mono text-xs font-black text-emerald-500/35">{step.step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE MODULES ── */}
      <section id="modules" className="bg-white py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <SectionLabel>Platform Modules</SectionLabel>
            <h2 className="text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">
              Four Engines.<br />One System.
            </h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-emerald-950/55">
              Every module maps directly to the SRS specification — from challenge assignment to admin oversight.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-xl hover:shadow-emerald-900/10"
              >
                <div className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 rounded-t-2xl bg-gradient-to-r ${mod.accent} transition-transform duration-300 group-hover:scale-x-100`} />
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${mod.accent} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-15`} />
                <div className="mb-2 font-mono text-5xl font-black text-emerald-100">{mod.num}</div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <mod.icon className="h-5 w-5 text-emerald-700" />
                </div>
                <h3 className="mb-2 text-xl font-black text-emerald-950">{mod.title}</h3>
                <p className="text-sm leading-6 text-emerald-950/55">{mod.body}</p>
                <span className="mt-5 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[1.5px] text-emerald-600">
                  {mod.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IOT LIVE SYSTEM ── */}
      <section id="iot" className="bg-[#f6fbf5] py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel>IoT Hardware</SectionLabel>
              <h2 className="mb-4 text-4xl font-black leading-tight tracking-tight text-emerald-950 sm:text-5xl">
                The Bin That<br />Thinks.
              </h2>
              <p className="mb-8 text-base leading-7 text-emerald-950/58">
                An ESP32-powered SmartBin with IR auto-open, ESP32-CAM waste capture,
                ultrasonic fill detection, and live Wi-Fi sync. Every deposit triggers
                an AI verification loop automatically.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Zap, text: 'Auto-open lid within 15 cm via IR sensor + SG90 servo motor' },
                  { icon: Camera, text: 'ESP32-CAM captures waste image on every deposit for AI analysis' },
                  { icon: Cpu, text: 'HC-SR04 ultrasonic fill sensing — red LED alert at 80% capacity' },
                  { icon: Wifi, text: 'HTTP POST to backend with QR-linked user ID over campus Wi-Fi' },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white px-5 py-3.5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <item.icon className="h-4 w-4 text-emerald-700" />
                    </div>
                    <p className="text-sm leading-6 text-emerald-950/68">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
            >
              <LiveDashboard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SRS COVERAGE ── */}
      <section id="proof" className="bg-white py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel>SRS Coverage</SectionLabel>
              <h2 className="text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">Built to Spec.</h2>
              <p className="mt-3 max-w-lg text-base leading-7 text-emerald-950/55">
                Every screen, route, and module maps directly to a requirement in the SRS v1.0.
              </p>
            </motion.div>
            <Link href="/admin/settings">
              <button className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[1.5px] text-emerald-800 transition-all hover:border-emerald-400 hover:bg-emerald-50">
                Security Readiness <Zap className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {coverage.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-md"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="text-sm leading-6 text-emerald-950/68">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#0b3d2e] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-[2.5px] text-emerald-400">
                Join the Movement
              </span>
            </div>

            <h2 className="mb-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ready to Make Your<br />
              <span className="text-emerald-400">Campus Greener?</span>
            </h2>

            <p className="mx-auto mb-10 max-w-xl text-base leading-7 text-emerald-200/65">
              Join thousands of students already turning waste into wins.
              Every scan counts toward a cleaner, greener Bhutan.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <button
                  className="flex items-center gap-2.5 bg-emerald-500 px-8 py-4 text-sm font-black uppercase tracking-[2px] text-white shadow-xl shadow-emerald-900/40 transition-all hover:bg-emerald-400"
                  style={{ clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))' }}
                >
                  Create Account <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/admin">
                <button className="flex items-center gap-2.5 rounded-xl border border-emerald-500/35 bg-white/8 px-8 py-4 text-sm font-bold uppercase tracking-[1.5px] text-emerald-200 backdrop-blur transition-all hover:border-emerald-400/60 hover:bg-white/14">
                  Admin Dashboard <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-emerald-900/20 bg-[#082a1f] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center bg-emerald-500 text-white"
              style={{ clipPath: 'polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))' }}
            >
              <Leaf className="h-3.5 w-3.5" />
            </div>
            <span className="text-base font-black tracking-[1.5px] text-emerald-100">EcoQuest Bhutan</span>
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              { href: '/dashboard/badges', label: 'Badges' },
              { href: '/dashboard/leaderboard', label: 'Leaderboard' },
              { href: '/admin/bins', label: 'Smart Bins' },
              { href: '/reports/activity', label: 'CSV Export' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-xs font-bold uppercase tracking-[1.5px] text-emerald-400/55 transition-colors hover:text-emerald-400">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-emerald-500/38">
            Zero Waste · One Scan · 2026
          </p>
        </div>
      </footer>
    </main>
  );
}
