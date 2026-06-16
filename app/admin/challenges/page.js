'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Edit3, FileQuestion, ImageUp, Plus, QrCode, Search, ThumbsUp, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const proofIcons = {
  photo: ImageUp,
  smart_bin: QrCode,
  quiz: FileQuestion,
  peer_vote: ThumbsUp,
};

const difficultyPoints = {
  easy: 5,
  medium: 10,
  hard: 20,
};

function emptyChallenge() {
  return {
    title: '',
    description: '',
    proof_type: 'photo',
    points_value: 10,
    difficulty: 'medium',
    cadence: 'daily',
    category: 'recycling',
    deadline: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 16),
  };
}

export default function AdminChallengesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyChallenge());
  const [saving, setSaving] = useState(false);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/challenges');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.challenges ?? []);
      setError(null);
    } catch (err) {
      setError(`Failed to load challenges: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const filtered = useMemo(
    () =>
      items.filter(
        (c) =>
          (c.title ?? '').toLowerCase().includes(query.toLowerCase()) ||
          (c.category ?? '').toLowerCase().includes(query.toLowerCase()) ||
          (c.proof_type ?? '').toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  const startCreate = () => {
    setEditingId(null);
    setDraft(emptyChallenge());
    setDialogOpen(true);
  };

  const startEdit = (challenge) => {
    setEditingId(challenge.challenge_id);
    setDraft({ ...challenge, deadline: challenge.deadline ? challenge.deadline.slice(0, 16) : '' });
    setDialogOpen(true);
  };

  const saveChallenge = async () => {
    if (!draft.title?.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const body = { ...draft, points_value: Number(draft.points_value) };
      if (editingId) {
        const res = await fetch(`/api/admin/challenges/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
        const { challenge } = await res.json();
        setItems((prev) => prev.map((c) => (c.challenge_id === editingId ? challenge : c)));
      } else {
        const res = await fetch('/api/admin/challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
        const { challenge } = await res.json();
        setItems((prev) => [challenge, ...prev]);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteChallenge = async (challengeId) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      setItems((prev) => prev.filter((c) => c.challenge_id !== challengeId));
    } catch (err) {
      setError(err.message);
    }
  };

  const applyDifficulty = (difficulty) => {
    setDraft((prev) => ({ ...prev, difficulty, points_value: difficultyPoints[difficulty] }));
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Challenge Management</h1>
          <p className="text-muted-foreground">Create, edit, delete, and schedule daily or weekly tasks.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-52 pl-9" />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={startCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Challenge' : 'Create Challenge'}</DialogTitle>
                <DialogDescription>Every challenge includes proof type, points, difficulty, and deadline.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Proof type</Label>
                  <Select value={draft.proof_type} onValueChange={(proof_type) => setDraft({ ...draft, proof_type })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo">Photo submission</SelectItem>
                      <SelectItem value="smart_bin">Smart bin usage</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="peer_vote">Peer vote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={draft.difficulty} onValueChange={applyDifficulty}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (5 pts)</SelectItem>
                      <SelectItem value="medium">Medium (10 pts)</SelectItem>
                      <SelectItem value="hard">Hard (20 pts)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input id="points" type="number" value={draft.points_value} onChange={(e) => setDraft({ ...draft, points_value: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Cadence</Label>
                  <Select value={draft.cadence} onValueChange={(cadence) => setDraft({ ...draft, cadence })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" type="datetime-local" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
                </div>
              </div>
              <Button onClick={saveChallenge} disabled={saving || !draft.title?.trim()} className="w-full">
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create challenge'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl border border-border/50 bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {items.length === 0 ? 'No challenges yet. Create one above.' : 'No challenges match your search.'}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((challenge, index) => {
            const ProofIcon = proofIcons[challenge.proof_type] ?? ImageUp;
            return (
              <motion.div key={challenge.challenge_id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Card className="border-border/50 transition-shadow hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{challenge.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">{challenge.description}</CardDescription>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <ProofIcon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="capitalize">{(challenge.proof_type ?? '').replace('_', ' ')}</Badge>
                      <Badge variant="outline" className="capitalize">{challenge.difficulty}</Badge>
                      <Badge variant="outline">{challenge.points_value} pts</Badge>
                      <Badge variant="outline" className="capitalize">{challenge.cadence}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarClock className="h-4 w-4" />
                        {challenge.deadline ? new Date(challenge.deadline).toLocaleString() : '—'}
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="outline" onClick={() => startEdit(challenge)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => deleteChallenge(challenge.challenge_id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
