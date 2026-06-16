'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye, Search, Camera, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// ─── helpers ──────────────────────────────────────────────────────────────────

function initialsFromName(name = '') {
  return (
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'
  );
}

function shortCampus(campus = '') {
  if (!campus) return '?';
  if (campus.length <= 6) return campus.toUpperCase();
  const initials = campus.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('');
  return initials.slice(0, 5) || campus.slice(0, 4).toUpperCase();
}

function normalizeSubmission(raw) {
  const user = raw.user ?? {};
  return {
    submission_id: raw.submission_id,
    user: {
      name: user.name ?? 'Unknown User',
      avatar: user.avatar ?? initialsFromName(user.name),
      campus: shortCampus(user.campus),
    },
    challenge: raw.challenge_title ?? 'Unknown challenge',
    proofType: raw.proof_type ?? 'photo',
    status: raw.status ?? 'pending',
    aiConfidence: raw.ai_confidence_pct ?? 0,
    submittedAt: raw.submitted_at ?? new Date().toISOString(),
    reviewedAt: raw.reviewed_at ?? null,
    reviewedBy: raw.reviewed_by ?? null,
    rejectionReason: raw.rejection_reason ?? null,
    points: raw.points_value ?? 0,
    ai_label: raw.ai_label ?? null,
  };
}

function getConfidenceColor(confidence) {
  if (confidence >= 85) return 'text-chart-5';
  if (confidence >= 50) return 'text-accent';
  return 'text-destructive';
}

function getConfidenceBg(confidence) {
  if (confidence >= 85) return 'bg-chart-5/10';
  if (confidence >= 50) return 'bg-accent/10';
  return 'bg-destructive/10';
}

// ─── component ────────────────────────────────────────────────────────────────

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [proofFilter, setProofFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/submissions');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSubmissions((data.submissions ?? []).map(normalizeSubmission));
      setError(null);
    } catch (err) {
      setError(`Failed to load submissions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const visible = submissions.filter((s) => {
    if (proofFilter !== 'all' && s.proofType !== proofFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.user.name.toLowerCase().includes(q) && !s.challenge.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const pendingSubmissions  = visible.filter((s) => s.status === 'pending');
  const approvedSubmissions = visible.filter((s) => s.status === 'approved');
  const rejectedSubmissions = visible.filter((s) => s.status === 'rejected');

  const totalPending  = submissions.filter((s) => s.status === 'pending').length;
  const totalApproved = submissions.filter((s) => s.status === 'approved').length;
  const totalRejected = submissions.filter((s) => s.status === 'rejected').length;

  const handleReview = (submission) => {
    setSelectedSubmission(submission);
    setReviewDialogOpen(true);
    setRejectionReason('');
  };

  const submitReview = async (action) => {
    if (!selectedSubmission) return;
    const { submission_id } = selectedSubmission;
    setReviewingId(submission_id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/submissions/${submission_id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: rejectionReason || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      setSubmissions((prev) =>
        prev.map((s) =>
          s.submission_id === submission_id
            ? {
                ...s,
                status: newStatus,
                reviewedBy: 'ADM-0001',
                reviewedAt: new Date().toISOString(),
                rejectionReason: action === 'reject' ? (rejectionReason || 'Rejected by admin') : null,
              }
            : s,
        ),
      );

      setReviewDialogOpen(false);
      setSelectedSubmission(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewingId(null);
    }
  };

  const isProcessing = reviewingId === selectedSubmission?.submission_id;

  const renderRows = (list) =>
    list.map((submission) => (
      <div key={submission.submission_id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
          {submission.user.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium">{submission.user.name}</p>
            <Badge variant="outline" className="text-xs">{submission.user.campus}</Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{submission.challenge}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          {submission.proofType === 'photo' ? <Camera className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
          <span>{submission.proofType === 'photo' ? 'Photo' : 'Smart Bin'}</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBg(submission.aiConfidence)} ${getConfidenceColor(submission.aiConfidence)}`}>
          AI: {submission.aiConfidence}%
        </div>
        <div className="text-sm font-medium text-primary">+{submission.points} pts</div>
        <div className="text-xs text-muted-foreground hidden md:block">
          {new Date(submission.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
        {submission.status === 'pending' ? (
          <Button size="sm" onClick={() => handleReview(submission)}>
            <Eye className="w-4 h-4 mr-1" />
            Review
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => handleReview(submission)}>
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>
    ));

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-muted-foreground">Review and verify challenge submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search submissions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-64" />
          </div>
          <Select value={proofFilter} onValueChange={setProofFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="photo">Photo</SelectItem>
              <SelectItem value="smart_bin">Smart Bin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '—' : totalPending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-chart-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '—' : totalApproved}</p>
                <p className="text-xs text-muted-foreground">Approved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '—' : totalRejected}</p>
                <p className="text-xs text-muted-foreground">Rejected Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved ({approvedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        {[
          { value: 'pending', list: pendingSubmissions },
          { value: 'approved', list: approvedSubmissions },
          { value: 'rejected', list: rejectedSubmissions },
        ].map(({ value, list }) => (
          <TabsContent key={value} value={value}>
            <Card className="border-border/50">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">Loading submissions…</div>
                ) : list.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No {value} submissions.</div>
                ) : (
                  <div className="divide-y divide-border/50">{renderRows(list)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>Verify the challenge completion and approve or reject the submission.</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {selectedSubmission.user.avatar}
                </div>
                <div>
                  <p className="font-medium">{selectedSubmission.user.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.user.campus}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Challenge</p>
                <p className="font-medium">{selectedSubmission.challenge}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Proof Submitted</p>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  {selectedSubmission.proofType === 'photo' ? (
                    <div className="text-center text-muted-foreground">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Photo Proof</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Leaf className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Auto-verified via Smart Bin</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground">
                  AI Confidence Score
                  {selectedSubmission.ai_label && (
                    <span className="ml-2 capitalize font-medium text-foreground">({selectedSubmission.ai_label})</span>
                  )}
                </div>
                <span className={`text-lg font-bold ${getConfidenceColor(selectedSubmission.aiConfidence)}`}>
                  {selectedSubmission.aiConfidence}%
                </span>
              </div>

              {selectedSubmission.status === 'pending' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Rejection Reason (optional)</p>
                  <Textarea placeholder="Enter reason if rejecting..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                </div>
              )}

              {selectedSubmission.status !== 'pending' && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reviewed by</span>
                    <span>{selectedSubmission.reviewedBy ?? '—'}</span>
                  </div>
                  {selectedSubmission.reviewedAt && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Reviewed at</span>
                      <span>{new Date(selectedSubmission.reviewedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedSubmission.rejectionReason && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">Rejection Reason:</p>
                      <p className="text-sm">{selectedSubmission.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedSubmission?.status === 'pending' && (
            <DialogFooter className="gap-2">
              <Button variant="destructive" onClick={() => submitReview('reject')} disabled={isProcessing}>
                <XCircle className="w-4 h-4 mr-1" />
                {isProcessing ? 'Processing…' : 'Reject'}
              </Button>
              <Button onClick={() => submitReview('approve')} disabled={isProcessing}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {isProcessing ? 'Processing…' : 'Approve'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
