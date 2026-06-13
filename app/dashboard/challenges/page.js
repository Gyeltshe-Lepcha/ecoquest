'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  CheckCircle2,
  CircleGauge,
  Coins,
  Cpu,
  Flag,
  LockKeyhole,
  Play,
  Radio,
  Sparkles,
  Target,
  Trophy,
  Wifi,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { challenges as challengeSeed } from '@/lib/ecoquest-data';

const ITEMS_PER_CHALLENGE = 5;

const emptyProgress = {
  progress: 0,
  completed_count: 0,
  goal_count: ITEMS_PER_CHALLENGE,
  status: 'active',
};

const nodePositions = [
  { left: '14%', top: '78%' },
  { left: '30%', top: '67%' },
  { left: '48%', top: '58%' },
  { left: '66%', top: '43%' },
  { left: '78%', top: '25%' },
];

const targetThemes = {
  plastic: {
    bg: 'bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-200',
    glow: 'shadow-sky-300/40',
    ring: 'ring-sky-200',
    accent: 'from-sky-400 to-cyan-300',
    section: 'Section 1',
  },
  paper: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    glow: 'shadow-amber-300/40',
    ring: 'ring-amber-200',
    accent: 'from-amber-300 to-yellow-200',
    section: 'Section 1',
  },
  bottle: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    glow: 'shadow-emerald-300/40',
    ring: 'ring-emerald-200',
    accent: 'from-emerald-400 to-lime-300',
    section: 'Section 1',
  },
  unknown: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    glow: 'shadow-slate-300/30',
    ring: 'ring-slate-200',
    accent: 'from-slate-400 to-slate-200',
    section: 'Review',
  },
};

function getExpectedLabel(challenge) {
  if (challenge?.target_label) return String(challenge.target_label).toLowerCase();

  const text = `${challenge?.title ?? ''} ${challenge?.description ?? ''} ${challenge?.category ?? ''}`.toLowerCase();
  if (text.includes('bottle')) return 'bottle';
  if (text.includes('plastic')) return 'plastic';
  if (text.includes('paper')) return 'paper';
  if (text.includes('unknown')) return 'unknown';
  return '';
}

function getTheme(label) {
  return targetThemes[label] ?? targetThemes.unknown;
}

function missionStepState(mission) {
  if (!mission) return 'idle';
  if (mission.status === 'correct') return 'complete';
  if (mission.status === 'try_again') return 'retry';
  if (mission.status === 'waiting') return 'active';
  return 'idle';
}

function PointsHud({ totalPoints, latestReward }) {
  return (
    <motion.div
      layout
      className="absolute left-5 top-5 z-20 flex items-center gap-3 rounded-[1.4rem] border border-white/70 bg-white/80 px-4 py-3 shadow-xl shadow-emerald-900/10 backdrop-blur-xl"
      animate={latestReward ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 text-white shadow-lg shadow-amber-400/30">
        <Coins className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[1.6px] text-emerald-700">Total EcoPoints</p>
        <div className="flex items-end gap-2">
          <motion.p
            key={totalPoints}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-black tracking-tight text-slate-950"
          >
            {totalPoints.toLocaleString()}
          </motion.p>
          <AnimatePresence>
            {latestReward && (
              <motion.span
                key={latestReward.id}
                initial={{ opacity: 0, y: 10, scale: 0.86 }}
                animate={{ opacity: 1, y: -2, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.92 }}
                className="mb-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-black text-white shadow-lg shadow-emerald-400/40"
              >
                +{latestReward.points_awarded}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function MapDecoration() {
  const trees = [
    ['8%', '19%'], ['18%', '39%'], ['8%', '59%'], ['30%', '28%'], ['36%', '82%'],
    ['54%', '21%'], ['60%', '76%'], ['86%', '47%'], ['88%', '72%'], ['72%', '14%'],
  ];
  const clouds = [
    ['19%', '9%', 'w-36'], ['55%', '8%', 'w-44'], ['82%', '11%', 'w-32'],
  ];

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,255,255,0.95),transparent_18%),linear-gradient(180deg,#dff8ff_0%,#c8f3ca_33%,#74d86b_100%)]" />
      <div className="absolute bottom-0 right-0 h-56 w-80 rounded-tl-[7rem] bg-gradient-to-br from-cyan-200 to-sky-400 opacity-90" />
      <div className="absolute bottom-8 right-8 h-36 w-64 rounded-tl-[6rem] bg-gradient-to-br from-cyan-100 to-cyan-300 opacity-80" />
      <div className="absolute left-0 top-[47%] h-44 w-60 rounded-r-full bg-lime-300/60 blur-sm" />
      <div className="absolute bottom-0 left-0 h-28 w-full bg-gradient-to-t from-lime-300/80 to-transparent" />

      {clouds.map(([left, top, width], index) => (
        <div key={`${left}-${top}`} className={`absolute ${width} h-14 rounded-full bg-white/80 blur-[1px]`} style={{ left, top }}>
          <div className="absolute left-5 top-[-14px] h-14 w-20 rounded-full bg-white/90" />
          <div className="absolute right-5 top-[-10px] h-12 w-16 rounded-full bg-white/90" />
          {index === 1 && <div className="absolute right-[-60px] top-5 h-px w-12 bg-sky-300/50" />}
        </div>
      ))}

      {trees.map(([left, top], index) => (
        <div key={`${left}-${top}`} className="absolute h-16 w-16" style={{ left, top }}>
          <div className="absolute bottom-0 left-7 h-8 w-3 rounded-full bg-amber-800" />
          <div className={`absolute h-12 w-12 rounded-full ${index % 2 ? 'bg-emerald-600' : 'bg-green-500'} shadow-lg shadow-green-900/10`} />
          <div className={`absolute left-6 top-2 h-10 w-10 rounded-full ${index % 2 ? 'bg-green-500' : 'bg-emerald-500'}`} />
        </div>
      ))}

      <div className="absolute bottom-28 right-28 flex items-center gap-2 rounded-3xl border-4 border-amber-200 bg-white px-4 py-3 shadow-xl">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-300 text-white">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[1.4px] text-amber-700">Rewards</p>
          <p className="text-sm font-black text-slate-950">Shop</p>
        </div>
      </div>
    </>
  );
}

function QuestNode({ challenge, index, state, activeMission }) {
  const expectedLabel = getExpectedLabel(challenge);
  const theme = getTheme(expectedLabel);
  const position = nodePositions[index] ?? nodePositions[nodePositions.length - 1];
  const completed = state === 'completed';
  const current = state === 'current';
  const locked = state === 'locked';
  const Icon = completed ? CheckCircle2 : locked ? LockKeyhole : Target;

  return (
    <motion.div
      layout
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: position.left, top: position.top }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: current ? 1.06 : 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 220, damping: 20 }}
    >
      {current && (
        <motion.div
          className="absolute -inset-4 rounded-full border-4 border-white/80 bg-emerald-300/30"
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.18, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
      )}

      <div
        className={`relative flex h-24 w-24 items-center justify-center rounded-full border-[6px] ${
          locked
            ? 'border-slate-300 bg-slate-400 text-slate-100 shadow-lg shadow-slate-400/30'
            : completed
              ? 'border-emerald-100 bg-emerald-500 text-white shadow-xl shadow-emerald-400/40'
              : `border-white bg-gradient-to-br ${theme.accent} text-white shadow-xl ${theme.glow}`
        }`}
      >
        <div className="absolute inset-2 rounded-full border border-white/40" />
        <Icon className="h-9 w-9 drop-shadow" />
        {!locked && (
          <span className="absolute -bottom-3 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-base font-black text-white shadow-lg">
            {index + 1}
          </span>
        )}
      </div>

      {current && (
        <motion.div
          className="absolute left-1/2 top-[-82px] w-36 -translate-x-1/2 rounded-2xl border-4 border-pink-300 bg-slate-800 px-3 py-2 text-center text-white shadow-xl"
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-[10px] font-black uppercase tracking-[1.3px] text-pink-200">You are here</p>
          <p className="text-sm font-black capitalize">{expectedLabel} quest</p>
          <div className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-2 rotate-45 border-b-4 border-r-4 border-pink-300 bg-slate-800" />
        </motion.div>
      )}

      <div className="absolute left-1/2 top-[112px] w-36 -translate-x-1/2 text-center">
        <p className={`text-xs font-black uppercase tracking-[1px] ${locked ? 'text-slate-500' : 'text-emerald-950'}`}>
          {locked ? 'Locked' : completed ? 'Complete' : activeMission?.status === 'waiting' && activeMission.challenge_id === challenge.challenge_id ? 'Listening' : challenge.title.replace(' SmartBin mission', '')}
        </p>
        {!locked && (
          <p className="mt-1 text-[11px] font-bold text-emerald-900/70">
            {challenge.completed_count}/{challenge.goal_count} items
          </p>
        )}
      </div>
    </motion.div>
  );
}

function QuestMap({ items, currentChallenge, activeMission, dashboardData, latestReward, onStart }) {
  const totalPoints = Number(dashboardData?.profile?.eco_points ?? 320);
  const currentIndex = Math.max(0, items.findIndex((challenge) => challenge.challenge_id === currentChallenge?.challenge_id));
  const missionState = missionStepState(activeMission);
  const currentTheme = getTheme(getExpectedLabel(currentChallenge));
  const missionInFlight = activeMission?.status === 'waiting';
  const allCompleted = items.every((challenge) => challenge.status === 'completed');

  return (
    <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl shadow-emerald-900/10">
      <div className="relative h-[740px] overflow-hidden">
        <MapDecoration />
        <PointsHud totalPoints={totalPoints} latestReward={latestReward} />

        <div className="absolute right-5 top-5 z-20 rounded-[1.4rem] border border-white/70 bg-white/80 px-4 py-3 shadow-xl shadow-sky-900/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-400/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[1.6px] text-slate-500">Quest Progress</p>
              <p className="text-2xl font-black text-slate-950">
                {items.filter((challenge) => challenge.status === 'completed').length}/{items.length}
              </p>
            </div>
          </div>
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1100 740" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M135 585 C230 540, 250 500, 330 500 C435 500, 420 420, 535 420 C650 420, 630 320, 735 320 C840 320, 850 230, 860 185"
            fill="none"
            stroke="#b7793d"
            strokeWidth="44"
            strokeLinecap="round"
          />
          <path
            d="M135 585 C230 540, 250 500, 330 500 C435 500, 420 420, 535 420 C650 420, 630 320, 735 320 C840 320, 850 230, 860 185"
            fill="none"
            stroke="#ffe59a"
            strokeWidth="32"
            strokeLinecap="round"
            strokeDasharray="5 18"
          />
          <motion.path
            d="M135 585 C230 540, 250 500, 330 500 C435 500, 420 420, 535 420 C650 420, 630 320, 735 320 C840 320, 850 230, 860 185"
            fill="none"
            stroke="#34d399"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="0.01 1"
            pathLength="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.min(1, (currentIndex + 0.35) / Math.max(1, items.length - 1)) }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>

        {items.map((challenge, index) => {
          const completed = challenge.status === 'completed';
          const current = challenge.challenge_id === currentChallenge?.challenge_id;
          const state = completed ? 'completed' : current ? 'current' : index > currentIndex ? 'locked' : 'available';

          return (
            <QuestNode
              key={challenge.challenge_id}
              challenge={challenge}
              index={index}
              state={state}
              activeMission={activeMission}
            />
          );
        })}

        <motion.div
          className="absolute bottom-7 left-7 z-20 w-[390px] rounded-[1.6rem] border border-white/70 bg-white/86 p-5 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[1.6px] text-emerald-700">Current Mission</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                {allCompleted ? 'All quests complete' : currentChallenge?.title ?? 'SmartBin quest'}
              </h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {allCompleted
                  ? 'Every map node is cleared for this session.'
                  : `Complete ${ITEMS_PER_CHALLENGE} verified ${getExpectedLabel(currentChallenge)} items with the physical SmartBin.`}
              </p>
            </div>
            <Badge className={`${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} border px-3 py-1 capitalize`} variant="outline">
              {allCompleted ? 'done' : getExpectedLabel(currentChallenge)}
            </Badge>
          </div>

          {!allCompleted && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-[1.3px] text-slate-500">
                <span>Node progress</span>
                <span>{currentChallenge?.completed_count ?? 0}/{currentChallenge?.goal_count ?? ITEMS_PER_CHALLENGE}</span>
              </div>
              <Progress value={currentChallenge?.progress ?? 0} className="h-3 rounded-full" />
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <Button
              size="lg"
              disabled={!currentChallenge || missionInFlight || allCompleted}
              onClick={() => currentChallenge && onStart(currentChallenge)}
              className="h-12 rounded-2xl bg-emerald-600 px-6 text-base font-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-700"
            >
              <Play className="mr-2 h-5 w-5" />
              {missionInFlight ? 'Session Active' : allCompleted ? 'Completed' : 'Start Challenge'}
            </Button>
            <div className="text-xs font-bold leading-5 text-slate-500">
              +{currentChallenge?.points_value ?? 5} pts per correct item
              <br />
              {'Web -> ESP32 -> Camera -> AI'}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-7 right-7 z-20 w-[360px] rounded-[1.6rem] border border-white/70 bg-white/86 p-5 shadow-2xl shadow-sky-900/10 backdrop-blur-xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[1.6px] text-sky-700">Smart Dustbin</p>
              <p className="text-xl font-black text-slate-950">
                {missionState === 'active' ? 'System active' : missionState === 'complete' ? 'Points earned' : missionState === 'retry' ? 'Try again' : 'Ready'}
              </p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              missionState === 'complete'
                ? 'bg-emerald-500 text-white'
                : missionState === 'retry'
                  ? 'bg-rose-500 text-white'
                  : missionState === 'active'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-500'
            }`}>
              <Radio className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-lime-300 shadow-inner">
            <p>{missionState === 'active' ? 'LCD: INSERT WASTE' : missionState === 'complete' ? 'LCD: POINTS EARNED' : missionState === 'retry' ? 'LCD: TRY AGAIN' : 'LCD: PRESS START'}</p>
            <p className="mt-2 text-lime-200/70">
              {activeMission?.devkit?.message ?? 'Waiting for the next campus quest.'}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatusTile icon={Wifi} label="ESP32" value={activeMission?.devkit?.status === 'failed' ? 'Check IP' : 'Ready'} active={missionState === 'active'} />
            <StatusTile icon={Camera} label="Camera" value={dashboardData?.latest ? 'Synced' : 'Standby'} active={Boolean(dashboardData?.latest)} />
            <StatusTile icon={Cpu} label="AI Result" value={dashboardData?.latest?.label ?? '-'} active={missionState === 'complete'} />
            <StatusTile icon={CircleGauge} label="Fill Level" value={`${dashboardData?.latest?.fill_level_pct ?? 0}%`} active={Number(dashboardData?.latest?.fill_level_pct ?? 0) > 0} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatusTile({ icon: Icon, label, value, active }) {
  return (
    <div className={`rounded-2xl border p-3 ${active ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
        <p className="text-[10px] font-black uppercase tracking-[1.2px] text-slate-400">{label}</p>
      </div>
      <p className="mt-2 truncate text-sm font-black capitalize text-slate-950">{value}</p>
    </div>
  );
}

export default function ChallengesPage() {
  const [items, setItems] = useState(() => challengeSeed.map((challenge) => ({
    ...challenge,
    ...emptyProgress,
  })));
  const [activeMission, setActiveMission] = useState(null);
  const [missionError, setMissionError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [pointsError, setPointsError] = useState('');
  const [latestReward, setLatestReward] = useState(null);
  const processedMissionIds = useRef(new Set());
  const sessionRef = useRef({
    challengeId: null,
    correctCount: 0,
  });

  async function loadDashboardData() {
    try {
      const response = await fetch('/api/iot/dashboard', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Could not load EcoPoints.');
      }

      setDashboardData(result);
      setPointsError('');
    } catch (error) {
      setPointsError(error.message);
    }
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!alive) return;
      await loadDashboardData();
    }

    load();
    const interval = setInterval(load, 5000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!activeMission?.mission_id || activeMission.status !== 'waiting') {
      return undefined;
    }

    let alive = true;

    async function pollMission() {
      try {
        const response = await fetch(`/api/iot/mission?mission_id=${activeMission.mission_id}`, { cache: 'no-store' });
        const result = await response.json().catch(() => ({}));

        if (!alive || !response.ok || !result.mission) return;

        const finished = result.mission.status === 'correct' || result.mission.status === 'try_again';
        const alreadyProcessed = processedMissionIds.current.has(result.mission.mission_id);

        setActiveMission(result.mission);

        if (finished && !alreadyProcessed) {
          processedMissionIds.current.add(result.mission.mission_id);

          const session = sessionRef.current;
          const currentCorrectCount = session.challengeId === result.mission.challenge_id
            ? session.correctCount
            : 0;
          const nextCorrectCount = result.mission.status === 'correct'
            ? Math.min(currentCorrectCount + 1, ITEMS_PER_CHALLENGE)
            : currentCorrectCount;

          sessionRef.current = {
            challengeId: result.mission.challenge_id,
            correctCount: nextCorrectCount,
          };

          if (result.mission.status === 'correct') {
            countVerifiedItem(result.mission.challenge_id, nextCorrectCount);
            setLatestReward({
              id: result.mission.mission_id,
              challenge_id: result.mission.challenge_id,
              expected_label: result.mission.result?.expected_label ?? result.mission.expected_label,
              detected_label: result.mission.result?.detected_label ?? null,
              points_awarded: result.mission.points_awarded ?? 0,
            });
            loadDashboardData();
          }

          const challenge = challengeSeed.find((item) => item.challenge_id === result.mission.challenge_id);
          if (challenge && nextCorrectCount < ITEMS_PER_CHALLENGE) {
            window.setTimeout(() => {
              startChallenge(challenge, {
                pendingMessage: result.mission.status === 'correct'
                  ? 'Correct item logged. Re-arming ESP32 DevKit for the next item...'
                  : 'Try again logged. Re-arming ESP32 DevKit for another attempt...',
              });
            }, 600);
          }
        }
      } catch {
        if (alive) {
          setActiveMission((current) => current
            ? {
                ...current,
                devkit: {
                  ...(current.devkit ?? {}),
                  status: 'failed',
                  message: 'Could not read mission status from the backend.',
                },
              }
            : current);
        }
      }
    }

    const interval = setInterval(pollMission, 2000);
    pollMission();

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [activeMission?.mission_id, activeMission?.status]);

  const currentChallenge = useMemo(() => (
    items.find((challenge) => challenge.status !== 'completed') ?? null
  ), [items]);

  const availablePoints = useMemo(() => items.reduce((sum, challenge) => {
    const remaining = Math.max(0, Number(challenge.goal_count ?? ITEMS_PER_CHALLENGE) - Number(challenge.completed_count ?? 0));
    return sum + (remaining * Number(challenge.points_value ?? 0));
  }, 0), [items]);

  function countVerifiedItem(challengeId, nextCount) {
    setItems((current) => current.map((challenge) => (
      challenge.challenge_id === challengeId
        ? {
            ...challenge,
            status: nextCount >= ITEMS_PER_CHALLENGE ? 'completed' : 'active',
            progress: Math.min(100, Math.round((nextCount / ITEMS_PER_CHALLENGE) * 100)),
            completed_count: nextCount,
            goal_count: ITEMS_PER_CHALLENGE,
          }
        : challenge
    )));
  }

  async function startChallenge(challenge, options = {}) {
    const expectedLabel = getExpectedLabel(challenge);

    setMissionError('');
    setActiveMission({
      mission_id: null,
      user_id: 'USR-0042',
      challenge_id: challenge.challenge_id,
      challenge_title: challenge.title,
      expected_label: expectedLabel,
      status: 'waiting',
      points_awarded: challenge.points_value,
      started_at: new Date().toISOString(),
      devkit: {
        status: 'pending',
        message: options.pendingMessage ?? 'Sending start command to ESP32 DevKit...',
      },
      result: null,
    });

    try {
      const response = await fetch('/api/iot/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'USR-0042',
          challenge_id: challenge.challenge_id,
          expected_label: expectedLabel,
          bin_id: 'BIN-001',
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Unable to start this mission.');
      }

      setActiveMission(result.mission);
    } catch (error) {
      setMissionError(error.message);
      setActiveMission({
        mission_id: null,
        user_id: 'USR-0042',
        challenge_id: challenge.challenge_id,
        challenge_title: challenge.title,
        expected_label: expectedLabel,
        status: 'try_again',
        points_awarded: challenge.points_value,
        started_at: new Date().toISOString(),
        devkit: {
          status: 'failed',
          message: error.message,
        },
        result: null,
      });
    }
  }

  async function takeChallenge(challenge) {
    setLatestReward(null);
    sessionRef.current = {
      challengeId: challenge.challenge_id,
      correctCount: Number(challenge.completed_count ?? 0),
    };
    await startChallenge(challenge);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[1.6px] text-emerald-700">EcoQuest Challenge Map</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Start a SmartBin quest journey</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            One challenge button starts the current map node. The web enables ESP32, waits for ultrasonic and IR detection,
            requests the camera image, runs AI verification, and adds points to your total score.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <MiniStat icon={Flag} label="Current" value={currentChallenge ? `Level ${items.findIndex((challenge) => challenge.challenge_id === currentChallenge.challenge_id) + 1}` : 'Done'} />
          <MiniStat icon={Zap} label="Available" value={`+${availablePoints}`} />
          <MiniStat icon={Trophy} label="Goal" value={`${ITEMS_PER_CHALLENGE} items`} />
        </div>
      </section>

      {pointsError && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {pointsError}
        </div>
      )}

      <QuestMap
        items={items}
        currentChallenge={currentChallenge}
        activeMission={activeMission}
        dashboardData={dashboardData}
        latestReward={latestReward}
        onStart={takeChallenge}
      />
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="min-w-28 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <Icon className="mx-auto h-5 w-5 text-emerald-700" />
      <p className="mt-2 text-[10px] font-black uppercase tracking-[1.2px] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
