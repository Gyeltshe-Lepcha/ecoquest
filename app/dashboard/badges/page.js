'use client';
import { motion } from 'framer-motion';
import { Award, Leaf, Recycle, Trophy, Flame, Target, Star, Zap, Crown, Heart, Sprout, TreePine, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
const badges = [
    // Earned badges
    {
        id: 1,
        name: 'First Steps',
        description: 'Complete your first challenge',
        icon: Sprout,
        rarity: 'common',
        earned: true,
        earnedDate: '2025-01-15',
        progress: 100,
    },
    {
        id: 2,
        name: 'Plastic Champion',
        description: 'Recycle 100 plastic items',
        icon: Recycle,
        rarity: 'uncommon',
        earned: true,
        earnedDate: '2025-01-28',
        progress: 100,
    },
    {
        id: 3,
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: Flame,
        rarity: 'uncommon',
        earned: true,
        earnedDate: '2025-02-05',
        progress: 100,
    },
    {
        id: 4,
        name: 'Eco Enthusiast',
        description: 'Complete 25 challenges',
        icon: Leaf,
        rarity: 'uncommon',
        earned: true,
        earnedDate: '2025-02-12',
        progress: 100,
    },
    {
        id: 5,
        name: 'Smart Sorter',
        description: 'Use smart bins 50 times',
        icon: Target,
        rarity: 'rare',
        earned: true,
        earnedDate: '2025-02-20',
        progress: 100,
    },
    // In progress badges
    {
        id: 6,
        name: 'Streak Master',
        description: 'Maintain a 30-day streak',
        icon: Zap,
        rarity: 'rare',
        earned: false,
        progress: 50,
        current: 15,
        target: 30,
    },
    {
        id: 7,
        name: 'Century Challenger',
        description: 'Complete 100 challenges',
        icon: Trophy,
        rarity: 'epic',
        earned: false,
        progress: 47,
        current: 47,
        target: 100,
    },
    {
        id: 8,
        name: 'Community Leader',
        description: 'Reach top 10 on campus leaderboard',
        icon: Crown,
        rarity: 'epic',
        earned: false,
        progress: 80,
        current: 12,
        target: 10,
    },
    // Locked badges
    {
        id: 9,
        name: 'Eco Legend',
        description: 'Earn 10,000 total points',
        icon: Star,
        rarity: 'legendary',
        earned: false,
        progress: 24,
        current: 2450,
        target: 10000,
    },
    {
        id: 10,
        name: 'Forest Guardian',
        description: 'Save the equivalent of 10 trees',
        icon: TreePine,
        rarity: 'legendary',
        earned: false,
        progress: 4,
        current: 0.4,
        target: 10,
    },
    {
        id: 11,
        name: 'Zero Waste Hero',
        description: 'Complete all challenge types',
        icon: Heart,
        rarity: 'legendary',
        earned: false,
        progress: 60,
        current: 3,
        target: 5,
    },
];
function getRarityStyles(rarity) {
    switch (rarity) {
        case 'common':
            return {
                bg: 'bg-muted',
                border: 'border-border',
                text: 'text-muted-foreground',
                glow: '',
                label: 'Common',
            };
        case 'uncommon':
            return {
                bg: 'bg-chart-5/10',
                border: 'border-chart-5/30',
                text: 'text-chart-5',
                glow: '',
                label: 'Uncommon',
            };
        case 'rare':
            return {
                bg: 'bg-chart-4/10',
                border: 'border-chart-4/30',
                text: 'text-chart-4',
                glow: '',
                label: 'Rare',
            };
        case 'epic':
            return {
                bg: 'bg-chart-2/10',
                border: 'border-chart-2/30',
                text: 'text-chart-2',
                glow: 'shadow-chart-2/20 shadow-lg',
                label: 'Epic',
            };
        case 'legendary':
            return {
                bg: 'bg-accent/10',
                border: 'border-accent/30',
                text: 'text-accent',
                glow: 'shadow-accent/20 shadow-xl',
                label: 'Legendary',
            };
        default:
            return {
                bg: 'bg-muted',
                border: 'border-border',
                text: 'text-muted-foreground',
                glow: '',
                label: '',
            };
    }
}
function BadgeCard({ badge }) {
    const rarity = getRarityStyles(badge.rarity);
    const isLocked = !badge.earned && badge.progress < 20;
    return (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: badge.earned ? 1.02 : 1 }} transition={{ duration: 0.2 }}>
      <Card className={cn("relative overflow-hidden transition-all", badge.earned ? rarity.glow : "opacity-80", rarity.border)}>
        {badge.earned && (<div className="absolute top-2 right-2">
            <div className={cn("px-2 py-0.5 rounded-full text-xs font-medium", rarity.bg, rarity.text)}>
              {rarity.label}
            </div>
          </div>)}
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative", badge.earned ? rarity.bg : "bg-muted")}>
            {isLocked ? (<Lock className="w-8 h-8 text-muted-foreground"/>) : (<badge.icon className={cn("w-8 h-8", badge.earned ? rarity.text : "text-muted-foreground")}/>)}
            {badge.earned && (<div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-chart-5 flex items-center justify-center">
                <Award className="w-4 h-4 text-white"/>
              </div>)}
          </div>
          <h3 className={cn("font-semibold mb-1", isLocked && "text-muted-foreground")}>
            {badge.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{badge.description}</p>
          
          {badge.earned ? (<p className="text-xs text-muted-foreground">
              Earned on {new Date(badge.earnedDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}
            </p>) : (<div className="w-full space-y-2">
              <Progress value={badge.progress} className="h-2"/>
              <p className="text-xs text-muted-foreground">
                {badge.current} / {badge.target}
              </p>
            </div>)}
        </CardContent>
      </Card>
    </motion.div>);
}
export default function BadgesPage() {
    const earnedBadges = badges.filter(b => b.earned);
    const inProgressBadges = badges.filter(b => !b.earned && b.progress >= 20);
    const lockedBadges = badges.filter(b => !b.earned && b.progress < 20);
    return (<div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Badges & Achievements</h1>
        <p className="text-muted-foreground">Collect badges by completing milestones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{earnedBadges.length}</p>
                <p className="text-xs text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-chart-4"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressBadges.length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-accent"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{earnedBadges.filter(b => b.rarity === 'rare' || b.rarity === 'epic').length}</p>
                <p className="text-xs text-muted-foreground">Rare+ Badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{lockedBadges.length}</p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Badges */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary"/>
          Earned Badges ({earnedBadges.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {earnedBadges.map((badge, index) => (<motion.div key={badge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <BadgeCard badge={badge}/>
            </motion.div>))}
        </div>
      </div>

      {/* In Progress */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-chart-4"/>
          In Progress ({inProgressBadges.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inProgressBadges.map((badge, index) => (<motion.div key={badge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <BadgeCard badge={badge}/>
            </motion.div>))}
        </div>
      </div>

      {/* Locked Badges */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-muted-foreground"/>
          Locked ({lockedBadges.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {lockedBadges.map((badge, index) => (<motion.div key={badge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <BadgeCard badge={badge}/>
            </motion.div>))}
        </div>
      </div>
    </div>);
}
