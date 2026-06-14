'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Coins,
  Flag,
  LockKeyhole,
  Play,
  Radio,
  Sparkles,
  Target,
  Trophy,
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
  { left: '12%', top: '80%' },
  { left: '34%', top: '61%' },
  { left: '60%', top: '42%' },
  { left: '82%', top: '22%' },
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
  can: {
    bg: 'bg-lime-100',
    text: 'text-lime-800',
    border: 'border-lime-200',
    glow: 'shadow-lime-300/40',
    ring: 'ring-lime-200',
    accent: 'from-lime-500 to-green-300',
    section: 'Bonus',
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
  if (text.includes('can')) return 'can';
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

const COIN_CONFIGS = [
  { tx: -480, ty: -440, delay: 0 },
  { tx: -560, ty: -380, delay: 0.06 },
  { tx: -420, ty: -480, delay: 0.04 },
  { tx: -610, ty: -420, delay: 0.10 },
  { tx: -500, ty: -500, delay: 0.08 },
  { tx: -540, ty: -350, delay: 0.14 },
  { tx: -460, ty: -460, delay: 0.12 },
];

function FlyingCoins({ reward }) {
  return (
    <AnimatePresence>
      {reward && (
        <div key={reward.id} className="pointer-events-none absolute inset-0 z-30">
          {COIN_CONFIGS.map((c, i) => (
            <motion.div
              key={i}
              className="absolute bottom-44 right-52 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 shadow-lg shadow-amber-300/60"
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
              animate={{
                x: c.tx,
                y: c.ty,
                scale: [0.4, 1.2, 0.3],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 0.85, delay: c.delay, ease: 'easeIn' }}
            >
              <Coins className="h-3.5 w-3.5 text-white drop-shadow" />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
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

function QuestNode({ challenge, index, state, activeMission, onClick, isNextUp }) {
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
      className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${!locked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      style={{ left: position.left, top: position.top }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: current ? 1.06 : 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 220, damping: 20 }}
      onClick={!locked ? onClick : undefined}
      whileHover={!locked ? { scale: current ? 1.12 : 1.07 } : {}}
      whileTap={!locked ? { scale: 0.96 } : {}}
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

      {/* Points worth badge — always visible above each node */}
      <div
        className="absolute left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border-2 border-amber-200 bg-white/95 px-2.5 py-1 shadow-md backdrop-blur-sm"
        style={{ top: current ? '-152px' : '-52px' }}
      >
        <Coins className="h-3 w-3 text-amber-500" />
        <span className="text-[11px] font-black text-amber-700">+{challenge.points_value} pts</span>
      </div>

      {current && (
        <motion.div
          className={`absolute left-1/2 top-[-82px] w-36 -translate-x-1/2 rounded-2xl border-4 px-3 py-2 text-center text-white shadow-xl ${isNextUp ? 'border-emerald-400 bg-emerald-600' : 'border-pink-300 bg-slate-800'}`}
          initial={{ y: 8, opacity: 0 }}
          animate={isNextUp ? { y: [0, -5, 0], opacity: 1 } : { y: 0, opacity: 1 }}
          transition={isNextUp ? { repeat: Infinity, duration: 0.7, ease: 'easeInOut' } : undefined}
        >
          <p className={`text-[10px] font-black uppercase tracking-[1.3px] ${isNextUp ? 'text-emerald-100' : 'text-pink-200'}`}>
            {isNextUp ? 'Unlocked!' : 'You are here'}
          </p>
          <p className="text-sm font-black capitalize">{expectedLabel} quest</p>
          <div className={`absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-2 rotate-45 border-b-4 border-r-4 ${isNextUp ? 'border-emerald-400 bg-emerald-600' : 'border-pink-300 bg-slate-800'}`} />
        </motion.div>
      )}

      <div className="absolute left-1/2 top-[112px] w-40 -translate-x-1/2 text-center">
        <p className={`text-xs font-black uppercase tracking-[1px] ${locked ? 'text-slate-500' : 'text-emerald-950'}`}>
          {locked
            ? 'Complete previous quest'
            : completed
              ? 'Complete'
              : activeMission?.status === 'waiting' && activeMission.challenge_id === challenge.challenge_id
                ? 'Listening'
                : challenge.title.replace(' SmartBin mission', '')}
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

function QuestMap({
  items,
  currentChallenge,
  selectedChallenge,
  onNodeClick,
  activeMission,
  dashboardData,
  latestReward,
  dustbinFlash,
  completedChallengeNotice,
  onStart,
}) {
  const totalPoints = Number(dashboardData?.profile?.eco_points ?? 0);
  const missionState = missionStepState(activeMission);
  const panelChallenge = selectedChallenge ?? currentChallenge;
  const panelTheme = getTheme(getExpectedLabel(panelChallenge));
  const missionInFlight = activeMission?.status === 'waiting';
  const allCompleted = items.every((challenge) => challenge.status === 'completed');
  const completedCount = items.filter((c) => c.status === 'completed').length;
  const pathProgress = completedCount / items.length;
  const nextHighlightIndex = completedChallengeNotice
    ? items.findIndex((c) => c.status !== 'completed')
    : -1;
  const detectedLabel = activeMission?.result?.detected_label ?? latestReward?.detected_label ?? null;
  const detectedDisplay = detectedLabel && detectedLabel !== 'unknown'
    ? detectedLabel.charAt(0).toUpperCase() + detectedLabel.slice(1)
    : null;
  const dustbinMessage = completedChallengeNotice
    ? `Challenge ${completedChallengeNotice.number} completed.`
    : dustbinFlash === 'done'
      ? (detectedDisplay ? `${detectedDisplay} detected!` : 'Item verified!')
      : missionState === 'active'
        ? 'Waiting for verification...'
        : missionState === 'complete'
          ? (detectedDisplay ? `${detectedDisplay} detected!` : 'Points earned!')
          : missionState === 'retry'
            ? (detectedDisplay ? `${detectedDisplay} — wrong item` : 'Try again')
            : 'Ready';

  function getNodeState(challenge, index) {
    if (challenge.status === 'completed') return 'completed';
    if (index > 0 && items[index - 1].status !== 'completed') return 'locked';
    return challenge.challenge_id === currentChallenge?.challenge_id ? 'current' : 'available';
  }

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
            d="M132 592 C220 566, 274 462, 374 444 C430 426, 568 324, 660 311 C752 298, 848 176, 902 163"
            fill="none"
            stroke="#b7793d"
            strokeWidth="44"
            strokeLinecap="round"
          />
          <path
            d="M132 592 C220 566, 274 462, 374 444 C430 426, 568 324, 660 311 C752 298, 848 176, 902 163"
            fill="none"
            stroke="#ffe59a"
            strokeWidth="32"
            strokeLinecap="round"
            strokeDasharray="5 18"
          />
          <motion.path
            d="M132 592 C220 566, 274 462, 374 444 C430 426, 568 324, 660 311 C752 298, 848 176, 902 163"
            fill="none"
            stroke="#34d399"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="0.01 1"
            pathLength="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: pathProgress }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </svg>

        <FlyingCoins reward={latestReward} />

        {items.map((challenge, index) => (
          <QuestNode
            key={challenge.challenge_id}
            challenge={challenge}
            index={index}
            state={getNodeState(challenge, index)}
            activeMission={activeMission}
            onClick={() => onNodeClick(challenge)}
            isNextUp={index === nextHighlightIndex}
          />
        ))}

        <AnimatePresence>
          {selectedChallenge && (
            <motion.div
              key="mission-panel"
              className="absolute bottom-7 left-7 z-20 w-[390px] rounded-[1.6rem] border border-white/70 bg-white/95 p-5 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl"
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[1.6px] text-emerald-700">
                    {panelChallenge?.status === 'completed' ? 'Quest Completed' : 'Current Mission'}
                  </p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                    {allCompleted ? 'All quests complete' : panelChallenge?.title ?? 'SmartBin quest'}
                  </h1>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    {allCompleted
                      ? 'Every map node is cleared for this session.'
                      : panelChallenge?.status === 'completed'
                        ? `You already completed this ${getExpectedLabel(panelChallenge)} quest. Well done!`
                        : `Complete ${ITEMS_PER_CHALLENGE} verified ${getExpectedLabel(panelChallenge)} items with the physical SmartBin.`}
                  </p>
                </div>
                <Badge className={`${panelTheme.bg} ${panelTheme.text} ${panelTheme.border} border px-3 py-1 capitalize`} variant="outline">
                  {allCompleted ? 'done' : getExpectedLabel(panelChallenge)}
                </Badge>
              </div>

              {panelChallenge?.status !== 'completed' && !allCompleted && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-[1.3px] text-slate-500">
                    <span>Node progress</span>
                    <span>{panelChallenge?.completed_count ?? 0}/{panelChallenge?.goal_count ?? ITEMS_PER_CHALLENGE}</span>
                  </div>
                  <Progress value={panelChallenge?.progress ?? 0} className="h-3 rounded-full" />
                </div>
              )}

              <div className="mt-5 flex items-center gap-3">
                {panelChallenge?.status === 'completed' ? (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => onNodeClick(null)}
                    className="h-12 rounded-2xl border-emerald-200 px-6 text-base font-black text-emerald-700 hover:bg-emerald-50"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Quest Done
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    disabled={!currentChallenge || missionInFlight || allCompleted || panelChallenge?.challenge_id !== currentChallenge?.challenge_id}
                    onClick={() => {
                      onNodeClick(null);
                      onStart(panelChallenge);
                    }}
                    className="h-12 rounded-2xl bg-emerald-600 px-6 text-base font-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-700"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {missionInFlight ? 'Session Active' : allCompleted ? 'Completed' : 'Start Challenge'}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                {missionState === 'active' ? 'System active' : missionState === 'complete' ? (detectedDisplay ? `${detectedDisplay}!` : 'Points earned') : missionState === 'retry' ? (detectedDisplay ? `${detectedDisplay}?` : 'Wrong item') : 'Ready'}
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

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50 p-4 font-mono text-sm shadow-inner">
            <p className="font-black text-slate-950">
              {dustbinMessage}
            </p>
          </div>

        </motion.div>
      </div>
    </section>
  );
}


export default function ChallengesPage() {
  const [items, setItems] = useState(() => challengeSeed.map((c) => ({ ...c, ...emptyProgress })));
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [activeMission, setActiveMission] = useState(null);
  const [missionError, setMissionError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [pointsError, setPointsError] = useState('');
  const [latestReward, setLatestReward] = useState(null);
  const [dustbinFlash, setDustbinFlash] = useState(null);
  const [completedChallengeNotice, setCompletedChallengeNotice] = useState(null);
  const processedMissionIds = useRef(new Set());
  const flashTimeoutRef = useRef(null);
  const completedNoticeTimerRef = useRef(null);
  const itemsRef = useRef(items);
  const progressRef = useRef(Object.fromEntries(
    items.map((c) => [c.challenge_id, Number(c.completed_count ?? 0)]),
  ));

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecoquest_challenge_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        const loaded = challengeSeed.map((c) => {
          const s = parsed.find((p) => p.challenge_id === c.challenge_id);
          return s ? { ...c, ...emptyProgress, ...s } : { ...c, ...emptyProgress };
        });
        setItems(loaded);
        itemsRef.current = loaded;
        progressRef.current = Object.fromEntries(
          loaded.map((c) => [c.challenge_id, Number(c.completed_count ?? 0)]),
        );
      }
    } catch {}
  }, []);

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
    return () => {
      if (flashTimeoutRef.current) {
        window.clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  // Fix 3: keep itemsRef current and persist progress to localStorage
  useEffect(() => {
    itemsRef.current = items;
    try {
      localStorage.setItem('ecoquest_challenge_progress', JSON.stringify(
        items.map((c) => ({
          challenge_id: c.challenge_id,
          progress: c.progress,
          completed_count: c.completed_count,
          goal_count: c.goal_count,
          status: c.status,
        }))
      ));
    } catch {}
  }, [items]);

  // Fix 2: auto-clear "Challenge completed" notice after 3.5s and open next challenge panel
  useEffect(() => {
    if (!completedChallengeNotice) return undefined;
    if (completedNoticeTimerRef.current) window.clearTimeout(completedNoticeTimerRef.current);
    completedNoticeTimerRef.current = window.setTimeout(() => {
      setCompletedChallengeNotice(null);
      completedNoticeTimerRef.current = null;
      const next = itemsRef.current.find((c) => c.status !== 'completed');
      if (next) setSelectedChallenge(next);
    }, 3500);
    return () => {
      if (completedNoticeTimerRef.current) window.clearTimeout(completedNoticeTimerRef.current);
    };
  }, [completedChallengeNotice]);

  function showDoneFlash() {
    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current);
    }

    setDustbinFlash('done');
    flashTimeoutRef.current = window.setTimeout(() => {
      setDustbinFlash(null);
      flashTimeoutRef.current = null;
    }, 1000);
  }

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

          const nextCorrectCount = result.mission.status === 'correct'
            ? countVerifiedItem(result.mission.challenge_id)
            : Number(progressRef.current[result.mission.challenge_id] ?? 0);

          if (result.mission.status === 'correct') {
            setLatestReward({
              id: result.mission.mission_id,
              challenge_id: result.mission.challenge_id,
              expected_label: result.mission.result?.expected_label ?? result.mission.expected_label,
              detected_label: result.mission.result?.detected_label ?? null,
              points_awarded: result.mission.points_awarded ?? 0,
            });
            if (nextCorrectCount >= ITEMS_PER_CHALLENGE) {
              const completedIndex = challengeSeed.findIndex((item) => item.challenge_id === result.mission.challenge_id);
              setDustbinFlash(null);
              setCompletedChallengeNotice({
                challenge_id: result.mission.challenge_id,
                number: completedIndex >= 0 ? completedIndex + 1 : 1,
              });
            } else {
              setCompletedChallengeNotice(null);
              showDoneFlash();
            }
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
            }, 100);
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

    const interval = setInterval(pollMission, 500);
    pollMission();

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [activeMission?.mission_id, activeMission?.status]);

  const currentChallenge = useMemo(() => {
    return items.find((c, i) => c.status !== 'completed' && (i === 0 || items[i - 1].status === 'completed')) ?? null;
  }, [items]);

  const availablePoints = useMemo(() => items.reduce((sum, challenge) => {
    const remaining = Math.max(0, Number(challenge.goal_count ?? ITEMS_PER_CHALLENGE) - Number(challenge.completed_count ?? 0));
    return sum + (remaining * Number(challenge.points_value ?? 0));
  }, 0), [items]);

  function countVerifiedItem(challengeId) {
    const nextCount = Math.min(
      Number(progressRef.current[challengeId] ?? 0) + 1,
      ITEMS_PER_CHALLENGE,
    );
    progressRef.current = {
      ...progressRef.current,
      [challengeId]: nextCount,
    };

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

    return nextCount;
  }

  async function startChallenge(challenge, options = {}) {
    const expectedLabel = getExpectedLabel(challenge);

    setMissionError('');
    setCompletedChallengeNotice(null);
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
    setDustbinFlash(null);
    setCompletedChallengeNotice(null);
    progressRef.current = {
      ...progressRef.current,
      [challenge.challenge_id]: Math.max(
        Number(progressRef.current[challenge.challenge_id] ?? 0),
        Number(challenge.completed_count ?? 0),
      ),
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
        selectedChallenge={selectedChallenge}
        onNodeClick={setSelectedChallenge}
        activeMission={activeMission}
        dashboardData={dashboardData}
        latestReward={latestReward}
        dustbinFlash={dustbinFlash}
        completedChallengeNotice={completedChallengeNotice}
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
