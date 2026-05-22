'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Leaf,
  QrCode,
  Search,
  Sparkles,
  Target,
  Trophy,
  Wifi,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { challenges as challengeSeed } from '@/lib/ecoquest-data';

const emptyProgress = {
  progress: 0,
  completed_count: 0,
  goal_count: 1,
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
                <div className="text-xs text-muted-foreground">points</div>
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
                  {missionActive ? 'Waiting...' : 'Take Challenge'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LiveSmartBinQuest({ iotData, items }) {
  const latest = iotData?.latest;
  const connected = Boolean(iotData?.connected);
  const latestLabel = latest?.label ? latest.label[0].toUpperCase() + latest.label.slice(1) : 'Waiting';
  const completed = items.filter((item) => item.status === 'completed').length;
  const progressPct = Math.round((completed / items.length) * 100);

  const workflowSteps = [
    {
      title: 'Mission armed',
      body: 'Take Challenge sends the target label to the ESP32 DevKit.',
      done: connected,
      icon: Target,
    },
    {
      title: 'Physical detection',
      body: 'Ultrasonic opens the lid; IR waits for object entry.',
      done: Boolean(latest),
      icon: QrCode,
    },
    {
      title: 'ESP32-CAM proof',
      body: latest ? `${latestLabel} captured from the camera path.` : 'Backend waits for /capture JPEG.',
      done: Boolean(latest),
      icon: Wifi,
    },
    {
      title: 'AI decision',
      body: latest ? `${latestLabel} classified at ${latest.confidence_pct}% confidence.` : 'Model result will complete or reject the mission.',
      done: Boolean(latest),
      icon: CheckCircle2,
    },
  ];

  return (
    <Card className="border-emerald-100 bg-emerald-50/60">
      <CardContent className="p-5">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[1.5px] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Live SmartBin Mission Board
            </div>
            <h2 className="text-xl font-bold text-emerald-950">Five empty quests, filled by real hardware</h2>
            <p className="mt-1 text-sm text-emerald-700">
              Each card starts at 0/1 and updates only after ESP32-CAM proof is classified by the AI model.
            </p>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[1.3px] text-emerald-600">Latest detection</p>
            <p className="text-2xl font-black text-emerald-950">{latestLabel}</p>
            <p className="text-xs font-semibold text-slate-500">{latest ? 'Synced from SmartBin' : 'No mission proof yet'}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Mission board progress</span>
              <span className="text-sm font-black text-emerald-700">{completed} / {items.length}</span>
            </div>
            <Progress value={progressPct} className="h-3" />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              {completed === 0 ? 'Empty for now. Start with plastic, then paper, bottle, and unknown.' : 'Completed missions are filled by live IoT verification.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {workflowSteps.map((step) => (
              <div key={step.title} className={`rounded-xl border bg-white p-3 ${step.done ? 'border-emerald-200' : 'border-slate-100'}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{step.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
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
            Mission: place one <span className="capitalize text-emerald-700">{expected}</span> item into the physical SmartBin.
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
            'Backend captures ESP32-CAM image and AI verifies target',
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
                  ? 'Correct item. The card is now filled and EcoPoints were added.'
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
  const [iotData, setIotData] = useState(null);
  const [activeMission, setActiveMission] = useState(null);
  const [missionError, setMissionError] = useState('');
  const [localPoints, setLocalPoints] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

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

        setActiveMission(result.mission);

        if (result.mission.status === 'correct') {
          setLocalPoints((current) => current + Number(result.mission.points_awarded ?? 5));
          fillChallenge(result.mission.challenge_id);
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
  const availablePoints = activeChallenges.reduce((sum, challenge) => sum + challenge.points_value, 0);

  function fillChallenge(challengeId) {
    setItems((current) => current.map((challenge) => (
      challenge.challenge_id === challengeId
        ? { ...challenge, status: 'completed', progress: 100, completed_count: 1 }
        : challenge
    )));
  }

  async function takeChallenge(challenge) {
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
        message: 'Sending start command to ESP32 DevKit...',
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

  function resetMissionPanel() {
    setActiveMission(null);
    setMissionError('');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Challenges</h1>
          <p className="text-muted-foreground">Five SmartBin missions. Empty until the physical IoT flow verifies them.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search target..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-9 sm:w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: 'Active', value: activeChallenges.length, icon: Target, color: 'text-primary' },
          { label: 'Filled', value: completedChallenges.length, icon: CheckCircle2, color: 'text-chart-5' },
          { label: 'Points available', value: availablePoints, icon: Sparkles, color: 'text-accent' },
          { label: 'Mission earned', value: `+${localPoints}`, icon: Trophy, color: 'text-chart-5' },
          { label: 'Targets', value: 4, icon: Leaf, color: 'text-chart-4' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <LiveSmartBinQuest iotData={iotData} items={items} />
      <MissionStatusPanel mission={activeMission} error={missionError} onReset={resetMissionPanel} />

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Target className="h-4 w-4" />
            Empty ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Filled ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.map((challenge) => (
            <ChallengeCard key={challenge.challenge_id} challenge={challenge} onTake={takeChallenge} activeMission={activeMission} />
          ))}
          {completedChallenges.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex items-center gap-3 p-5 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                No missions filled yet. Start with plastic.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
