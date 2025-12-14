// LocalStorage utilities for persisting game data

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  totalRewards: number;
}

export interface UserSettings {
  timezone: string; // IANA timezone string (e.g., "America/New_York")
}

export interface PlayerStats {
  name: string;
  level: number;
  xp: number; // For backwards compatibility - will be removed later
  totalXP: number; // Cumulative XP
  rank: string;
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  sense: number;
  availablePoints: number;
  gold: number;
  gems: number;
  credits: number; // Currency for Reward Centre
  avatar?: string; // Avatar image identifier
  title?: string; // Player title
  isFirstTime?: boolean; // Track if user has completed first-time setup
  selectedCardFrame?: string; // Selected card frame ID
  unlockedCardFrames?: string[]; // Array of unlocked card frame IDs
  unlockedClasses?: string[]; // Array of unlocked special class IDs (e.g., necromancer)
}

export interface XPHistoryEntry {
  id: string;
  timestamp: string;
  source: "quest" | "habit" | "gate" | "streak" | "other";
  amount: number;
  description: string;
  levelsGained: number;
  oldLevel: number;
  newLevel: number;
  oldTotalXP: number;
  newTotalXP: number;
}

export interface DailyQuest {
  id: string;
  name: string;
  xpReward: number;
  statBoost: { stat: string; amount: number };
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completionGrid: Record<string, boolean>; // date string -> completed
  goalDays: number;
  winXP: number;
  loseXP: number;
  startDate: string;
  endDate: string | null;
  status: "active" | "won" | "lost";
}

export interface Gate {
  id: string;
  name: string;
  rank: "E-Rank" | "D-Rank" | "C-Rank" | "B-Rank" | "A-Rank" | "S-Rank";
  description: string;
  loreText: string;
  dailyChallenge: string;
  requiredDays: number;
  requiredHabits: number; // Minimum active habits required to complete daily challenge
  progress: Record<string, boolean>; // date string -> completed (days based on requiredDays)
  losses: number;
  startDate: string | null;
  endDate: string | null;
  status: "locked" | "active" | "completed" | "failed";
  rewards: {
    xp: number;
    gold: number;
    title?: string;
  };
  unlockRequirement: {
    level?: number;
    totalXP?: number;
  };
}

const DEFAULT_STATS: PlayerStats = {
  name: "Hunter",
  level: 1,
  xp: 0,
  totalXP: 0,
  rank: "E-Rank",
  strength: 10,
  agility: 10,
  intelligence: 10,
  vitality: 10,
  sense: 10,
  availablePoints: 0,
  gold: 0,
  gems: 0,
  credits: 0,
  avatar: "default",
  title: "Awakened Hunter",
  isFirstTime: true,
  selectedCardFrame: "default",
  unlockedCardFrames: ["default"],
};

const DEFAULT_QUESTS: DailyQuest[] = [
  { id: "1", name: "Study Programming", xpReward: 50, statBoost: { stat: "intelligence", amount: 1 }, completed: false },
  { id: "2", name: "Workout", xpReward: 50, statBoost: { stat: "strength", amount: 1 }, completed: false },
  { id: "3", name: "Read 1 Page", xpReward: 30, statBoost: { stat: "intelligence", amount: 1 }, completed: false },
  { id: "4", name: "Meditation", xpReward: 40, statBoost: { stat: "sense", amount: 1 }, completed: false },
  { id: "5", name: "Learn JavaScript", xpReward: 60, statBoost: { stat: "intelligence", amount: 2 }, completed: false },
];

export const storage = {
  getStats: (): PlayerStats => {
    const stored = localStorage.getItem("soloLevelingStats");
    if (!stored) return DEFAULT_STATS;
    
    const stats = JSON.parse(stored);
    // Migrate old data to include totalXP if missing
    if (stats.totalXP === undefined) {
      stats.totalXP = calculateTotalXPForLevel(stats.level) + stats.xp;
    }
    // Migrate to include credits if missing
    if (stats.credits === undefined) {
      stats.credits = 0;
    }
    // Migrate to include avatar/title if missing
    if (stats.avatar === undefined) {
      stats.avatar = "default";
    }
    if (stats.title === undefined) {
      stats.title = "Awakened Hunter";
    }
    if (stats.isFirstTime === undefined) {
      stats.isFirstTime = false; // Existing users don't need setup
    }
    if (stats.selectedCardFrame === undefined) {
      stats.selectedCardFrame = "default";
    }
    if (stats.unlockedCardFrames === undefined) {
      stats.unlockedCardFrames = ["default"];
    }
    if (stats.unlockedClasses === undefined) {
      stats.unlockedClasses = [];
    }
    return stats;
  },

  setStats: (stats: PlayerStats) => {
    localStorage.setItem("soloLevelingStats", JSON.stringify(stats));
  },

  getSettings: (): UserSettings => {
    const stored = localStorage.getItem("soloLevelingSettings");
    if (!stored) {
      // Default to user's system timezone
      return { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    }
    return JSON.parse(stored);
  },

  setSettings: (settings: UserSettings) => {
    localStorage.setItem("soloLevelingSettings", JSON.stringify(settings));
  },

  getQuests: (): DailyQuest[] => {
    const stored = localStorage.getItem("soloLevelingQuests");
    return stored ? JSON.parse(stored) : DEFAULT_QUESTS;
  },

  setQuests: (quests: DailyQuest[]) => {
    localStorage.setItem("soloLevelingQuests", JSON.stringify(quests));
  },

  getLastReset: (): string | null => {
    return localStorage.getItem("soloLevelingLastReset");
  },

  setLastReset: (date: string) => {
    localStorage.setItem("soloLevelingLastReset", date);
  },

  getStreak: (): StreakData => {
    const stored = localStorage.getItem("soloLevelingStreak");
    return stored ? JSON.parse(stored) : {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null,
      totalRewards: 0
    };
  },

  setStreak: (streak: StreakData) => {
    localStorage.setItem("soloLevelingStreak", JSON.stringify(streak));
  },

  getHabits: (): Habit[] => {
    const stored = localStorage.getItem("soloLevelingHabits");
    return stored ? JSON.parse(stored) : [];
  },

  setHabits: (habits: Habit[]) => {
    localStorage.setItem("soloLevelingHabits", JSON.stringify(habits));
  },

  getXPHistory: (): XPHistoryEntry[] => {
    const stored = localStorage.getItem("soloLevelingXPHistory");
    return stored ? JSON.parse(stored) : [];
  },

  setXPHistory: (history: XPHistoryEntry[]) => {
    localStorage.setItem("soloLevelingXPHistory", JSON.stringify(history));
  },

  addXPHistoryEntry: (entry: Omit<XPHistoryEntry, "id" | "timestamp">) => {
    const history = storage.getXPHistory();
    const newEntry: XPHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    // Keep only last 100 entries
    const updatedHistory = [newEntry, ...history].slice(0, 100);
    storage.setXPHistory(updatedHistory);
    return newEntry;
  },

  getGates: (): Gate[] => {
    const stored = localStorage.getItem("soloLevelingGates");
    return stored ? JSON.parse(stored) : [];
  },

  setGates: (gates: Gate[]) => {
    localStorage.setItem("soloLevelingGates", JSON.stringify(gates));
  },
  // Export all data
  exportAllData: (): string => {
    const exportData = {
      version: "1.18.0",
      exportDate: new Date().toISOString(),
      stats: storage.getStats(),
      settings: storage.getSettings(),
      quests: storage.getQuests(),
      habits: storage.getHabits(),
      gates: storage.getGates(),
      streak: storage.getStreak(),
      xpHistory: storage.getXPHistory(),
      rewards: JSON.parse(localStorage.getItem("soloLevelingRewards") || "[]"),
      challenges: JSON.parse(localStorage.getItem("soloLevelingChallenges") || "[]"),
      necroChallenge: JSON.parse(localStorage.getItem("soloLevelingNecroChallenge") || "null"),
      claimedChallenges: JSON.parse(localStorage.getItem("soloLevelingClaimedChallenges") || "{}"),
      activeBoost: JSON.parse(localStorage.getItem("soloLevelingActiveBoost") || "null"),
      lastReset: storage.getLastReset(),
    };
    return JSON.stringify(exportData, null, 2);
  },

  // Import all data
  importAllData: (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate that this is a valid export file
      if (!data.version || !data.stats) {
        return { success: false, error: "Invalid data format - missing required fields" };
      }

      // Import all data
      if (data.stats) storage.setStats(data.stats);
      if (data.settings) storage.setSettings(data.settings);
      if (data.quests) storage.setQuests(data.quests);
      if (data.habits) storage.setHabits(data.habits);
      if (data.gates) storage.setGates(data.gates);
      if (data.streak) storage.setStreak(data.streak);
      if (data.xpHistory) storage.setXPHistory(data.xpHistory);
      if (data.rewards) localStorage.setItem("soloLevelingRewards", JSON.stringify(data.rewards));
      if (data.challenges) localStorage.setItem("soloLevelingChallenges", JSON.stringify(data.challenges));
      if (data.necroChallenge !== undefined) localStorage.setItem("soloLevelingNecroChallenge", JSON.stringify(data.necroChallenge));
      if (data.claimedChallenges) localStorage.setItem("soloLevelingClaimedChallenges", JSON.stringify(data.claimedChallenges));
      if (data.activeBoost !== undefined) localStorage.setItem("soloLevelingActiveBoost", JSON.stringify(data.activeBoost));
      if (data.lastReset) storage.setLastReset(data.lastReset);

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to parse JSON data" };
    }
  },
};

// Helper function to calculate total XP needed to reach a level
export const calculateTotalXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // XP needed = sum of (1 to level-1) * 100 = 100 * (level-1) * level / 2
  return 100 * (level - 1) * level / 2;
};

// Helper function to calculate XP needed for next level
export const calculateXPForNextLevel = (currentLevel: number): number => {
  return currentLevel * 100;
};
