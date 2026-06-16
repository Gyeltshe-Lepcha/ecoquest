export const campuses = [
  { value: 'cst', label: 'College of Science and Technology', short: 'CST' },
  { value: 'rtc', label: 'Royal Thimphu College', short: 'RTC' },
  { value: 'jnec', label: 'Jigme Namgyel Engineering College', short: 'JNEC' },
  { value: 'gcbs', label: 'Gaeddu College of Business Studies', short: 'GCBS' },
  { value: 'sce', label: 'Samtse College of Education', short: 'SCE' },
  { value: 'cnr', label: 'College of Natural Resources', short: 'CNR' },
  { value: 'household', label: 'Household / General User', short: 'HOME' },
];

export const users = [
  {
    user_id: 'USR-0042',
    name: 'Tshering Dorji',
    email: 'tshering@cst.edu.bt',
    phone: '+975 17 234 567',
    password_hash: '$2b$10$prototype.hash.for.demo.only',
    campus: 'College of Science and Technology',
    hostel: 'Kuenphen Hostel',
    total_points: 2450,
    streak_days: 15,
    role: 'user',
    avatar: 'TD',
    created_at: '2025-01-15T09:00:00Z',
  },
  {
    user_id: 'USR-0098',
    name: 'Karma Wangmo',
    email: 'karma@rtc.edu.bt',
    phone: '+975 17 345 678',
    password_hash: '$2b$10$prototype.hash.for.demo.only',
    campus: 'Royal Thimphu College',
    hostel: 'Dechencholing',
    total_points: 2280,
    streak_days: 12,
    role: 'user',
    avatar: 'KW',
    created_at: '2025-01-18T09:00:00Z',
  },
  {
    user_id: 'USR-0104',
    name: 'Pema Gyalpo',
    email: 'pema@cst.edu.bt',
    phone: '+975 17 456 789',
    password_hash: '$2b$10$prototype.hash.for.demo.only',
    campus: 'College of Science and Technology',
    hostel: 'Norzin Hostel',
    total_points: 2150,
    streak_days: 10,
    role: 'user',
    avatar: 'PG',
    created_at: '2025-01-20T09:00:00Z',
  },
  {
    user_id: 'ADM-0001',
    name: 'EcoQuest Admin',
    email: 'admin@ecoquest.bt',
    phone: '+975 02 123 456',
    password_hash: '$2b$10$prototype.admin.hash.for.demo.only',
    campus: 'National Pilot',
    hostel: 'Operations',
    total_points: 0,
    streak_days: 0,
    role: 'admin',
    avatar: 'AD',
    created_at: '2025-01-01T09:00:00Z',
  },
];

export const challenges = [
  {
    challenge_id: 'CH-001',
    title: 'Challenge 1',
    description: 'Reach 300 EcoPoints through AI-verified SmartBin deposits.',
    proof_type: 'smart_bin',
    points_value: 300,
    milestone_points: 300,
    difficulty: 'easy',
    deadline: '2026-05-23T23:59:00+06:00',
    cadence: 'daily',
    category: 'ecopoints',
    status: 'active',
    created_by: 'ADM-0001',
  },
  {
    challenge_id: 'CH-002',
    title: 'Challenge 2',
    description: 'Reach 600 EcoPoints through AI-verified SmartBin deposits.',
    proof_type: 'smart_bin',
    points_value: 600,
    milestone_points: 600,
    difficulty: 'easy',
    deadline: '2026-05-23T23:59:00+06:00',
    cadence: 'daily',
    category: 'ecopoints',
    status: 'active',
    created_by: 'ADM-0001',
  },
  {
    challenge_id: 'CH-003',
    title: 'Challenge 3',
    description: 'Reach 1000 EcoPoints through AI-verified SmartBin deposits.',
    proof_type: 'smart_bin',
    points_value: 1000,
    milestone_points: 1000,
    difficulty: 'medium',
    deadline: '2026-05-23T23:59:00+06:00',
    cadence: 'daily',
    category: 'ecopoints',
    status: 'active',
    created_by: 'ADM-0001',
  },
  {
    challenge_id: 'CH-004',
    title: 'Challenge 4',
    description: 'Reach 1500 EcoPoints through AI-verified SmartBin deposits.',
    proof_type: 'smart_bin',
    points_value: 1500,
    milestone_points: 1500,
    difficulty: 'hard',
    deadline: '2026-05-23T23:59:00+06:00',
    cadence: 'daily',
    category: 'ecopoints',
    status: 'active',
    created_by: 'ADM-0001',
  },
];

export const submissions = [
  {
    submission_id: 'SUB-1001',
    user_id: 'USR-0042',
    challenge_id: 'CH-001',
    proof_url: '/placeholder.jpg',
    ai_confidence: 0.72,
    status: 'pending',
    reviewed_by: null,
    submitted_at: '2026-05-22T10:30:00+06:00',
  },
  {
    submission_id: 'SUB-1002',
    user_id: 'USR-0098',
    challenge_id: 'CH-003',
    proof_url: '/placeholder.jpg',
    ai_confidence: 0.92,
    status: 'approved',
    reviewed_by: 'AI Auto-Approval',
    submitted_at: '2026-05-22T09:45:00+06:00',
  },
  {
    submission_id: 'SUB-1003',
    user_id: 'USR-0104',
    challenge_id: 'CH-006',
    proof_url: '/placeholder.jpg',
    ai_confidence: 0.35,
    status: 'rejected',
    reviewed_by: 'EcoQuest Admin',
    submitted_at: '2026-05-22T09:15:00+06:00',
    rejection_reason: 'Proof unclear. Retake the photo with better lighting.',
  },
];

export const smartBins = [
  {
    bin_id: 'BIN-001',
    location_name: 'CST Block A',
    fill_level_pct: 92,
    last_deposit_at: '2026-05-22T15:42:00+06:00',
    user_id_last: 'USR-0042',
    is_full: true,
    last_synced_at: '2026-05-22T15:47:00+06:00',
    battery_level_pct: 78,
    online: true,
    total_deposits: 1247,
  },
  {
    bin_id: 'BIN-002',
    location_name: 'CST Canteen',
    fill_level_pct: 45,
    last_deposit_at: '2026-05-22T15:39:00+06:00',
    user_id_last: 'USR-0104',
    is_full: false,
    last_synced_at: '2026-05-22T15:44:00+06:00',
    battery_level_pct: 92,
    online: true,
    total_deposits: 2156,
  },
  {
    bin_id: 'BIN-003',
    location_name: 'CST Library',
    fill_level_pct: 78,
    last_deposit_at: '2026-05-22T15:12:00+06:00',
    user_id_last: 'USR-0098',
    is_full: false,
    last_synced_at: '2026-05-22T15:17:00+06:00',
    battery_level_pct: 65,
    online: true,
    total_deposits: 892,
  },
  {
    bin_id: 'BIN-006',
    location_name: 'JNEC Canteen',
    fill_level_pct: 56,
    last_deposit_at: '2026-05-22T13:12:00+06:00',
    user_id_last: null,
    is_full: false,
    last_synced_at: '2026-05-22T13:18:00+06:00',
    battery_level_pct: 12,
    online: false,
    total_deposits: 765,
  },
];

export const notifications = [
  {
    id: 'NOT-001',
    type: 'verification',
    title: 'Verification pending',
    body: 'Your plastic sorting proof is waiting for admin review.',
    priority: 'medium',
    unread: true,
    created_at: '2026-05-22T15:10:00+06:00',
  },
  {
    id: 'NOT-002',
    type: 'deadline',
    title: 'Challenge deadline soon',
    body: 'Compost food waste closes in 2 hours.',
    priority: 'medium',
    unread: true,
    created_at: '2026-05-22T14:30:00+06:00',
  },
  {
    id: 'NOT-003',
    type: 'bin_alert',
    title: 'BIN-001 is above 80%',
    body: 'CST Block A needs pickup scheduling.',
    priority: 'high',
    unread: true,
    created_at: '2026-05-22T13:45:00+06:00',
  },
  {
    id: 'NOT-004',
    type: 'badge',
    title: 'Badge earned',
    body: 'You unlocked Plastic Champion.',
    priority: 'low',
    unread: false,
    created_at: '2026-05-21T17:20:00+06:00',
  },
];

export const badgeCollection = [
  { name: 'First Steps', milestone: 'Complete your first challenge', progress: 100, rarity: 'common' },
  { name: 'Plastic Champion', milestone: 'Recycle 100 plastic items', progress: 100, rarity: 'uncommon' },
  { name: 'Week Warrior', milestone: 'Maintain a 7-day streak', progress: 100, rarity: 'uncommon' },
  { name: 'Streak Master', milestone: 'Maintain a 30-day streak', progress: 50, rarity: 'rare' },
  { name: 'Eco Legend', milestone: 'Earn 10,000 total points', progress: 24, rarity: 'legendary' },
];

export const wasteTrend = [
  { day: 'Mon', challenges: 245, binUsage: 180, wasteDiverted: 62 },
  { day: 'Tue', challenges: 312, binUsage: 210, wasteDiverted: 74 },
  { day: 'Wed', challenges: 287, binUsage: 195, wasteDiverted: 71 },
  { day: 'Thu', challenges: 356, binUsage: 245, wasteDiverted: 86 },
  { day: 'Fri', challenges: 298, binUsage: 220, wasteDiverted: 79 },
  { day: 'Sat', challenges: 189, binUsage: 145, wasteDiverted: 51 },
  { day: 'Sun', challenges: 167, binUsage: 130, wasteDiverted: 47 },
];

export function publicUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export function challengeById(challengeId) {
  return challenges.find((challenge) => challenge.challenge_id === challengeId);
}

export function userById(userId) {
  return users.find((user) => user.user_id === userId);
}

export function submissionView(submission) {
  const challenge = challengeById(submission.challenge_id);
  const user = userById(submission.user_id);

  return {
    ...submission,
    ai_confidence_pct: Math.round(submission.ai_confidence * 100),
    challenge_title: challenge?.title ?? 'Unknown challenge',
    points_value: challenge?.points_value ?? 0,
    proof_type: challenge?.proof_type ?? 'photo',
    user: publicUser(user),
  };
}

export function activityCsv() {
  const rows = [
    ['date', 'challenges_completed', 'smart_bin_uses', 'waste_diverted_kg'],
    ...wasteTrend.map((row) => [row.day, row.challenges, row.binUsage, row.wasteDiverted]),
  ];

  return rows.map((row) => row.join(',')).join('\n');
}
