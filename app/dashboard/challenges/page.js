'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  QrCode,
  Search,
  Sparkles,
  Target,
  Wifi,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { challenges as challengeSeed } from '@/lib/ecoquest-data';

const ITEMS_PER_CHALLENGE = 5;

const emptyProgress = {
  progress: 0,
  completed_count: 0,
  goal_count: ITEMS_PER_CHALLENGE,
  status: 'active',
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

function getDeadlineLabel(deadline, completed) {
  if (completed) return 'Completed';

  const delta = new Date(deadline).getTime() - Date.now();
  if (Number.isNaN(delta) || delta <= 0) return 'Ready now';

  const hours = Math.ceil(delta / (1000 * 60 * 60));
  return hours < 24 ? `${hours} hours left` : `${Math.ceil(hours / 24)} days left`;
}

function targetTone(label) {
  switch (label) {
    case 'plastic':
      return 'bg-sky-50 text-sky-700 border-sky-100';
    case 'paper':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'bottle':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'unknown':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function PointsUpdateSection({ data, activeMission, latestReward, error }) {
  const totalPoints = Number(data?.profile?.eco_points ?? 0);
  const latest = data?.latest;
  const isCorrect = Boolean(latestReward) || activeMission?.status === 'correct';
  const expectedLabel =
    latestReward?.expected_label ??
    activeMission?.result?.expected_label ??
    activeMission?.expected_label ??
    'target';
  const detectedLabel =
    latestReward?.detected_label ??
    activeMission?.result?.detected_label ??
    latest?.label ??
    null;
  const pointsAwarded = Number(latestReward?.points_awarded ?? activeMission?.points_awarded ?? 0);

  return (
    <section className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[1.5px] text-emerald-700">EcoPoints</p>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-4xl font-black tracking-tight text-slate-950">{totalPoints.toLocaleString()}</p>
            <span className="mb-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
              live balance
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Points update after AI confirms the detected item matches the selected challenge target.
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-950">Latest points update</p>
              <p className="mt-1 text-sm text-slate-500">
                {isCorrect
                  ? `${detectedLabel ?? 'Item'} matched ${expectedLabel}.`
                  : latest
                    ? `${latest.label} detected at ${latest.confidence_pct}% confidence.`
                    : 'Waiting for the next verified SmartBin result.'}
              </p>
            </div>
            <Badge
              variant="outline"
              className={isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600'}
            >
              {isCorrect ? `+${pointsAwarded} pts added` : 'No new points yet'}
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[1.2px] text-slate-400">Expected</p>
              <p className="mt-1 font-black capitalize text-slate-950">{expectedLabel}</p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[1.2px] text-slate-400">Detected</p>
              <p className="mt-1 font-black capitalize text-slate-950">{detectedLabel ?? '-'}</p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[1.2px] text-slate-400">Result</p>
              <p className={`mt-1 font-black ${isCorrect ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isCorrect ? 'Correct' : 'Waiting'}
              </p>
            </div>
          </div>

          {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
        </div>
      </div>
    </section>
  );
}

function ChallengeCard({ challenge, onTake, activeMission }) {
  const completed = challenge.status === 'completed';
  const expectedLabel = getExpectedLabel(challenge);
  const missionActive = activeMission?.challenge_id === challenge.challenge_id && activeMission.status === 'waiting';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}>
      <Card className={`border-border/50 transition-all hover:shadow-lg hover:shadow-primary/5 ${completed ? 'bg-emerald-50 border-emerald-100' : 'bg-white'}`}>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {completed && (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Correct
                    </Badge>
                  )}
                  <Badge variant="outline" className={targetTone(expectedLabel)}>
                    Target: {expectedLabel}
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <QrCode className="h-3.5 w-3.5" />
                    SmartBin
                  </Badge>
                  <Badge variant="outline" className="capitalize text-muted-foreground">
                    {challenge.cadence}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold">{challenge.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{challenge.description}</p>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-2xl font-bold text-primary">+{challenge.points_value}</div>
                <div className="text-xs text-muted-foreground">per item</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {getDeadlineLabel(challenge.deadline, completed)}
                </div>
                <span className="font-semibold text-muted-foreground">
                  {challenge.completed_count} / {challenge.goal_count}
                </span>
              </div>
              <Progress value={challenge.progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wifi className="h-4 w-4" />
                Web to ESP32 to AI verification
              </div>
              {!completed && (
                <Button onClick={() => onTake(challenge)} disabled={missionActive} className="gap-2">
                  <Target className="h-4 w-4" />
                  {missionActive ? 'Listening...' : 'Take Challenge'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MissionStatusPanel({ mission, error, onReset }) {
  if (!mission && !error) return null;

  const expected = mission?.expected_label ?? 'target item';
  const result = mission?.result;
  const devkit = mission?.devkit;
  const isWaiting = mission?.status === 'waiting';
  const isCorrect = mission?.status === 'correct';
  const isTryAgain = mission?.status === 'try_again';
  const devkitTone = devkit?.status === 'commanded'
    ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
    : devkit?.status === 'failed'
      ? 'border-rose-100 bg-rose-50 text-rose-800'
      : 'border-amber-100 bg-amber-50 text-amber-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 shadow-sm ${
        isCorrect
          ? 'border-emerald-200 bg-emerald-50'
          : isTryAgain || error
            ? 'border-rose-200 bg-rose-50'
            : 'border-sky-200 bg-sky-50'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[1.5px] text-slate-700">
            <Sparkles className="h-3.5 w-3.5" />
            {isCorrect ? 'Correct' : isTryAgain || error ? 'Try Again' : 'Waiting for Verification'}
          </div>
          <h2 className="text-xl font-black text-slate-950">
            {mission?.challenge_title ?? 'SmartBin mission'}
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Mission: place 5 <span className="capitalize text-emerald-700">{expected}</span> items into the physical SmartBin.
          </p>
        </div>

        <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[1.3px] text-slate-500">Reward</p>
          <p className={`text-2xl font-black ${isCorrect ? 'text-emerald-700' : 'text-slate-400'}`}>
            +{mission?.points_awarded ?? 5} pts
          </p>
        </div>
      </div>

      {isWaiting && devkit && (
        <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${devkitTone}`}>
          {devkit.message}
        </div>
      )}

      {isWaiting && (
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          {[
            'Web sends mission command to ESP32 DevKit',
            'Ultrasonic waits for person within 25 cm',
            'IR detects object, then DevKit calls backend',
            'Backend verifies, points update, then web re-arms until 5 correct items',
          ].map((copy, index) => (
            <div key={copy} className="rounded-xl bg-white p-3 text-sm font-semibold text-sky-800 shadow-sm">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-black">{index + 1}</span>
              {copy}
            </div>
          ))}
        </div>
      )}

      {(isCorrect || isTryAgain || error) && (
        <div className="mt-4 rounded-xl bg-white p-4">
          {error ? (
            <p className="font-semibold text-rose-700">{error}</p>
          ) : (
            <>
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="font-bold text-slate-500">Detected</p>
                  <p className="text-lg font-black capitalize text-slate-950">{result?.detected_label ?? '-'}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500">Expected</p>
                  <p className="text-lg font-black capitalize text-slate-950">{result?.expected_label ?? expected}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500">Confidence</p>
                  <p className="text-lg font-black text-slate-950">{result?.confidence_pct ?? 0}%</p>
                </div>
              </div>
              <p className={`mt-3 text-sm font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isCorrect
                  ? 'Correct item. EcoPoints were added and this challenge continues until 5 matching items are verified.'
                  : 'The item did not match the challenge target or confidence threshold. Try the same mission again.'}
              </p>
            </>
          )}
          <Button onClick={onReset} className="mt-4" variant={isCorrect ? 'default' : 'outline'}>
            {isCorrect ? 'Start Another Mission' : 'Try Again'}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default function ChallengesPage() {
  const [items, setItems] = useState(() => challengeSeed.map((challenge) => ({
    ...challenge,
    ...emptyProgress,
  })));
  const [activeMission, setActiveMission] = useState(null);
  const [missionError, setMissionError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
          setMissionError('Could not read mission status from the backend.');
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

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return items.filter((challenge) => (
      challenge.title.toLowerCase().includes(query) ||
      challenge.description.toLowerCase().includes(query) ||
      getExpectedLabel(challenge).includes(query)
    ));
  }, [items, searchQuery]);

  const activeChallenges = filteredItems.filter((challenge) => challenge.status !== 'completed');
  const completedChallenges = filteredItems.filter((challenge) => challenge.status === 'completed');
  const availablePoints = activeChallenges.reduce((sum, challenge) => {
    const remaining = Math.max(0, Number(challenge.goal_count ?? ITEMS_PER_CHALLENGE) - Number(challenge.completed_count ?? 0));
    return sum + (remaining * Number(challenge.points_value ?? 0));
  }, 0);

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
      setActiveMission(null);
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

  function resetMissionPanel() {
    setActiveMission(null);
    setMissionError('');
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[1.4px] text-emerald-700">Challenges</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">SmartBin Missions</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Choose one target item, complete it on the physical SmartBin, and wait for AI verification.
            </p>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search target..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-9 sm:w-64"
            />
          </div>
        </div>
      </section>

      <PointsUpdateSection data={dashboardData} activeMission={activeMission} latestReward={latestReward} error={pointsError} />

      <MissionStatusPanel mission={activeMission} error={missionError} onReset={resetMissionPanel} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Available missions</h2>
            <p className="text-sm text-slate-500">{activeChallenges.length} missions waiting for hardware verification</p>
          </div>
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
            +{availablePoints} pts available
          </span>
        </div>

        {activeChallenges.map((challenge) => (
          <ChallengeCard key={challenge.challenge_id} challenge={challenge} onTake={takeChallenge} activeMission={activeMission} />
        ))}

        {activeChallenges.length === 0 && (
          <Card className="border-emerald-100 bg-emerald-50">
            <CardContent className="flex items-center gap-3 p-5 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
              Every SmartBin mission is filled.
            </CardContent>
          </Card>
        )}
      </section>

      {completedChallenges.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Completed missions</h2>
            <p className="text-sm text-slate-500">Verified missions from this session</p>
          </div>
          {completedChallenges.map((challenge) => (
            <ChallengeCard key={challenge.challenge_id} challenge={challenge} onTake={takeChallenge} activeMission={activeMission} />
          ))}
        </section>
      )}
    </div>
  );
}
