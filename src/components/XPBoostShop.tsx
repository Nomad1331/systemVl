import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { Zap, Coins, Gem } from "lucide-react";
import { playSuccess, playError } from "@/lib/sounds";

interface BoostItem {
  id: string;
  name: string;
  multiplier: number;
  duration: number; // in minutes
  cost: {
    gold?: number;
    gems?: number;
  };
  description: string;
}

const BOOST_ITEMS: BoostItem[] = [
  {
    id: "boost_1.5x_30m",
    name: "Minor XP Boost",
    multiplier: 1.5,
    duration: 30,
    cost: { gold: 200 },
    description: "1.5x XP multiplier for 30 minutes",
  },
  {
    id: "boost_2x_30m",
    name: "Major XP Boost",
    multiplier: 2,
    duration: 30,
    cost: { gold: 400 },
    description: "2x XP multiplier for 30 minutes",
  },
  {
    id: "boost_1.5x_60m",
    name: "Extended Minor Boost",
    multiplier: 1.5,
    duration: 60,
    cost: { gold: 350, gems: 5 },
    description: "1.5x XP multiplier for 1 hour",
  },
  {
    id: "boost_2x_60m",
    name: "Extended Major Boost",
    multiplier: 2,
    duration: 60,
    cost: { gold: 700, gems: 10 },
    description: "2x XP multiplier for 1 hour",
  },
  {
    id: "boost_3x_30m",
    name: "Legendary Boost",
    multiplier: 3,
    duration: 30,
    cost: { gems: 25 },
    description: "3x XP multiplier for 30 minutes",
  },
];

interface ActiveBoost {
  itemId: string;
  multiplier: number;
  expiresAt: string;
}

export const XPBoostShop = () => {
  const { stats, addGold, spendGems } = usePlayerStats();
  const [activeBoost, setActiveBoost] = useState<ActiveBoost | null>(() => {
    const stored = localStorage.getItem("soloLevelingActiveBoost");
    if (!stored) return null;
    
    try {
      const boost = JSON.parse(stored) as ActiveBoost | null;
      // Check if boost is null or invalid
      if (!boost || !boost.expiresAt) {
        localStorage.removeItem("soloLevelingActiveBoost");
        return null;
      }
      // Check if expired
      if (new Date(boost.expiresAt) < new Date()) {
        localStorage.removeItem("soloLevelingActiveBoost");
        return null;
      }
      return boost;
    } catch {
      localStorage.removeItem("soloLevelingActiveBoost");
      return null;
    }
  });

  // Check for boost expiry and show notification
  useEffect(() => {
    if (!activeBoost) return;

    const checkExpiry = () => {
      const now = new Date();
      const expires = new Date(activeBoost.expiresAt);
      
      if (expires <= now) {
        setActiveBoost(null);
        localStorage.removeItem("soloLevelingActiveBoost");
        toast({
          title: "⚡ XP Boost Expired",
          description: "Your XP multiplier has worn off. Purchase another boost to continue earning bonus XP!",
          duration: 5000,
        });
      }
    };

    // Check every second
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [activeBoost]);

  const purchaseBoost = (item: BoostItem) => {
    // Check if already has active boost
    if (activeBoost) {
      playError();
      toast({
        title: "⚠️ Boost Already Active",
        description: "You already have an active XP boost. Wait for it to expire.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has enough resources
    const hasGold = !item.cost.gold || stats.gold >= item.cost.gold;
    const hasGems = !item.cost.gems || (stats.gems || 0) >= item.cost.gems;

    if (!hasGold || !hasGems) {
      playError();
      toast({
        title: "⚠️ Insufficient Resources",
        description: `You need ${item.cost.gold || 0} Gold${item.cost.gems ? ` and ${item.cost.gems} Gems` : ""}`,
        variant: "destructive",
      });
      return;
    }

    // Deduct costs
    if (item.cost.gold) {
      addGold(-item.cost.gold);
    }
    if (item.cost.gems) {
      spendGems(item.cost.gems);
    }

    // Activate boost
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + item.duration);

    const boost: ActiveBoost = {
      itemId: item.id,
      multiplier: item.multiplier,
      expiresAt: expiresAt.toISOString(),
    };

    setActiveBoost(boost);
    localStorage.setItem("soloLevelingActiveBoost", JSON.stringify(boost));

    playSuccess();
    toast({
      title: "⚡ BOOST ACTIVATED!",
      description: `${item.multiplier}x XP for ${item.duration} minutes!`,
      duration: 5000,
    });
  };

  const getRemainingTime = (): string => {
    if (!activeBoost) return "";
    
    const now = new Date();
    const expires = new Date(activeBoost.expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      // Expired
      setActiveBoost(null);
      localStorage.removeItem("soloLevelingActiveBoost");
      return "";
    }

    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary font-cinzel mb-2" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
          XP BOOST SHOP
        </h2>
        <p className="text-muted-foreground">Purchase temporary XP multipliers with Gold and Gems</p>
      </div>

      {/* Active Boost Display */}
      {activeBoost && (
        <Card className="p-6 bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/50 shadow-[0_0_30px_hsl(var(--neon-cyan)/0.4)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Zap className="w-10 h-10 text-primary animate-pulse" />
              <div>
                <p className="text-xl font-bold text-primary font-cinzel">
                  {activeBoost.multiplier}x XP BOOST ACTIVE
                </p>
                <p className="text-sm text-muted-foreground">Time Remaining: {getRemainingTime()}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Resources Display */}
      <Card className="p-4 bg-background/50 border-border">
        <div className="flex items-center justify-around">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">Gold</p>
              <p className="text-xl font-bold text-yellow-400">{stats.gold}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Gem className="w-6 h-6 text-neon-purple" />
            <div>
              <p className="text-xs text-muted-foreground">Gems</p>
              <p className="text-xl font-bold text-neon-purple">{stats.gems}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Boost Items */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BOOST_ITEMS.map((item) => {
          const canAfford = 
            (!item.cost.gold || stats.gold >= item.cost.gold) &&
            (!item.cost.gems || stats.gems >= item.cost.gems);

          return (
            <Card
              key={item.id}
              className="p-6 bg-card border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <Zap className={`w-8 h-8 ${item.multiplier >= 3 ? "text-neon-orange" : item.multiplier >= 2 ? "text-secondary" : "text-primary"}`} />
                <div>
                  <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>

              {/* Cost */}
              <div className="flex items-center gap-3 mb-4">
                {item.cost.gold && (
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-lg font-bold text-yellow-400">{item.cost.gold}</span>
                  </div>
                )}
                {item.cost.gems && (
                  <div className="flex items-center gap-1">
                    <Gem className="w-4 h-4 text-neon-purple" />
                    <span className="text-lg font-bold text-neon-purple">{item.cost.gems}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => purchaseBoost(item)}
                disabled={!canAfford || !!activeBoost}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
              >
                {activeBoost ? "Boost Active" : canAfford ? "Purchase" : "Not Enough Resources"}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-muted/30 border-border/50">
        <p className="text-sm text-muted-foreground text-center">
          💡 <strong>How to earn Gold:</strong> Complete Gates (boss challenges)<br />
          💡 <strong>How to earn Gems:</strong> Complete Weekly Challenges
        </p>
      </Card>
    </div>
  );
};
