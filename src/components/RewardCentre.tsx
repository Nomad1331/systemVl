import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Gift, Coins } from "lucide-react";
import { playSuccess, playError } from "@/lib/sounds";

interface Reward {
  id: string;
  name: string;
  creditCost: number;
  claimed: boolean;
}

const DEFAULT_REWARDS: Reward[] = [
  { id: "1", name: "1 Hour Free Time", creditCost: 50, claimed: false },
  { id: "2", name: "Game for 30 mins", creditCost: 30, claimed: false },
  { id: "3", name: "Watch Movie/Show", creditCost: 80, claimed: false },
  { id: "4", name: "Favorite Snack", creditCost: 20, claimed: false },
];

export const RewardCentre = () => {
  const { stats, spendCredits } = usePlayerStats();
  const [rewards, setRewards] = useState<Reward[]>(() => {
    const stored = localStorage.getItem("soloLevelingRewards");
    return stored ? JSON.parse(stored) : DEFAULT_REWARDS;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReward, setNewReward] = useState({ name: "", creditCost: 50 });

  const saveRewards = (updatedRewards: Reward[]) => {
    setRewards(updatedRewards);
    localStorage.setItem("soloLevelingRewards", JSON.stringify(updatedRewards));
  };

  const addReward = () => {
    if (!newReward.name.trim()) {
      toast({
        title: "⚠️ Error",
        description: "Reward name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (newReward.creditCost < 20) {
      toast({
        title: "⚠️ Error",
        description: "Reward cost must be at least 20 credits",
        variant: "destructive",
      });
      return;
    }

    const reward: Reward = {
      id: Date.now().toString(),
      name: newReward.name,
      creditCost: newReward.creditCost,
      claimed: false,
    };

    saveRewards([...rewards, reward]);
    setNewReward({ name: "", creditCost: 50 });
    setIsDialogOpen(false);
    
    toast({
      title: "🎁 Reward Added",
      description: `${reward.name} is now available`,
    });
  };

  const claimReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;

    if (spendCredits(reward.creditCost)) {
      saveRewards(
        rewards.map((r) =>
          r.id === rewardId ? { ...r, claimed: true } : r
        )
      );

      playSuccess();
      toast({
        title: "🎉 Reward Claimed!",
        description: `Enjoy your ${reward.name}! -${reward.creditCost} Credits`,
        duration: 4000,
      });
    } else {
      playError();
      toast({
        title: "⚠️ Insufficient Credits",
        description: `You need ${reward.creditCost} credits. You have ${stats.credits}.`,
        variant: "destructive",
      });
    }
  };

  const resetReward = (rewardId: string) => {
    saveRewards(
      rewards.map((r) =>
        r.id === rewardId ? { ...r, claimed: false } : r
      )
    );
  };

  const deleteReward = (rewardId: string) => {
    saveRewards(rewards.filter((r) => r.id !== rewardId));
    toast({
      title: "🗑️ Reward Removed",
      description: "Reward deleted",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Credits */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
            REWARD CENTRE
          </h2>
          <p className="text-muted-foreground mt-1">Spend Credits to claim rewards</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Available Credits</p>
          <div className="flex items-center gap-2 justify-end">
            <Coins className="w-6 h-6 text-neon-cyan" />
            <p className="text-3xl font-bold text-neon-cyan">{stats.credits}</p>
          </div>
        </div>
      </div>

      {/* Add Reward Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Reward
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary font-cinzel">Define New Reward</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="rewardName">Reward Name</Label>
              <Input
                id="rewardName"
                value={newReward.name}
                onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                placeholder="e.g., 2 Hours Gaming, Pizza Night"
                className="bg-background border-primary/20"
              />
            </div>
            <div>
              <Label htmlFor="creditCost">Credit Cost</Label>
              <Input
                id="creditCost"
                type="number"
                value={newReward.creditCost}
                onChange={(e) => setNewReward({ ...newReward, creditCost: parseInt(e.target.value) || 20 })}
                min="20"
                className="bg-background border-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum: 20 credits</p>
            </div>
            <Button onClick={addReward} className="w-full bg-gradient-to-r from-primary to-secondary">
              Create Reward
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rewards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <Card
            key={reward.id}
            className={`p-6 transition-all duration-300 ${
              reward.claimed
                ? "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/50"
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <Gift className={`w-8 h-8 ${reward.claimed ? "text-primary" : "text-muted-foreground"}`} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteReward(reward.id)}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <h3 className={`text-lg font-bold mb-2 ${reward.claimed ? "text-primary line-through" : "text-foreground"}`}>
              {reward.name}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-4 h-4 text-neon-cyan" />
              <span className="text-xl font-bold text-neon-cyan">{reward.creditCost}</span>
              <span className="text-sm text-muted-foreground">Credits</span>
            </div>

            {reward.claimed ? (
              <Button
                onClick={() => resetReward(reward.id)}
                variant="outline"
                className="w-full border-primary/50 text-primary hover:bg-primary/10"
              >
                Reset
              </Button>
            ) : (
              <Button
                onClick={() => claimReward(reward.id)}
                disabled={stats.credits < reward.creditCost}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
              >
                Claim Reward
              </Button>
            )}
          </Card>
        ))}
      </div>

      {rewards.length === 0 && (
        <Card className="p-8 text-center bg-muted/30">
          <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No rewards yet. Add your first custom reward!</p>
        </Card>
      )}
    </div>
  );
};
