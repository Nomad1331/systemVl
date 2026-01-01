import { useState, useEffect, useCallback } from "react";
import { storage, PlayerStats, calculateTotalXPForLevel, calculateXPForNextLevel } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { emitRankUp } from "@/components/RankUpAnimation";

// Event emitter for level up animations
type LevelUpListener = (level: number, pointsEarned: number) => void;
const levelUpListeners: LevelUpListener[] = [];

export const onLevelUp = (listener: LevelUpListener) => {
  levelUpListeners.push(listener);
  return () => {
    const index = levelUpListeners.indexOf(listener);
    if (index > -1) levelUpListeners.splice(index, 1);
  };
};

const emitLevelUp = (level: number, pointsEarned: number) => {
  levelUpListeners.forEach(listener => listener(level, pointsEarned));
};

// Event emitter for stats changes (for cloud sync)
type StatsChangeListener = (stats: PlayerStats) => void;
const statsChangeListeners: StatsChangeListener[] = [];

export const onStatsChange = (listener: StatsChangeListener) => {
  statsChangeListeners.push(listener);
  return () => {
    const index = statsChangeListeners.indexOf(listener);
    if (index > -1) statsChangeListeners.splice(index, 1);
  };
};

const emitStatsChange = (stats: PlayerStats) => {
  statsChangeListeners.forEach(listener => listener(stats));
};

export const usePlayerStats = () => {
  const [stats, setStats] = useState<PlayerStats>(() => storage.getStats());
  const [hasMounted, setHasMounted] = useState(false);

  // Mark as mounted after first render to prevent overwriting imported data
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Only save to localStorage after the component has mounted and stats change
  useEffect(() => {
    if (hasMounted) {
      storage.setStats(stats);
      // Emit stats change for cloud sync
      emitStatsChange(stats);
    }
  }, [stats, hasMounted]);

  // Get active XP boost multiplier
  const getActiveBoostMultiplier = useCallback((): number => {
    const stored = localStorage.getItem("soloLevelingActiveBoost");
    if (!stored) return 1;
    
    try {
      const boost = JSON.parse(stored);
      if (!boost || !boost.expiresAt) return 1;
      
      // Check if expired
      if (new Date(boost.expiresAt) < new Date()) {
        localStorage.removeItem("soloLevelingActiveBoost");
        return 1;
      }
      
      return boost.multiplier || 1;
    } catch {
      return 1;
    }
  }, []);

  const addXP = (amount: number, source?: { type: "quest" | "habit" | "gate" | "streak" | "other"; description: string }) => {
    // Apply XP boost multiplier (only for positive XP gains)
    const boostMultiplier = amount > 0 ? getActiveBoostMultiplier() : 1;
    const boostedAmount = Math.round(amount * boostMultiplier);
    
    setStats((prev) => {
      const oldLevel = prev.level;
      const oldTotalXP = prev.totalXP;
      let newTotalXP = prev.totalXP + boostedAmount;
      let newLevel = prev.level;
      let newPoints = prev.availablePoints;
      let levelsGained = 0;

      // Prevent negative XP
      if (newTotalXP < 0) {
        newTotalXP = 0;
      }

      // Calculate new level based on total XP
      while (newTotalXP >= calculateTotalXPForLevel(newLevel + 1)) {
        newLevel += 1;
        newPoints += 5;
        levelsGained += 1;
      }

      // Show level up animation and toasts
      if (levelsGained > 0) {
        emitLevelUp(newLevel, levelsGained * 5);
        toast({
          title: "🎉 LEVEL UP!",
          description: `You are now Level ${newLevel}! +${levelsGained * 5} Ability Points`,
          duration: 5000,
        });
      }

      // Log XP history (show boosted amount)
      if (source) {
        const boostNote = boostMultiplier > 1 ? ` (${boostMultiplier}x boosted!)` : "";
        storage.addXPHistoryEntry({
          source: source.type,
          amount: boostedAmount,
          description: source.description + boostNote,
          levelsGained,
          oldLevel,
          newLevel,
          oldTotalXP,
          newTotalXP,
        });
      }

      const newRank = getRank(newLevel);
      const oldRank = prev.rank;
      
      // Emit rank-up animation if rank changed
      if (newRank !== oldRank && levelsGained > 0) {
        setTimeout(() => emitRankUp(oldRank, newRank), 500);
      }

      return {
        ...prev,
        xp: newTotalXP - calculateTotalXPForLevel(newLevel),
        totalXP: newTotalXP,
        level: newLevel,
        availablePoints: newPoints,
        rank: newRank,
      };
    });
  };

  const addGold = (amount: number) => {
    setStats((prev) => ({ ...prev, gold: Math.max(0, prev.gold + amount) }));
  };

  const addGems = (amount: number) => {
    setStats((prev) => ({ ...prev, gems: Math.max(0, (prev.gems || 0) + amount) }));
  };

  const spendGems = (amount: number): boolean => {
    if ((stats.gems || 0) >= amount) {
      setStats((prev) => ({ ...prev, gems: (prev.gems || 0) - amount }));
      return true;
    }
    return false;
  };

  const addCredits = (amount: number) => {
    setStats((prev) => ({ ...prev, credits: Math.max(0, prev.credits + amount) }));
  };

  const spendCredits = (amount: number): boolean => {
    if (stats.credits >= amount) {
      setStats((prev) => ({ ...prev, credits: prev.credits - amount }));
      return true;
    }
    return false;
  };

  // Updated unlockCardFrame to return the new stats for immediate cloud sync
  const unlockCardFrame = (frameId: string, cost: number): { success: boolean; newStats: PlayerStats | null } => {
    if (stats.credits >= cost && !stats.unlockedCardFrames?.includes(frameId)) {
      const newStats = {
        ...stats,
        credits: stats.credits - cost,
        unlockedCardFrames: [...(stats.unlockedCardFrames || ["default"]), frameId],
      };
      setStats(newStats);
      return { success: true, newStats };
    }
    return { success: false, newStats: null };
  };

  const unlockClass = (classId: string) => {
    if (!stats.unlockedClasses?.includes(classId)) {
      setStats((prev) => ({
        ...prev,
        unlockedClasses: [...(prev.unlockedClasses || []), classId],
      }));
      return true;
    }
    return false;
  };

  const allocateStat = (stat: keyof PlayerStats, amount: number = 1) => {
    setStats((prev) => {
      if (prev.availablePoints < amount) return prev;
      return {
        ...prev,
        [stat]: (prev[stat] as number) + amount,
        availablePoints: prev.availablePoints - amount,
      };
    });
  };

  const getRank = (level: number): string => {
    if (level >= 100) return "S-Rank";
    if (level >= 75) return "A-Rank";
    if (level >= 50) return "B-Rank";
    if (level >= 25) return "C-Rank";
    if (level >= 6) return "D-Rank";
    return "E-Rank";
  };

  const getTotalPower = (): number => {
    return stats.strength + stats.agility + stats.intelligence + stats.vitality + stats.sense;
  };

  const getXPForNextLevel = (): number => {
    return calculateXPForNextLevel(stats.level);
  };

  const getCurrentLevelXP = (): number => {
    return stats.totalXP - calculateTotalXPForLevel(stats.level);
  };

  const applyGatePenalty = () => {
    setStats((prev) => {
      // Calculate penalties
      const creditsLoss = Math.round(prev.credits * 0.1);
      const xpLoss = Math.round(prev.totalXP * 0.1);
      let newTotalXP = Math.max(0, prev.totalXP - xpLoss);
      
      // Calculate new level after XP loss
      let newLevel = prev.level;
      while (newLevel > 1 && newTotalXP < calculateTotalXPForLevel(newLevel)) {
        newLevel -= 1;
      }
      
      // Apply level demotion (additional -1 level)
      newLevel = Math.max(1, newLevel - 1);
      
      // Cap totalXP to prevent overflow after demotion
      const maxAllowedXP = calculateTotalXPForLevel(newLevel + 1) - 1;
      newTotalXP = Math.min(newTotalXP, maxAllowedXP);
      
      // Apply stat penalties (-5 each)
      const newStrength = Math.max(10, prev.strength - 5);
      const newAgility = Math.max(10, prev.agility - 5);
      const newIntelligence = Math.max(10, prev.intelligence - 5);
      const newVitality = Math.max(10, prev.vitality - 5);
      const newSense = Math.max(10, prev.sense - 5);
      
      return {
        ...prev,
        credits: Math.max(0, prev.credits - creditsLoss),
        totalXP: newTotalXP,
        xp: newTotalXP - calculateTotalXPForLevel(newLevel),
        level: newLevel,
        strength: newStrength,
        agility: newAgility,
        intelligence: newIntelligence,
        vitality: newVitality,
        sense: newSense,
        rank: getRank(newLevel),
      };
    });
  };

  // Necromancer Normal Mode penalty: 5% loss of major stats
  const applyNecromancerNormalPenalty = () => {
    setStats((prev) => {
      const xpLoss = Math.round(prev.totalXP * 0.05);
      const goldLoss = Math.round(prev.gold * 0.05);
      const creditsLoss = Math.round(prev.credits * 0.05);
      const gemsLoss = Math.round((prev.gems || 0) * 0.05);
      
      let newTotalXP = Math.max(0, prev.totalXP - xpLoss);
      let newLevel = prev.level;
      while (newLevel > 1 && newTotalXP < calculateTotalXPForLevel(newLevel)) {
        newLevel -= 1;
      }
      
      return {
        ...prev,
        totalXP: newTotalXP,
        xp: newTotalXP - calculateTotalXPForLevel(newLevel),
        level: newLevel,
        gold: Math.max(0, prev.gold - goldLoss),
        credits: Math.max(0, prev.credits - creditsLoss),
        gems: Math.max(0, (prev.gems || 0) - gemsLoss),
        strength: Math.max(10, Math.round(prev.strength * 0.95)),
        agility: Math.max(10, Math.round(prev.agility * 0.95)),
        intelligence: Math.max(10, Math.round(prev.intelligence * 0.95)),
        vitality: Math.max(10, Math.round(prev.vitality * 0.95)),
        sense: Math.max(10, Math.round(prev.sense * 0.95)),
        rank: getRank(newLevel),
      };
    });
  };

  // Necromancer Hard Mode penalty: Complete reset (stats/currencies only, keep user data structures)
  const applyNecromancerHardPenalty = () => {
    setStats((prev) => ({
      ...prev,
      level: 1,
      xp: 0,
      totalXP: 0,
      gold: 0,
      credits: 0,
      gems: 0,
      strength: 10,
      agility: 10,
      intelligence: 10,
      vitality: 10,
      sense: 10,
      availablePoints: 0,
      rank: "E-Rank",
      title: "Awakened Hunter",
      unlockedClasses: [],
      // Keep: name, avatar, selectedCardFrame, unlockedCardFrames, isFirstTime
    }));
    
    // Reset quests completion status but keep the quests themselves
    const currentQuests = storage.getQuests();
    storage.setQuests(currentQuests.map(q => ({ ...q, completed: false })));
    
    // Reset streak
    storage.setStreak({
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null,
      totalRewards: 0
    });
  };

  // Apply Hard Mode rewards
  const applyHardModeRewards = () => {
    setStats((prev) => {
      const newLevel = prev.level + 10;
      return {
        ...prev,
        level: newLevel,
        totalXP: calculateTotalXPForLevel(newLevel),
        xp: 0,
        strength: prev.strength + 20,
        agility: prev.agility + 20,
        intelligence: prev.intelligence + 20,
        vitality: prev.vitality + 20,
        sense: prev.sense + 20,
        credits: prev.credits + 100,
        gold: prev.gold + 5,
        gems: (prev.gems || 0) + 5,
        rank: getRank(newLevel),
      };
    });
  };

  // Get current stats for external use (e.g., cloud sync)
  const getCurrentStats = useCallback(() => stats, [stats]);

  return {
    stats,
    addXP,
    addGold,
    addGems,
    spendGems,
    addCredits,
    spendCredits,
    unlockCardFrame,
    unlockClass,
    allocateStat,
    getTotalPower,
    getXPForNextLevel,
    getCurrentLevelXP,
    applyGatePenalty,
    applyNecromancerNormalPenalty,
    applyNecromancerHardPenalty,
    applyHardModeRewards,
    getActiveBoostMultiplier,
    getCurrentStats,
  };
};
