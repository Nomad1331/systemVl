import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { storage, Gate } from "@/lib/storage";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { toast } from "@/hooks/use-toast";
import { Skull, Lock, Trophy, Flame, AlertTriangle } from "lucide-react";

const DEFAULT_GATES: Gate[] = [
  {
    id: "1",
    name: "Goblin Cave",
    rank: "E-Rank",
    description: "A beginner's trial. Face the Goblin Chieftain.",
    loreText: "Even E-Rank gates can be deadly for the unprepared. Goblins are weak individually, but lethal in groups.",
    dailyChallenge: "Complete all daily quests",
    requiredDays: 7,
    requiredHabits: 0,
    progress: {},
    losses: 0,
    startDate: null,
    endDate: null,
    status: "active",
    rewards: { xp: 500, gold: 100, title: "Goblin Slayer" },
    unlockRequirement: { level: 1 },
  },
  {
    id: "2",
    name: "Shadow Dungeon",
    rank: "D-Rank",
    description: "Darkness awaits. Defeat the Shadow Beast.",
    loreText: "The System has detected a D-Rank gate. Shadows move in ways they shouldn't. Something dangerous lurks within.",
    dailyChallenge: "Complete all quests + 1 habit daily",
    requiredDays: 7,
    requiredHabits: 1,
    progress: {},
    losses: 0,
    startDate: null,
    endDate: null,
    status: "locked",
    rewards: { xp: 800, gold: 200, title: "Shadow Walker" },
    unlockRequirement: { level: 6 },
  },
  {
    id: "3",
    name: "Temple of Chaos",
    rank: "C-Rank",
    description: "Ancient evil stirs. Challenge the Chaos Knight.",
    loreText: "⚠️ WARNING: C-Rank threat detected. 10-day endurance trial. Only the disciplined survive.",
    dailyChallenge: "Complete all quests + 2 habits daily for 10 days",
    requiredDays: 10,
    requiredHabits: 2,
    progress: {},
    losses: 0,
    startDate: null,
    endDate: null,
    status: "locked",
    rewards: { xp: 1500, gold: 400, title: "Chaos Breaker" },
    unlockRequirement: { level: 10 },
  },
  {
    id: "4",
    name: "Frozen Citadel",
    rank: "B-Rank",
    description: "Eternal winter reigns. Face the Ice Monarch.",
    loreText: "⚠️⚠️ SYSTEM ALERT: B-Rank gate emergence. 10-day trial of absolute discipline required.",
    dailyChallenge: "Complete all quests + 3 habits daily for 10 days",
    requiredDays: 10,
    requiredHabits: 3,
    progress: {},
    losses: 0,
    startDate: null,
    endDate: null,
    status: "locked",
    rewards: { xp: 3000, gold: 800, title: "Frostborn" },
    unlockRequirement: { level: 25 },
  },
  {
    id: "5",
    name: "Dragon's Lair",
    rank: "A-Rank",
    description: "The apex predator awakens. Challenge the Red Dragon.",
    loreText: "🔥 EMERGENCY ALERT: A-Rank Dragon Gate. 12-day trial of supreme dedication. Only legends prevail.",
    dailyChallenge: "Complete all quests + 4 habits daily for 12 days",
    requiredDays: 12,
    requiredHabits: 4,
    progress: {},
    losses: 0,
    startDate: null,
    endDate: null,
    status: "locked",
    rewards: { xp: 5000, gold: 1500, title: "Dragonslayer" },
    unlockRequirement: { level: 50 },
  },
  {
    id: "6",
    name: "Monarch's Domain",
    rank: "S-Rank",
    description: "The final trial. Confront the Shadow Monarch.",
    loreText: "⚫ NATIONAL EMERGENCY: S-Rank Gate. 14-day ultimate trial. Only those who have transcended humanity may enter.",
    dailyChallenge: "Complete all quests + 5 habits daily for 14 days",
    requiredDays: 14,
    requiredHabits: 5,
    progress: {},
    losses: 0,
    startDate: null,
    endDate: null,
    status: "locked",
    rewards: { xp: 10000, gold: 5000, title: "Shadow Monarch" },
    unlockRequirement: { level: 100 },
  },
];

const RANK_COLORS = {
  "E-Rank": "text-gray-400 border-gray-400/50",
  "D-Rank": "text-green-400 border-green-400/50",
  "C-Rank": "text-blue-400 border-blue-400/50",
  "B-Rank": "text-purple-400 border-purple-400/50",
  "A-Rank": "text-yellow-400 border-yellow-400/50",
  "S-Rank": "text-red-400 border-red-400/50",
};

const RANK_GLOW = {
  "E-Rank": "shadow-[0_0_20px_rgba(156,163,175,0.3)]",
  "D-Rank": "shadow-[0_0_20px_rgba(74,222,128,0.3)]",
  "C-Rank": "shadow-[0_0_20px_rgba(96,165,250,0.3)]",
  "B-Rank": "shadow-[0_0_20px_rgba(192,132,252,0.3)]",
  "A-Rank": "shadow-[0_0_20px_rgba(250,204,21,0.3)]",
  "S-Rank": "shadow-[0_0_20px_rgba(248,113,113,0.3)]",
};

const Gates = () => {
  const { stats, addXP, addGold, applyGatePenalty } = usePlayerStats();
  const [hasMounted, setHasMounted] = useState(false);
  const [gates, setGates] = useState<Gate[]>(() => {
    const stored = storage.getGates();
    if (stored.length === 0) {
      storage.setGates(DEFAULT_GATES);
      return DEFAULT_GATES;
    }
    return stored;
  });

  // Mark as mounted after first render to prevent overwriting imported data
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Only save to localStorage after component has mounted and gates change
  useEffect(() => {
    if (hasMounted) {
      storage.setGates(gates);
    }
  }, [gates, hasMounted]);

  // Check gate unlock status based on player level
  useEffect(() => {
    setGates((prev) =>
      prev.map((gate) => {
        if (gate.status === "locked" && gate.unlockRequirement.level) {
          if (stats.level >= gate.unlockRequirement.level) {
            return { ...gate, status: "active" as const };
          }
        }
        return gate;
      })
    );
  }, [stats.level]);

  // Auto-check daily challenge completion for active gates
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const quests = storage.getQuests();
    const habits = storage.getHabits();
    
    setGates((prev) =>
      prev.map((gate) => {
        // Only auto-check for gates that are started and haven't completed today
        if (gate.startDate && gate.status === "active" && !gate.progress[today]) {
          // Check if all quests are completed
          const allQuestsComplete = quests.length > 0 && quests.every(q => q.completed);
          
          // Check habits requirement based on gate's requiredHabits
          const activeHabits = habits.filter(h => h.status === "active");
          const completedHabitsToday = activeHabits.filter(h => h.completionGrid[today]).length;
          
          // Gate requires: all quests complete + at least requiredHabits habits completed
          const habitsRequirementMet = gate.requiredHabits === 0 || 
            (activeHabits.length >= gate.requiredHabits && completedHabitsToday >= gate.requiredHabits);
          
          const challengeMet = allQuestsComplete && habitsRequirementMet;
          
          if (challengeMet) {
            const newProgress = { ...gate.progress, [today]: true };
            const completedDays = Object.values(newProgress).filter(Boolean).length;
            
            // Auto-complete gate if all required days are done
            if (completedDays === gate.requiredDays) {
              setTimeout(() => {
                completeGate(gate.id);
              }, 100);
            }
            
            return { ...gate, progress: newProgress };
          }
        }
        return gate;
      })
    );
  }, [stats]); // Re-check whenever stats update (quest completion, etc.)

  const enterGate = (gateId: string) => {
    const gate = gates.find((g) => g.id === gateId);
    if (!gate) return;

    // Check level requirement to enter any gate
    if (stats.level < 3) {
      toast({
        title: "⚠️ ACCESS DENIED",
        description: "You must reach Level 3 to enter Gates. Complete more quests to level up!",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    // Check if another gate is already active
    const activeGate = gates.find((g) => g.status === "active" && g.startDate !== null);
    if (activeGate && activeGate.id !== gateId) {
      toast({
        title: "⚠️ GATE RESTRICTION",
        description: `You cannot enter multiple gates simultaneously. Complete or abandon "${activeGate.name}" first.`,
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    // Start the gate
    const today = new Date().toISOString().split("T")[0];
    setGates((prev) =>
      prev.map((g) =>
        g.id === gateId
          ? {
              ...g,
              startDate: today,
              endDate: null,
              progress: { [today]: false },
            }
          : g
      )
    );
    toast({
      title: "⚔️ GATE ENTERED",
      description: `Your ${gate.requiredDays}-day challenge has begun! Complete your daily challenge to progress.`,
    });
  };

  const markDayComplete = (gateId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const gate = gates.find((g) => g.id === gateId);
    if (!gate || gate.progress[today] === true) return;

    setGates((prev) =>
      prev.map((g) =>
        g.id === gateId
          ? {
              ...g,
              progress: { ...g.progress, [today]: true },
            }
          : g
      )
    );

    const completedDays = Object.values({ ...gate.progress, [today]: true }).filter(Boolean).length;

    if (completedDays === gate.requiredDays) {
      completeGate(gateId);
    } else {
      toast({
        title: "✅ Day Complete",
        description: `${completedDays}/${gate.requiredDays} days completed`,
      });
    }
  };

  const completeGate = (gateId: string) => {
    const gate = gates.find((g) => g.id === gateId);
    if (!gate) return;

    setGates((prev) =>
      prev.map((g) =>
        g.id === gateId
          ? {
              ...g,
              status: "completed" as const,
              endDate: new Date().toISOString().split("T")[0],
            }
          : g
      )
    );

    addXP(gate.rewards.xp, {
      type: "gate",
      description: `Cleared ${gate.name}`,
    });
    addGold(gate.rewards.gold);

    toast({
      title: `🏆 ${gate.rank} GATE CLEARED!`,
      description: `+${gate.rewards.xp} XP, +${gate.rewards.gold} Gold${gate.rewards.title ? `, Title: "${gate.rewards.title}"` : ""}`,
      duration: 5000,
    });
  };

  const failGate = (gateId: string) => {
    const gate = gates.find((g) => g.id === gateId);
    if (!gate) return;

    setGates((prev) =>
      prev.map((g) =>
        g.id === gateId
          ? {
              ...g,
              status: "failed" as const,
              losses: g.losses + 1,
              endDate: new Date().toISOString().split("T")[0],
              progress: {},
            }
          : g
      )
    );

    // Apply harsh penalties after updating gate state
    setTimeout(() => {
      applyGatePenalty();
      
      toast({
        title: "💀 GATE FAILED",
        description: `The ${gate.name} has defeated you. Harsh penalties applied: -10% XP, -10% Credits, -5 all stats, -1 level.`,
        variant: "destructive",
        duration: 7000,
      });
    }, 100);
  };

  const rechallenge = (gateId: string) => {
    setGates((prev) =>
      prev.map((g) =>
        g.id === gateId
          ? {
              ...g,
              status: "active" as const,
              startDate: null,
              endDate: null,
              progress: {},
            }
          : g
      )
    );
  };

  const getDaysCompleted = (gate: Gate) => {
    return Object.values(gate.progress).filter(Boolean).length;
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-4xl font-bold text-destructive mb-2 font-cinzel"
          style={{ textShadow: "0 0 10px hsl(var(--destructive) / 0.8)" }}
        >
          GATES
        </h1>
        <p className="text-muted-foreground">
          Multi-day commitment challenges. Clear gates to earn massive rewards. Daily challenges auto-complete when requirements are met.
        </p>
      </div>

      {/* System Warning */}
      <Card className="p-4 bg-destructive/10 border-destructive/30 mb-8">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <div>
            <p className="text-destructive font-bold">⚠️ SYSTEM NOTICE</p>
            <p className="text-sm text-muted-foreground">
              Gates are dangerous. Complete your daily challenge for the required consecutive days to clear. Only one gate can be active at a time. Failure results in harsh penalties: -10% XP, -10% Credits, -5 all stats, -1 level.
            </p>
          </div>
        </div>
      </Card>

      {/* Gates Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {gates.map((gate) => {
          const isLocked = gate.status === "locked";
          const isActive = gate.status === "active";
          const isCompleted = gate.status === "completed";
          const isFailed = gate.status === "failed";
          const hasStarted = gate.startDate !== null;
          const daysCompleted = getDaysCompleted(gate);
          const today = new Date().toISOString().split("T")[0];
          const isTodayComplete = gate.progress[today] === true;

          return (
            <Card
              key={gate.id}
              className={`p-6 transition-all duration-300 ${
                isLocked
                  ? "bg-muted/30 border-muted opacity-60"
                  : isCompleted
                  ? "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/50"
                  : isFailed
                  ? "bg-destructive/10 border-destructive/30"
                  : `bg-card border-border hover:border-primary/30 ${RANK_GLOW[gate.rank]}`
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isLocked ? (
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  ) : isCompleted ? (
                    <Trophy className="w-8 h-8 text-primary" />
                  ) : (
                    <Skull className={`w-8 h-8 ${RANK_COLORS[gate.rank].split(" ")[0]}`} />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold font-cinzel ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                      {gate.name}
                    </h3>
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded border ${RANK_COLORS[gate.rank]}`}
                    >
                      {gate.rank}
                    </span>
                  </div>
                </div>
                {gate.losses > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Losses</p>
                    <p className="text-lg font-bold text-destructive">{gate.losses}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-2">{gate.description}</p>
              <p className={`text-xs italic mb-4 ${isFailed ? "text-destructive" : "text-muted-foreground"}`}>
                {gate.loreText}
              </p>

              {/* Challenge */}
              <div className="p-3 bg-background/50 border border-border rounded-lg mb-4">
                <p className="text-xs text-muted-foreground mb-1">Daily Challenge (Auto-completes)</p>
                <p className="text-sm font-semibold text-foreground">{gate.dailyChallenge}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>📅 {gate.requiredDays} days</span>
                  <span>🎯 {gate.requiredHabits} habits required</span>
                </div>
              </div>

              {/* 7-Day Progress */}
              {hasStarted && !isCompleted && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2">
                      {isTodayComplete && (
                        <span className="text-xs text-primary">✓ Today Complete</span>
                      )}
                      <p className="text-sm font-bold text-primary">
                        {daysCompleted} / {gate.requiredDays} Days
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {Array.from({ length: gate.requiredDays }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-8 border-2 rounded flex items-center justify-center ${
                          i < daysCompleted
                            ? "bg-primary/20 border-primary text-primary"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {i < daysCompleted ? "✓" : i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewards */}
              <div className="p-3 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg mb-4">
                <p className="text-xs text-muted-foreground mb-2">Rewards</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-primary font-bold">+{gate.rewards.xp} XP</span>
                  <span className="text-yellow-400 font-bold">💰 {gate.rewards.gold}</span>
                  {gate.rewards.title && (
                    <span className="text-secondary font-bold">🏆 {gate.rewards.title}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isLocked && (
                  <Button disabled className="w-full" variant="outline">
                    <Lock className="w-4 h-4 mr-2" />
                    Requires Level {gate.unlockRequirement.level}
                  </Button>
                )}

                {isActive && !hasStarted && (
                  <Button
                    onClick={() => enterGate(gate.id)}
                    className="w-full bg-gradient-to-r from-destructive to-destructive/70 hover:from-destructive/80 hover:to-destructive/60"
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    Enter Gate
                  </Button>
                )}

                {hasStarted && !isCompleted && !isFailed && (
                  <Button onClick={() => failGate(gate.id)} variant="destructive" className="w-full">
                    Abandon Gate (Harsh Penalty)
                  </Button>
                )}

                {isCompleted && (
                  <Button disabled className="w-full bg-primary/20 text-primary" variant="outline">
                    <Trophy className="w-4 h-4 mr-2" />
                    Cleared
                  </Button>
                )}

                {isFailed && (
                  <Button
                    onClick={() => rechallenge(gate.id)}
                    className="w-full bg-gradient-to-r from-destructive to-destructive/70"
                  >
                    Rechallenge
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Gates;
