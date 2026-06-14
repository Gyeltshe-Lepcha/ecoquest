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
  { href: '#experience', label: 'Experience' },
  { href: '#modules', label: 'Modules' },
  { href: '#flow', label: 'Gamification' },
  { href: '#requirements', label: 'Sustainable' },
];

const ticker = [
  { label: 'Active Users', value: '2001' },
  { label: 'SmartBins Online', value: '52' },
  { label: 'Challenges Done', value: '500' },
  { label: 'Waste Diverted', value: '500 kg' },
  { label: 'Badges Earned', value: '3,091' },
  { label: 'AI Verifications', value: '212' },
  { label: 'System Uptime', value: '99%' },
];

const metrics = [
  { label: 'Active users', value: '2,001', icon: Users },
  { label: 'Smart bins', value: '52', icon: Cpu },
  { label: 'Challenges done', value: '500', icon: Target },
  { label: 'Waste diverted', value: '500 kg', icon: Leaf },
];

const modules = [
  {
    num: '01',
    title: 'Challenge Engine',
    body: 'Daily and weekly tasks with photo, smart bin, quiz, and peer-vote proof types. Fully spec-aligned.',
    icon: Target,
    tag: 'FR-CHALL',
  },
  {
    num: '02',
    title: 'AI Verification',
    body: 'Confidence tiers: auto-approve above 85%, admin review at 50-85%, friendly reject below 50%.',
    icon: Bot,
    tag: 'FR-VER',
  },
  {
    num: '03',
    title: 'SmartBin+ IoT',
    body: 'QR/NFC deposit linking, fill-level sensing every 5 min, LED alerts, ESP32 sync over Wi-Fi.',
    icon: QrCode,
    tag: 'FR-IOT',
  },
  {
    num: '04',
    title: 'Admin Command',
    body: 'Submission review, challenge CRUD, bin alerts, CSV export, and full user oversight.',
    icon: BarChart3,
    tag: 'FR-DASH',
  },
];

const flowSteps = [
  { label: 'Challenge Assigned', body: 'Daily task appears with deadline, points, and proof type.', icon: Bell },
  { label: 'Proof Submitted', body: 'User uploads photo or taps bin QR to log the deposit.', icon: Camera },
  { label: 'AI Verifies', body: 'Confidence score routes to auto-approve or admin review.', icon: ShieldCheck },
  { label: 'Points and Badges', body: 'Leaderboard updates, streaks tick, badges unlock in real time.', icon: Trophy },
];

const coverage = [
  'Email, phone, profile, password reset, and admin access screens (FR-ACC)',
  'Daily and weekly challenge cards with all four SRS proof types (FR-CHALL)',
  'AI confidence tiers: approve >85%, review 50-85%, reject <50% (FR-VER)',
  'Leaderboard filters, badge collection, streaks, and point progress (FR-GAME)',
  'Admin challenge CRUD, submission review, bins, alerts, CSV export (FR-DASH)',
  'REST route handlers plus ESP32 firmware sketch for SmartBin prototype (FR-IOT)',
];

function HeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#e9fff5_0%,#c8f4df_42%,#f7e7ae_56%,#d7f3ca_100%)]" />

      <div className="absolute inset-0">
        {[
          [80, 68, 30, 0.24],
          [230, 115, 40, 0.2],
          [560, 70, 46, 0.16],
          [910, 130, 32, 0.16],
          [1120, 78, 42, 0.18],
        ].map(([left, top, size, opacity], index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-white blur-2xl"
            style={{ left: `${left / 12}%`, top, width: size, height: size, opacity }}
            animate={{ y: [0, -12, 0], opacity: [opacity, opacity * 1.45, opacity] }}
            transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        className="absolute right-[14%] top-[12%] h-20 w-20 rounded-full bg-[radial-gradient(circle,#fff7c2_0%,#f7d76f_55%,rgba(247,215,111,0)_72%)]"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg
        className="absolute bottom-0 h-[70%] w-full"
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="0,410 110,275 230,355 350,220 475,340 600,190 725,315 845,175 970,300 1085,250 1210,350 1330,275 1440,330 1440,600 0,600"
          fill="#8cc7a0"
          opacity="0.74"
        />
        <polygon points="350,220 374,244 397,229 377,210" fill="rgba(255,255,255,0.54)" />
        <polygon points="600,190 626,218 652,200 632,180" fill="rgba(255,255,255,0.48)" />
        <polygon points="845,175 875,204 902,187 878,164" fill="rgba(255,255,255,0.56)" />

        <polygon
          points="0,485 90,365 195,425 310,310 415,402 530,275 635,382 750,288 855,392 975,305 1090,410 1210,325 1325,402 1440,356 1440,600 0,600"
          fill="#43a66f"
          opacity="0.78"
        />

        <polygon
          points="0,558 75,455 165,505 268,415 380,488 490,395 610,465 727,380 830,455 950,385 1060,468 1175,398 1290,458 1385,418 1440,448 1440,600 0,600"
          fill="#126f55"
        />
        <rect x="0" y="558" width="1440" height="42" fill="#0f614c" />
      </svg>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,255,250,0.96)_0%,rgba(248,255,250,0.78)_42%,rgba(248,255,250,0.2)_82%,rgba(248,255,250,0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,#f6fbf5_0%,rgba(246,251,245,0)_100%)]" />

      <motion.div
        className="absolute bottom-[15%] right-[7%] hidden lg:block"
        initial={{ opacity: 0, x: 46 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.35 }}
      >
        <div className="relative w-56">
          <motion.div
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.55)]" />
          </motion.div>
          <motion.div
            className="absolute left-1/2 top-1/2 h-88 w-88 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-500/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-teal-500/70" />
          </motion.div>

          <div className="relative mx-auto w-36 rounded-b-2xl border border-emerald-800/20 bg-[#0f513f] shadow-2xl shadow-emerald-900/20">
            <motion.div
              className="h-8 rounded-t-xl border border-emerald-700/30 bg-emerald-400"
              animate={{ rotate: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              style={{ transformOrigin: '8% 100%' }}
            />
            <div className="relative h-40 overflow-hidden rounded-b-2xl">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(0deg,rgba(167,243,208,0.65),rgba(16,185,129,0.12))]"
                animate={{ height: ['58%', '74%', '58%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute left-4 top-4 h-2.5 w-2.5 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.75)]" />
              <div className="absolute right-3 top-3 rounded-full bg-white/15 px-2 py-0.5 font-mono text-xs text-white">72%</div>
              <div className="absolute inset-x-6 top-16 grid place-items-center rounded-xl border border-white/15 bg-white/10 py-4">
                <QrCode className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="p-2 text-center font-mono text-[9px] tracking-widest text-emerald-100">
              BIN-001 - ONLINE
            </div>
          </div>

          {[
            { label: 'Fill: 72%', cls: 'top-4 -right-3' },
            { label: 'QR Linked', cls: 'bottom-16 -left-5' },
            { label: 'Wi-Fi OK', cls: 'top-1/2 -right-8' },
          ].map((pill, index) => (
            <motion.div
              key={pill.label}
              className={`absolute ${pill.cls} rounded-full border border-emerald-200 bg-white/90 px-3 py-1 font-mono text-[10px] tracking-widest text-emerald-700 shadow-lg shadow-emerald-900/10`}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: index * 1.1 }}
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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.9)_38%,rgba(236,253,245,0.82)_100%)] backdrop-blur-xl'
          : 'bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.72)_38%,rgba(236,253,245,0.62)_100%)] backdrop-blur-md'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/IMG_2014.png"
              alt="EcoQuest Bhutan"
              className="h-16 w-16 object-cover mix-blend-multiply"
            />
          </Link>
       
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-emerald-950/62 transition-colors hover:text-emerald-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login">
              <button className="rounded-md border border-emerald-200 bg-white/60 px-4 py-2 text-sm font-semibold text-emerald-900 transition-all hover:border-emerald-400 hover:bg-emerald-50">
                Log in
              </button>
            </Link>
            <Link href="/register">
              <button
                className="bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition-all hover:bg-emerald-700"
                style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))' }}
              >
                Signup
              </button>
            </Link>
          </div>

          <button className="p-2 text-emerald-800 md:hidden" onClick={() => setOpen((value) => !value)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-emerald-100 pb-4"
            >
              <div className="space-y-3 pt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block text-sm font-medium text-emerald-900/70 hover:text-emerald-700"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href="/login">
                    <button className="w-full rounded-md border border-emerald-200 bg-white py-2 text-sm font-semibold text-emerald-900">
                      Log in
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="w-full rounded-md bg-emerald-600 py-2 text-sm font-bold text-white">
                      Signup
                    </button>
                  </Link>
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
    <div className="overflow-hidden border-y border-emerald-100 bg-white">
      <motion.div
        className="flex w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, index) => (
          <div key={index} className="flex items-center gap-3 border-r border-emerald-100 px-10 py-3.5">
            <span className="text-xs font-semibold uppercase tracking-[2px] text-emerald-900/48">{item.label}</span>
            <span className="font-mono text-sm font-bold tracking-[1px] text-emerald-700">{item.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="h-px w-7 bg-emerald-500" />
      <span className="text-xs font-bold uppercase tracking-[3px] text-emerald-700">{children}</span>
    </div>
  );
}

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], ['0%', '10%']);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#f6fbf5] text-emerald-950">
      <Header />

      <section className="relative min-h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <HeroScene />
        </motion.div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-end px-6 pb-24 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <motion.div
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-200 bg-white/70 px-3.5 py-1.5 shadow-sm shadow-emerald-900/5 backdrop-blur"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="text-xs font-bold uppercase tracking-[2px] text-emerald-700">
                EcoTech Bhutan 2026
              </span>
            </motion.div>

            <h1 className="mb-6 text-6xl font-black leading-[0.95] tracking-normal text-emerald-950 sm:text-7xl lg:text-8xl">
              Zero <span className="text-emerald-600">Waste</span>
              <br />
              <span className="text-emerald-950/20 [-webkit-text-stroke:2px_rgba(5,95,70,0.48)]">One Scan</span>
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-8 text-emerald-950/68">
              A gamified campus waste-reduction platform connecting real IoT action with AI verification,
              digital rewards, and leaderboard glory, built for Bhutan.
            </p>

          </motion.div>
        </div>
      </section>

      <StatsTicker />

      <section id="experience" className="border-b border-emerald-100 bg-emerald-50/70">
        <div className="mx-auto max-w-7xl px-6 py-7">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="flex items-center gap-4 rounded-lg border border-emerald-100 bg-white px-5 py-4 shadow-sm shadow-emerald-900/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <metric.icon className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <p className="font-mono text-xl font-bold text-emerald-800">{metric.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-[1.5px] text-emerald-950/45">{metric.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="bg-[#f6fbf5] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <SectionLabel>Core Modules</SectionLabel>
            <h2 className="text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">The System, Broken Down</h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-emerald-950/60">
              Four engines working in sync, from challenge to bin to badge. Every module maps directly to the SRS.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group relative rounded-lg border border-emerald-100 bg-white p-7 shadow-sm shadow-emerald-900/5 transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10"
              >
                <span className="absolute left-0 right-0 top-0 h-[3px] origin-left scale-x-0 rounded-t-lg bg-emerald-500 transition-transform duration-300 group-hover:scale-x-100" />
                <div className="mb-1 text-5xl font-black text-emerald-500">{module.num}</div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <module.icon className="h-5 w-5 text-emerald-700" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-emerald-950">{module.title}</h3>
                <p className="text-sm leading-6 text-emerald-950/58">{module.body}</p>
                <span className="mt-4 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[1.5px] text-emerald-700">
                  {module.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.6fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel>Demo Flow</SectionLabel>
              <h2 className="mb-4 text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">
                A Full Challenge Loop, Ready to Present
              </h2>
              <p className="mb-8 text-base leading-7 text-emerald-950/62">
                From challenge assignment to admin dashboard update, the entire system plays out in under a minute.
                Proof types, AI tiers, and badge unlocks all feel live.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/challenges">
                  <button
                    className="flex items-center gap-2 bg-emerald-600 px-6 py-2.5 text-sm font-bold uppercase tracking-[1.5px] text-white transition-colors hover:bg-emerald-700"
                    style={{ clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))' }}
                  >
                    Try Challenges <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/admin/submissions">
                  <button className="flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-6 py-2.5 text-sm font-bold uppercase tracking-[1.5px] text-emerald-800 transition-colors hover:border-emerald-400 hover:bg-emerald-50">
                    Review Submissions
                  </button>
                </Link>
              </div>
            </motion.div>

            <div className="relative">
              <div className="absolute left-8 top-8 hidden h-[calc(100%-64px)] w-px bg-[linear-gradient(180deg,#10b981,rgba(16,185,129,0.12))] lg:block" />
              <div className="flex flex-col gap-4">
                {flowSteps.map((step, index) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-5 rounded-lg border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm shadow-emerald-900/5 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <div
                      className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center bg-emerald-600 text-white shadow-lg shadow-emerald-900/15"
                      style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))' }}
                    >
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="mb-1 text-lg font-bold text-emerald-950">{step.label}</p>
                      <p className="text-sm leading-6 text-emerald-950/58">{step.body}</p>
                    </div>
                    <div className="ml-auto shrink-0 font-mono text-xs font-bold text-emerald-700/42">
                      0{index + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-50/70 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel>IoT Hardware</SectionLabel>
              <h2 className="mb-4 text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">The Bin That Knows</h2>
              <p className="mb-8 text-base leading-7 text-emerald-950/62">
                An ESP32-powered dustbin with IR auto-open, ultrasonic fill detection, LED alerts,
                QR/NFC user linking, and Wi-Fi sync to the backend every 5 minutes.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Zap, text: 'Auto-open lid within 15 cm via IR sensor + SG90 servo' },
                  { icon: Cpu, text: 'HC-SR04 ultrasonic fill level, red LED alert at 80%+' },
                  { icon: Wifi, text: 'HTTP POST to /bins/:id/deposit with QR-linked user ID' },
                  { icon: Radio, text: 'Offline local storage on ESP32, syncs on reconnect' },
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center gap-4 rounded-lg border border-emerald-100 bg-white px-5 py-3.5 shadow-sm shadow-emerald-900/5 transition-colors hover:border-emerald-300"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <item.icon className="h-4 w-4 text-emerald-700" />
                    </div>
                    <p className="text-sm text-emerald-950/72">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center py-8"
            >
              <div className="relative flex h-80 w-80 items-center justify-center">
                {[280, 220, 160].map((size, index) => (
                  <motion.div
                    key={size}
                    className="absolute rounded-full border border-emerald-500/14"
                    style={{ width: size, height: size }}
                    animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 20 + index * 8, repeat: Infinity, ease: 'linear' }}
                  >
                    <div
                      className="absolute h-2.5 w-2.5 rounded-full bg-emerald-500"
                      style={{
                        top: '50%',
                        left: index % 2 === 0 ? '-5px' : 'calc(100% - 5px)',
                        transform: 'translateY(-50%)',
                        boxShadow: '0 0 10px rgba(16,185,129,0.6)',
                        opacity: 1 - index * 0.25,
                      }}
                    />
                  </motion.div>
                ))}

                <div className="relative z-10 w-36 rounded-b-2xl shadow-2xl shadow-emerald-900/20">
                  <motion.div
                    className="h-8 rounded-t-xl border border-emerald-700/25 bg-emerald-400"
                    animate={{ rotate: [0, -12, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                    style={{ transformOrigin: '8% 100%' }}
                  />
                  <div className="relative h-44 overflow-hidden rounded-b-2xl border border-emerald-800/20 bg-[#0f513f]">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(0deg,rgba(167,243,208,0.65),rgba(16,185,129,0.12))]"
                      animate={{ height: ['60%', '76%', '60%'] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      className="absolute left-0 right-0 h-px bg-emerald-200/70"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute right-2 top-2 rounded-full bg-white/15 px-2 py-0.5 font-mono text-xs text-white">72%</div>
                    <motion.div
                      className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full bg-lime-300"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                    <div className="absolute inset-x-6 top-16 grid place-items-center rounded-xl border border-white/15 bg-white/10 py-4">
                      <QrCode className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="border border-t-0 border-emerald-800/20 bg-[#0d4638] p-2 text-center font-mono text-[9px] uppercase tracking-widest text-emerald-100">
                    BIN-001 - CST CAMPUS
                  </div>
                </div>

                {[
                  { label: 'Fill: 72%', pos: 'top-4 right-4' },
                  { label: 'QR Linked', pos: 'bottom-12 left-2' },
                  { label: 'Wi-Fi OK', pos: 'top-1/2 right-0' },
                ].map((pill, index) => (
                  <motion.div
                    key={pill.label}
                    className={`absolute ${pill.pos} rounded-full border border-emerald-200 bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[1.5px] text-emerald-700 shadow-lg shadow-emerald-900/10`}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 1.2 }}
                  >
                    {pill.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="requirements" className="bg-[#f6fbf5] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel>SRS Coverage</SectionLabel>
              <h2 className="text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">What the Build Covers</h2>
              <p className="mt-2 max-w-lg text-base text-emerald-950/62">
                Every screen and route maps directly to a requirement in the SRS v1.0 document.
              </p>
            </motion.div>
            <Link href="/admin/settings">
              <button className="flex shrink-0 items-center gap-2 rounded-md border border-emerald-200 bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-[1.5px] text-emerald-800 transition-colors hover:border-emerald-400 hover:bg-emerald-50">
                Security Readiness <Zap className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {coverage.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="flex items-start gap-4 rounded-lg border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5 transition-colors hover:border-emerald-300"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm leading-6 text-emerald-950/72">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-emerald-100 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center bg-emerald-600 text-white"
              style={{ clipPath: 'polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))' }}
            >
              <Leaf className="h-3.5 w-3.5" />
            </div>
            <span className="text-lg font-bold tracking-[1.5px] text-emerald-900">EcoQuest Bhutan</span>
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              { href: '/dashboard/badges', label: 'Badges' },
              { href: '/dashboard/leaderboard', label: 'Leaderboard' },
              { href: '/admin/bins', label: 'Smart Bins' },
              { href: '/reports/activity', label: 'CSV Export' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-bold uppercase tracking-[1.5px] text-emerald-900/45 transition-colors hover:text-emerald-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-emerald-900/38">
            Zero Waste - One Scan at a Time - 2025
          </p>
        </div>
      </footer>
    </main>
  );
}








