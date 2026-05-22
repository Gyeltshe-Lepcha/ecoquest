'use client';
import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye, Search, Camera, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
const submissions = [
    {
        id: 1,
        user: { name: 'Tshering Dorji', avatar: 'TD', campus: 'CST' },
        challenge: 'Sort your plastic waste today',
        proofType: 'photo',
        status: 'pending',
        aiConfidence: 72,
        submittedAt: '2025-05-21T10:30:00',
        points: 10,
    },
    {
        id: 2,
        user: { name: 'Karma Wangmo', avatar: 'KW', campus: 'RTC' },
        challenge: 'Compost food waste',
        proofType: 'photo',
        status: 'pending',
        aiConfidence: 65,
        submittedAt: '2025-05-21T10:15:00',
        points: 20,
    },
    {
        id: 3,
        user: { name: 'Pema Gyalpo', avatar: 'PG', campus: 'CST' },
        challenge: 'Paper recycling challenge',
        proofType: 'photo',
        status: 'pending',
        aiConfidence: 58,
        submittedAt: '2025-05-21T10:00:00',
        points: 10,
    },
    {
        id: 4,
        user: { name: 'Sonam Choden', avatar: 'SC', campus: 'JNEC' },
        challenge: 'Zero single-use plastic day',
        proofType: 'photo',
        status: 'approved',
        aiConfidence: 92,
        submittedAt: '2025-05-21T09:45:00',
        reviewedAt: '2025-05-21T09:50:00',
        reviewedBy: 'Admin',
        points: 25,
    },
    {
        id: 5,
        user: { name: 'Dorji Wangchuk', avatar: 'DW', campus: 'GCBS' },
        challenge: 'Use the smart bin 3 times',
        proofType: 'smart_bin',
        status: 'approved',
        aiConfidence: 100,
        submittedAt: '2025-05-21T09:30:00',
        reviewedAt: '2025-05-21T09:30:00',
        reviewedBy: 'Auto-verified',
        points: 15,
    },
    {
        id: 6,
        user: { name: 'Kinley Zam', avatar: 'KZ', campus: 'SCE' },
        challenge: 'Recycled 10 plastic bottles',
        proofType: 'photo',
        status: 'rejected',
        aiConfidence: 35,
        submittedAt: '2025-05-21T09:15:00',
        reviewedAt: '2025-05-21T09:25:00',
        reviewedBy: 'Admin',
        rejectionReason: 'Image unclear - please retake with better lighting',
        points: 15,
    },
];
function getConfidenceColor(confidence) {
    if (confidence >= 85)
        return 'text-chart-5';
    if (confidence >= 50)
        return 'text-accent';
    return 'text-destructive';
}
function getConfidenceBg(confidence) {
    if (confidence >= 85)
        return 'bg-chart-5/10';
    if (confidence >= 50)
        return 'bg-accent/10';
    return 'bg-destructive/10';
}
export default function SubmissionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    const approvedSubmissions = submissions.filter(s => s.status === 'approved');
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');
    const handleReview = (submission) => {
        setSelectedSubmission(submission);
        setReviewDialogOpen(true);
        setRejectionReason('');
    };
    const handleApprove = () => {
        // Handle approval logic
        setReviewDialogOpen(false);
        setSelectedSubmission(null);
    };
    const handleReject = () => {
        // Handle rejection logic
        setReviewDialogOpen(false);
        setSelectedSubmission(null);
        setRejectionReason('');
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-muted-foreground">Review and verify challenge submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <Input placeholder="Search submissions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-64"/>
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter"/>
            </SelectTrigger>
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
                <Clock className="w-5 h-5 text-accent"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingSubmissions.length}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-chart-5"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedSubmissions.length}</p>
                <p className="text-xs text-muted-foreground">Approved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedSubmissions.length}</p>
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
            <Clock className="w-4 h-4"/>
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="w-4 h-4"/>
            Approved ({approvedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4"/>
            Rejected ({rejectedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'rejected'].map((status) => (<TabsContent key={status} value={status}>
            <Card className="border-border/50">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {submissions
                .filter(s => s.status === status)
                .map((submission) => (<div key={submission.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {submission.user.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{submission.user.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {submission.user.campus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{submission.challenge}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                          {submission.proofType === 'photo' ? (<Camera className="w-4 h-4"/>) : (<Leaf className="w-4 h-4"/>)}
                          <span>{submission.proofType === 'photo' ? 'Photo' : 'Smart Bin'}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBg(submission.aiConfidence)} ${getConfidenceColor(submission.aiConfidence)}`}>
                          AI: {submission.aiConfidence}%
                        </div>
                        <div className="text-sm font-medium text-primary">
                          +{submission.points} pts
                        </div>
                        <div className="text-xs text-muted-foreground hidden md:block">
                          {new Date(submission.submittedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                        </div>
                        {status === 'pending' ? (<Button size="sm" onClick={() => handleReview(submission)}>
                            <Eye className="w-4 h-4 mr-1"/>
                            Review
                          </Button>) : (<Button variant="ghost" size="sm" onClick={() => handleReview(submission)}>
                            <Eye className="w-4 h-4"/>
                          </Button>)}
                      </div>))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>))}
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              Verify the challenge completion and approve or reject the submission.
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (<div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {selectedSubmission.user.avatar}
                </div>
                <div>
                  <p className="font-medium">{selectedSubmission.user.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.user.campus}</p>
                </div>
              </div>

              {/* Challenge Info */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Challenge</p>
                <p className="font-medium">{selectedSubmission.challenge}</p>
              </div>

              {/* Proof Preview */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Proof Submitted</p>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  {selectedSubmission.proofType === 'photo' ? (<div className="text-center text-muted-foreground">
                      <Camera className="w-8 h-8 mx-auto mb-2"/>
                      <p className="text-sm">Photo Proof</p>
                    </div>) : (<div className="text-center text-muted-foreground">
                      <Leaf className="w-8 h-8 mx-auto mb-2"/>
                      <p className="text-sm">Auto-verified via Smart Bin</p>
                    </div>)}
                </div>
              </div>

              {/* AI Confidence */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="text-sm text-muted-foreground">AI Confidence Score</span>
                <span className={`text-lg font-bold ${getConfidenceColor(selectedSubmission.aiConfidence)}`}>
                  {selectedSubmission.aiConfidence}%
                </span>
              </div>

              {/* Rejection Reason (for pending) */}
              {selectedSubmission.status === 'pending' && (<div>
                  <p className="text-sm text-muted-foreground mb-2">Rejection Reason (optional)</p>
                  <Textarea placeholder="Enter reason if rejecting..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}/>
                </div>)}

              {/* Previous Review Info */}
              {selectedSubmission.status !== 'pending' && (<div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reviewed by</span>
                    <span>{selectedSubmission.reviewedBy}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Reviewed at</span>
                    <span>{new Date(selectedSubmission.reviewedAt).toLocaleString()}</span>
                  </div>
                  {selectedSubmission.rejectionReason && (<div className="mt-2 pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">Rejection Reason:</p>
                      <p className="text-sm">{selectedSubmission.rejectionReason}</p>
                    </div>)}
                </div>)}
            </div>)}

          {selectedSubmission?.status === 'pending' && (<DialogFooter className="gap-2">
              <Button variant="destructive" onClick={handleReject}>
                <XCircle className="w-4 h-4 mr-1"/>
                Reject
              </Button>
              <Button onClick={handleApprove}>
                <CheckCircle2 className="w-4 h-4 mr-1"/>
                Approve
              </Button>
            </DialogFooter>)}
        </DialogContent>
      </Dialog>
    </div>);
}
