// Achievement System - Permanent badges for milestones

export type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
export type AchievementCategory = "streak" | "power" | "gates" | "quests" | "habits" | "level" | "special";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  requirement: {
    type: "streak" | "power_level" | "gate_clear" | "gate_rank" | "quest_count" | "habit_count" | "level" | "total_xp" | "class_unlock" | "habit_win";
    value: number;
    gateRank?: string; // For gate_rank type
  };
  points: number; // Achievement points
  unlockedAt?: string; // ISO date when unlocked
}

export interface AchievementProgress {
  unlockedAchievements: string[]; // Array of achievement IDs
  totalPoints: number;
  lastChecked: string;
}

// Rarity configuration
export const RARITY_CONFIG: Record<AchievementRarity, { color: string; bgColor: string; borderColor: string; glow: string }> = {
  common: { 
    color: "text-slate-300", 
    bgColor: "bg-slate-500/20", 
    borderColor: "border-slate-500/50",
    glow: "shadow-[0_0_10px_hsl(215,20%,50%/0.3)]"
  },
  uncommon: { 
    color: "text-green-400", 
    bgColor: "bg-green-500/20", 
    borderColor: "border-green-500/50",
    glow: "shadow-[0_0_15px_hsl(142,70%,45%/0.4)]"
  },
  rare: { 
    color: "text-blue-400", 
    bgColor: "bg-blue-500/20", 
    borderColor: "border-blue-500/50",
    glow: "shadow-[0_0_15px_hsl(217,90%,60%/0.4)]"
  },
  epic: { 
    color: "text-purple-400", 
    bgColor: "bg-purple-500/20", 
    borderColor: "border-purple-500/50",
    glow: "shadow-[0_0_20px_hsl(270,70%,60%/0.5)]"
  },
  legendary: { 
    color: "text-amber-400", 
    bgColor: "bg-amber-500/20", 
    borderColor: "border-amber-500/50",
    glow: "shadow-[0_0_25px_hsl(45,90%,50%/0.5)]"
  },
  mythic: { 
    color: "text-rose-400", 
    bgColor: "bg-gradient-to-br from-rose-500/30 to-purple-500/30", 
    borderColor: "border-rose-500/50",
    glow: "shadow-[0_0_30px_hsl(350,80%,55%/0.6)]"
  },
};

export const CATEGORY_CONFIG: Record<AchievementCategory, { name: string; icon: string; color: string }> = {
  streak: { name: "Streak", icon: "🔥", color: "text-orange-400" },
  power: { name: "Power", icon: "⚡", color: "text-yellow-400" },
  gates: { name: "Gates", icon: "🚪", color: "text-purple-400" },
  quests: { name: "Quests", icon: "📜", color: "text-blue-400" },
  habits: { name: "Habits", icon: "🎯", color: "text-green-400" },
  level: { name: "Level", icon: "⭐", color: "text-amber-400" },
  special: { name: "Special", icon: "👑", color: "text-rose-400" },
};

// All achievements in the system
export const ACHIEVEMENTS: Achievement[] = [
  // ========== STREAK ACHIEVEMENTS (7) ==========
  {
    id: "first_flame",
    name: "First Flame",
    description: "Complete your first day streak",
    icon: "🕯️",
    category: "streak",
    rarity: "common",
    requirement: { type: "streak", value: 1 },
    points: 5,
  },
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    category: "streak",
    rarity: "uncommon",
    requirement: { type: "streak", value: 7 },
    points: 15,
  },
  {
    id: "fortnight_fighter",
    name: "Fortnight Fighter",
    description: "Maintain a 14-day streak",
    icon: "💪",
    category: "streak",
    rarity: "rare",
    requirement: { type: "streak", value: 14 },
    points: 30,
  },
  {
    id: "30_day_warrior",
    name: "30-Day Warrior",
    description: "Maintain a 30-day streak",
    icon: "⚔️",
    category: "streak",
    rarity: "epic",
    requirement: { type: "streak", value: 30 },
    points: 50,
  },
  {
    id: "iron_will",
    name: "Iron Will",
    description: "Maintain a 60-day streak",
    icon: "🛡️",
    category: "streak",
    rarity: "legendary",
    requirement: { type: "streak", value: 60 },
    points: 100,
  },
  {
    id: "shadow_monarch",
    name: "Shadow Monarch",
    description: "Achieve the legendary 90-day streak",
    icon: "👑",
    category: "streak",
    rarity: "mythic",
    requirement: { type: "streak", value: 90 },
    points: 200,
  },
  {
    id: "eternal_hunter",
    name: "Eternal Hunter",
    description: "Maintain a 180-day streak",
    icon: "🌟",
    category: "streak",
    rarity: "mythic",
    requirement: { type: "streak", value: 180 },
    points: 500,
  },

  // ========== POWER LEVEL ACHIEVEMENTS (6) ==========
  {
    id: "awakened",
    name: "Awakened",
    description: "Reach 100 total power",
    icon: "✨",
    category: "power",
    rarity: "common",
    requirement: { type: "power_level", value: 100 },
    points: 10,
  },
  {
    id: "rising_hunter",
    name: "Rising Hunter",
    description: "Reach 250 total power",
    icon: "📈",
    category: "power",
    rarity: "uncommon",
    requirement: { type: "power_level", value: 250 },
    points: 25,
  },
  {
    id: "power_surge",
    name: "Power Surge",
    description: "Reach 500 total power",
    icon: "⚡",
    category: "power",
    rarity: "rare",
    requirement: { type: "power_level", value: 500 },
    points: 50,
  },
  {
    id: "elite_hunter",
    name: "Elite Hunter",
    description: "Reach 1000 total power",
    icon: "💎",
    category: "power",
    rarity: "epic",
    requirement: { type: "power_level", value: 1000 },
    points: 100,
  },
  {
    id: "national_level",
    name: "National Level Hunter",
    description: "Reach 2500 total power",
    icon: "🏆",
    category: "power",
    rarity: "legendary",
    requirement: { type: "power_level", value: 2500 },
    points: 200,
  },
  {
    id: "transcendent",
    name: "Transcendent",
    description: "Reach 5000 total power - Beyond human limits",
    icon: "🌌",
    category: "power",
    rarity: "mythic",
    requirement: { type: "power_level", value: 5000 },
    points: 500,
  },

  // ========== GATE ACHIEVEMENTS (9) ==========
  {
    id: "first_gate",
    name: "First Gate Clear",
    description: "Clear your first gate",
    icon: "🚪",
    category: "gates",
    rarity: "common",
    requirement: { type: "gate_clear", value: 1 },
    points: 15,
  },
  {
    id: "gate_explorer",
    name: "Gate Explorer",
    description: "Clear 3 gates",
    icon: "🗺️",
    category: "gates",
    rarity: "uncommon",
    requirement: { type: "gate_clear", value: 3 },
    points: 30,
  },
  {
    id: "e_rank_hunter",
    name: "E-Rank Hunter",
    description: "Clear an E-Rank gate - Your journey begins",
    icon: "🇪",
    category: "gates",
    rarity: "common",
    requirement: { type: "gate_rank", value: 1, gateRank: "E-Rank" },
    points: 10,
  },
  {
    id: "d_rank_hunter",
    name: "D-Rank Hunter",
    description: "Clear a D-Rank gate",
    icon: "🇩",
    category: "gates",
    rarity: "uncommon",
    requirement: { type: "gate_rank", value: 1, gateRank: "D-Rank" },
    points: 20,
  },
  {
    id: "c_rank_hunter",
    name: "C-Rank Hunter",
    description: "Clear a C-Rank gate",
    icon: "🇨",
    category: "gates",
    rarity: "rare",
    requirement: { type: "gate_rank", value: 1, gateRank: "C-Rank" },
    points: 35,
  },
  {
    id: "b_rank_hunter",
    name: "B-Rank Hunter",
    description: "Clear a B-Rank gate",
    icon: "🅱️",
    category: "gates",
    rarity: "rare",
    requirement: { type: "gate_rank", value: 1, gateRank: "B-Rank" },
    points: 50,
  },
  {
    id: "a_rank_hunter",
    name: "A-Rank Hunter",
    description: "Clear an A-Rank gate",
    icon: "🅰️",
    category: "gates",
    rarity: "epic",
    requirement: { type: "gate_rank", value: 1, gateRank: "A-Rank" },
    points: 100,
  },
  {
    id: "s_rank_hunter",
    name: "S-Rank Hunter",
    description: "Clear an S-Rank gate - Only the strongest achieve this",
    icon: "💀",
    category: "gates",
    rarity: "legendary",
    requirement: { type: "gate_rank", value: 1, gateRank: "S-Rank" },
    points: 200,
  },
  {
    id: "gate_master",
    name: "Gate Master",
    description: "Clear all 6 gates",
    icon: "👁️",
    category: "gates",
    rarity: "mythic",
    requirement: { type: "gate_clear", value: 6 },
    points: 500,
  },

  // ========== QUEST ACHIEVEMENTS (5) ==========
  {
    id: "first_quest",
    name: "First Steps",
    description: "Complete your first quest",
    icon: "📋",
    category: "quests",
    rarity: "common",
    requirement: { type: "quest_count", value: 1 },
    points: 5,
  },
  {
    id: "quest_hunter",
    name: "Quest Hunter",
    description: "Complete 50 quests",
    icon: "📜",
    category: "quests",
    rarity: "uncommon",
    requirement: { type: "quest_count", value: 50 },
    points: 25,
  },
  {
    id: "quest_master",
    name: "Quest Master",
    description: "Complete 200 quests",
    icon: "📚",
    category: "quests",
    rarity: "rare",
    requirement: { type: "quest_count", value: 200 },
    points: 50,
  },
  {
    id: "quest_legend",
    name: "Quest Legend",
    description: "Complete 500 quests",
    icon: "🏅",
    category: "quests",
    rarity: "epic",
    requirement: { type: "quest_count", value: 500 },
    points: 100,
  },
  {
    id: "quest_immortal",
    name: "Quest Immortal",
    description: "Complete 1000 quests",
    icon: "👑",
    category: "quests",
    rarity: "legendary",
    requirement: { type: "quest_count", value: 1000 },
    points: 250,
  },

  // ========== HABIT ACHIEVEMENTS (5) ==========
  {
    id: "habit_starter",
    name: "Habit Starter",
    description: "Create your first habit",
    icon: "🌱",
    category: "habits",
    rarity: "common",
    requirement: { type: "habit_count", value: 1 },
    points: 5,
  },
  {
    id: "habit_builder",
    name: "Habit Builder",
    description: "Have 3 active habits",
    icon: "🎯",
    category: "habits",
    rarity: "uncommon",
    requirement: { type: "habit_count", value: 3 },
    points: 20,
  },
  {
    id: "habit_warrior",
    name: "Habit Warrior",
    description: "Win your first habit challenge",
    icon: "🏆",
    category: "habits",
    rarity: "rare",
    requirement: { type: "habit_win", value: 1 },
    points: 40,
  },
  {
    id: "habit_champion",
    name: "Habit Champion",
    description: "Win 5 habit challenges",
    icon: "🥇",
    category: "habits",
    rarity: "epic",
    requirement: { type: "habit_win", value: 5 },
    points: 100,
  },
  {
    id: "habit_legend",
    name: "Habit Legend",
    description: "Win 10 habit challenges",
    icon: "⭐",
    category: "habits",
    rarity: "legendary",
    requirement: { type: "habit_win", value: 10 },
    points: 200,
  },

  // ========== LEVEL ACHIEVEMENTS (8) ==========
  {
    id: "level_5",
    name: "First Steps",
    description: "Reach Level 5",
    icon: "5️⃣",
    category: "level",
    rarity: "common",
    requirement: { type: "level", value: 5 },
    points: 5,
  },
  {
    id: "level_10",
    name: "Double Digits",
    description: "Reach Level 10",
    icon: "🔟",
    category: "level",
    rarity: "common",
    requirement: { type: "level", value: 10 },
    points: 10,
  },
  {
    id: "level_25",
    name: "Rising Star",
    description: "Reach Level 25",
    icon: "⭐",
    category: "level",
    rarity: "uncommon",
    requirement: { type: "level", value: 25 },
    points: 25,
  },
  {
    id: "level_50",
    name: "Half Century",
    description: "Reach Level 50",
    icon: "🌟",
    category: "level",
    rarity: "rare",
    requirement: { type: "level", value: 50 },
    points: 50,
  },
  {
    id: "level_75",
    name: "Elite",
    description: "Reach Level 75",
    icon: "💫",
    category: "level",
    rarity: "rare",
    requirement: { type: "level", value: 75 },
    points: 75,
  },
  {
    id: "level_100",
    name: "Centurion",
    description: "Reach Level 100 - A true legend",
    icon: "💯",
    category: "level",
    rarity: "epic",
    requirement: { type: "level", value: 100 },
    points: 150,
  },
  {
    id: "level_150",
    name: "Transcendent",
    description: "Reach Level 150 - Surpassing all limits",
    icon: "🔱",
    category: "level",
    rarity: "legendary",
    requirement: { type: "level", value: 150 },
    points: 200,
  },
  {
    id: "level_200",
    name: "Sovereign",
    description: "Reach Level 200 - Beyond mortal limits",
    icon: "👑",
    category: "level",
    rarity: "legendary",
    requirement: { type: "level", value: 200 },
    points: 300,
  },

  // ========== SPECIAL ACHIEVEMENTS (7) ==========
  {
    id: "necromancer",
    name: "Arise",
    description: "Unlock the Necromancer class",
    icon: "💀",
    category: "special",
    rarity: "mythic",
    requirement: { type: "class_unlock", value: 1 },
    points: 300,
  },
  {
    id: "xp_tracker",
    name: "XP Tracker",
    description: "Earn 10,000 total XP - Your progress is being recorded",
    icon: "📊",
    category: "special",
    rarity: "uncommon",
    requirement: { type: "total_xp", value: 10000 },
    points: 20,
  },
  {
    id: "data_analyst",
    name: "Data Analyst",
    description: "Earn 50,000 total XP - Numbers tell your story",
    icon: "📈",
    category: "special",
    rarity: "rare",
    requirement: { type: "total_xp", value: 50000 },
    points: 50,
  },
  {
    id: "xp_millionaire",
    name: "XP Millionaire",
    description: "Earn 100,000 total XP",
    icon: "💰",
    category: "special",
    rarity: "epic",
    requirement: { type: "total_xp", value: 100000 },
    points: 100,
  },
  {
    id: "xp_billionaire",
    name: "XP Billionaire",
    description: "Earn 1,000,000 total XP",
    icon: "🏦",
    category: "special",
    rarity: "mythic",
    requirement: { type: "total_xp", value: 1000000 },
    points: 500,
  },
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "One of the first hunters to join the System",
    icon: "🎖️",
    category: "special",
    rarity: "legendary",
    requirement: { type: "level", value: 1 }, // Manually granted
    points: 50,
  },
];

// Storage functions
export const getAchievementProgress = (): AchievementProgress => {
  const stored = localStorage.getItem("soloLevelingAchievements");
  if (!stored) {
    return {
      unlockedAchievements: [],
      totalPoints: 0,
      lastChecked: new Date().toISOString(),
    };
  }
  return JSON.parse(stored);
};

export const setAchievementProgress = (progress: AchievementProgress) => {
  localStorage.setItem("soloLevelingAchievements", JSON.stringify(progress));
};

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

export const getUnlockedAchievements = (): Achievement[] => {
  const progress = getAchievementProgress();
  return ACHIEVEMENTS.filter(a => progress.unlockedAchievements.includes(a.id));
};

export const getLockedAchievements = (): Achievement[] => {
  const progress = getAchievementProgress();
  return ACHIEVEMENTS.filter(a => !progress.unlockedAchievements.includes(a.id));
};

export const isAchievementUnlocked = (id: string): boolean => {
  const progress = getAchievementProgress();
  return progress.unlockedAchievements.includes(id);
};
