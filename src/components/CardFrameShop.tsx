import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Lock, Check, Coins, Crown, Shield } from "lucide-react";
import { playSuccess, playError } from "@/lib/sounds";
import { CARD_FRAMES, SUPPORTER_EXCLUSIVE_FRAMES, getRarityColor } from "@/lib/cardFrames";
import { StatsCardFrame } from "./StatsCardFrame";
import { getSupporterBenefits } from "@/lib/supporters";

const TIER_LABELS: Record<string, { name: string; color: string }> = {
  b_rank: { name: "B-Rank+", color: "text-blue-400" },
  a_rank: { name: "A-Rank+", color: "text-purple-400" },
  s_rank: { name: "S-Rank", color: "text-amber-400" },
};

export const CardFrameShop = () => {
  const { stats, unlockCardFrame } = usePlayerStats();
  const supporterBenefits = getSupporterBenefits();
  
  // Merge credit-purchased frames with supporter tier-unlocked frames
  const creditUnlockedFrames = stats.unlockedCardFrames || ["default"];
  const supporterUnlockedFrames = supporterBenefits.unlockedFrames || [];
  const unlockedFrames = [...new Set([...creditUnlockedFrames, ...supporterUnlockedFrames])];

  const handleUnlockFrame = (frameId: string, cost: number) => {
    if (unlockCardFrame(frameId, cost)) {
      const frame = CARD_FRAMES.find((f) => f.id === frameId);
      playSuccess();
      toast({
        title: "🎨 Frame Unlocked!",
        description: `${frame?.name} card frame is now yours!`,
        duration: 4000,
      });
    } else {
      playError();
      toast({
        title: "⚠️ Insufficient Credits",
        description: `You need ${cost} credits. You have ${stats.credits}.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
            CARD FRAME COLLECTION
          </h2>
          <p className="text-muted-foreground mt-1">Unlock premium card designs for your stats</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Available Credits</p>
          <div className="flex items-center gap-2 justify-end">
            <Coins className="w-6 h-6 text-neon-cyan" />
            <p className="text-3xl font-bold text-neon-cyan">{stats.credits}</p>
          </div>
        </div>
      </div>

      {/* Regular Frame Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CARD_FRAMES.map((frame) => {
            const isUnlocked = unlockedFrames.includes(frame.id);
            const isSelected = stats.selectedCardFrame === frame.id;

            return (
              <Card
                key={frame.id}
                className={`relative transition-all duration-300 ${
                  isUnlocked
                    ? "bg-card border-primary/30 hover:border-primary/50"
                    : "bg-card/50 border-border"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1 flex items-center gap-2">
                        {frame.name}
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </CardTitle>
                      <Badge className={`${getRarityColor(frame.rarity)} border-current text-xs`} variant="outline">
                        {frame.rarity}
                      </Badge>
                    </div>
                    {isUnlocked ? (
                      <Sparkles className="w-5 h-5 text-primary" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  {/* Frame Preview */}
                  <div className="relative flex justify-center items-center h-[320px] overflow-hidden">
                    <div className="transform scale-[0.5]">
                      <StatsCardFrame stats={stats} frameId={frame.id} />
                    </div>
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                        <Lock className="w-10 h-10 text-muted-foreground/60" />
                      </div>
                    )}
                  </div>

                  {/* Cost & Unlock */}
                  <div className="pt-3 border-t border-border">
                    {isUnlocked ? (
                      <div className="text-center">
                        <p className="text-sm text-primary font-medium">✓ Owned</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use in Customize page
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Coins className="w-5 h-5 text-neon-cyan" />
                          <span className="text-2xl font-bold text-neon-cyan">{frame.creditCost}</span>
                          <span className="text-sm text-muted-foreground">Credits</span>
                        </div>
                        <Button
                          onClick={() => handleUnlockFrame(frame.id, frame.creditCost)}
                          disabled={stats.credits < frame.creditCost}
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                        >
                          Unlock Frame
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
        })}
      </div>

      {/* Supporter Exclusive Section */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-amber-400" />
          <div>
            <h3 className="text-2xl font-bold text-amber-400 font-cinzel" style={{ textShadow: "0 0 10px hsl(45 100% 50% / 0.5)" }}>
              SUPPORTER EXCLUSIVE
            </h3>
            <p className="text-muted-foreground text-sm">
              These frames are only available to Ko-Fi supporters via redemption codes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SUPPORTER_EXCLUSIVE_FRAMES.map((frame) => {
            const isUnlocked = unlockedFrames.includes(frame.id);
            const isSelected = stats.selectedCardFrame === frame.id;
            const tierInfo = TIER_LABELS[frame.supporterTierRequired || "b_rank"];

            return (
              <Card
                key={frame.id}
                className={`relative transition-all duration-300 border-2 ${
                  isUnlocked
                    ? "bg-gradient-to-b from-amber-950/30 to-card border-amber-500/50"
                    : "bg-card/30 border-amber-500/20"
                }`}
              >
                {/* Exclusive Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold px-3 py-1 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    {tierInfo.name} Supporter
                  </Badge>
                </div>

                <CardHeader className="pb-2 pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1 flex items-center gap-2">
                        {frame.name}
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </CardTitle>
                      <Badge className={`${getRarityColor(frame.rarity)} border-current text-xs`} variant="outline">
                        {frame.rarity}
                      </Badge>
                    </div>
                    {isUnlocked ? (
                      <Crown className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-amber-400/50" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  {/* Frame Preview */}
                  <div className="relative flex justify-center items-center h-[320px] overflow-hidden">
                    <div className="transform scale-[0.5]">
                      <StatsCardFrame stats={stats} frameId={frame.id} />
                    </div>
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-lg gap-2">
                        <Lock className="w-10 h-10 text-amber-400/60" />
                        <span className={`text-sm font-medium ${tierInfo.color}`}>
                          {tierInfo.name} Required
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="pt-3 border-t border-amber-500/20">
                    {isUnlocked ? (
                      <div className="text-center">
                        <p className="text-sm text-amber-400 font-medium">✓ Unlocked</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use in Customize page
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <p className="text-sm text-amber-400/80 font-medium">
                          Supporter Exclusive
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Become a {tierInfo.name} supporter on Ko-Fi to unlock
                        </p>
                        <a
                          href="https://ko-fi.com/lifexp"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
                        >
                          Support on Ko-Fi →
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};