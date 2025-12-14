// Challenge system for daily/weekly special challenges

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: "daily" | "weekly";
  requirement: {
    type: "quest_count" | "streak" | "habit_completion" | "total_xp" | "gate_clear";
    target: number;
    current: number;
  };
  rewards: {
    xp: number;
    gold?: number;
    gems?: number;
    credits?: number;
  };
  status: "active" | "completed" | "expired";
  startDate: string;
  endDate: string;
  completedDate?: string;
}

export const generateDailyChallenge = (): Challenge => {
  const challenges = [
    {
      name: "Daily Grind",
      description: "Complete 5 quests today",
      requirement: { type: "quest_count" as const, target: 5, current: 0 },
      rewards: { xp: 200, credits: 30, gold: 50 },
    },
    {
      name: "Perfect Day",
      description: "Complete all daily quests without missing any",
      requirement: { type: "quest_count" as const, target: -1, current: 0 }, // -1 means all quests (percentage-based)
      rewards: { xp: 300, credits: 40, gems: 5 },
    },
    {
      name: "Habit Warrior",
      description: "Complete 3 habits today",
      requirement: { type: "habit_completion" as const, target: 3, current: 0 },
      rewards: { xp: 250, gold: 80, credits: 35 },
    },
  ];

  const selected = challenges[Math.floor(Math.random() * challenges.length)];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return {
    id: `daily-${Date.now()}`,
    ...selected,
    type: "daily",
    status: "active",
    startDate: today.toISOString(),
    endDate: tomorrow.toISOString(),
  };
};

// Special legendary challenge for Necromancer class unlock
export type NecromancerMode = "normal" | "hard" | null;

export interface LegendaryChallenge {
  id: string;
  name: string;
  description: string;
  requirement: {
    type: "streak";
    target: number;
    current: number;
  };
  reward: {
    type: "class_unlock";
    classId: string;
    className: string;
  };
  status: "pending" | "active" | "completed";
  mode: NecromancerMode;
  acceptedDate?: string;
  completedDate?: string;
}

export interface NecromancerRewards {
  normal: {
    classUnlock: string;
  };
  hard: {
    classUnlock: string;
    levels: number;
    stats: number;
    credits: number;
    gold: number;
    gems: number;
  };
}

export const NECROMANCER_REWARDS: NecromancerRewards = {
  normal: {
    classUnlock: "necromancer",
  },
  hard: {
    classUnlock: "necromancer",
    levels: 10,
    stats: 20,
    credits: 100,
    gold: 5,
    gems: 5,
  },
};

export const NECROMANCER_CHALLENGE: LegendaryChallenge = {
  id: "necromancer-unlock",
  name: "Path of the Necromancer",
  description: "Complete 90 consecutive days of quests without missing a streak to unlock the Necromancer class",
  requirement: { type: "streak", target: 90, current: 0 },
  reward: { type: "class_unlock", classId: "necromancer", className: "Necromancer" },
  status: "pending",
  mode: null,
};

export const generateWeeklyChallenge = (): Challenge => {
  const challenges = [
    {
      name: "Weekly Warrior",
      description: "Complete 50 quests this week",
      requirement: { type: "quest_count" as const, target: 50, current: 0 },
      rewards: { xp: 1500, credits: 200, gold: 500, gems: 20 },
    },
    {
      name: "Streak Master",
      description: "Maintain a 7-day streak",
      requirement: { type: "streak" as const, target: 7, current: 0 },
      rewards: { xp: 2000, gold: 800, gems: 30 },
    },
    {
      name: "Gate Conqueror",
      description: "Clear 1 gate this week",
      requirement: { type: "gate_clear" as const, target: 1, current: 0 },
      rewards: { xp: 2500, credits: 300, gold: 1000, gems: 50 },
    },
    {
      name: "XP Hunter",
      description: "Earn 5000 XP this week",
      requirement: { type: "total_xp" as const, target: 5000, current: 0 },
      rewards: { xp: 1000, credits: 150, gold: 600, gems: 25 },
    },
  ];

  const selected = challenges[Math.floor(Math.random() * challenges.length)];
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return {
    id: `weekly-${Date.now()}`,
    ...selected,
    type: "weekly",
    status: "active",
    startDate: today.toISOString(),
    endDate: nextWeek.toISOString(),
  };
};
