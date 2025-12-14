import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Achievement, RARITY_CONFIG, getAchievementProgress } from "@/lib/achievements";
import { AchievementBadge } from "./AchievementBadge";
import { AchievementDetailModal } from "./AchievementDetailModal";
import { cn } from "@/lib/utils";
import { RotateCcw, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlayerStats } from "@/lib/storage";
import { getSupporterBenefits, TIER_CONFIG } from "@/lib/supporters";

interface AchievementsShowcaseCardProps {
  stats: PlayerStats;
  unlockedAchievements: Achievement[];
}

const CLASS_EMOJIS: Record<string, string> = {
  fighter: "⚔️",
  tanker: "🛡️",
  mage: "🔮",
  assassin: "🗡️",
  ranger: "🏹",
  healer: "💚",
  necromancer: "💀",
  default: "👤",
};

export const AchievementsShowcaseCard = ({ stats, unlockedAchievements }: AchievementsShowcaseCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const navigate = useNavigate();
  const progress = getAchievementProgress();

  // Check if avatar is a custom image (base64 data URL) or a class ID
  const isCustomImage = stats.avatar?.startsWith("data:");
  const classEmoji = CLASS_EMOJIS[stats.avatar || "default"] || CLASS_EMOJIS.default;
  
  // Get supporter benefits
  const supporterBenefits = getSupporterBenefits();
  const tierConfig = supporterBenefits.tier ? TIER_CONFIG[supporterBenefits.tier] : null;

  // Sort by rarity (mythic first) and get top achievements
  const rarityOrder = ["mythic", "legendary", "epic", "rare", "uncommon", "common"];
  const sortedAchievements = [...unlockedAchievements].sort((a, b) => {
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
  });

  const topAchievements = sortedAchievements.slice(0, 6);

  // Count by rarity
  const rarityCounts = unlockedAchievements.reduce((acc, a) => {
    acc[a.rarity] = (acc[a.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <div 
        className={cn(
          "perspective-1000 transition-all duration-500 ease-in-out",
          isFlipped ? "h-[280px] md:h-[300px]" : "h-[200px] md:h-[220px]"
        )}
      >
        <div 
          className={cn(
            "relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer",
            isFlipped && "rotate-y-180"
          )}
          style={{ 
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          onClick={(e) => {
            // Don't flip if clicking on a badge (data-badge-click attribute)
            const target = e.target as HTMLElement;
            if (target.closest('[data-badge-click]')) {
              return;
            }
            setIsFlipped(!isFlipped);
          }}
        >
          {/* Front - Player Profile */}
          <Card 
            className={cn(
              "px-6 py-4 md:py-5 h-full bg-gradient-to-br from-background via-background to-primary/5 border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.15)] relative overflow-hidden backface-hidden",
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/30" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-secondary/30" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-secondary/30" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/30" />

            {/* Flip hint */}
            <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-primary/90" style={{ textShadow: "0 0 8px hsl(var(--primary) / 0.6), 0 0 16px hsl(var(--primary) / 0.4)" }}>
              <RotateCcw className="w-3 h-3" />
              <span>Flip for achievements</span>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-30 animate-pulse" />
                <Avatar className="h-20 w-20 border-4 border-primary/50 relative shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                  {isCustomImage && <AvatarImage src={stats.avatar} alt={stats.name} className="object-cover" />}
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-background to-primary/20">
                    {classEmoji}
                  </AvatarFallback>
                </Avatar>
                
                {/* Rank badge on avatar */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-primary to-secondary px-2 py-0.5 rounded-full border-2 border-background shadow-lg">
                  <span className="text-xs font-bold text-background">{stats.rank}</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2 min-w-0">
                {/* Name and Title */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-foreground font-cinzel tracking-wide truncate">
                      {stats.name}
                    </h3>
                    {/* Supporter Badge */}
                    {supporterBenefits.badge && tierConfig && (
                      <Badge className={`${tierConfig.bgColor} ${tierConfig.color} border ${tierConfig.borderColor} text-xs shrink-0`}>
                        {tierConfig.icon} {tierConfig.name}
                      </Badge>
                    )}
                  </div>
                  {/* Custom supporter title takes precedence */}
                  {(supporterBenefits.title || stats.title) && (
                    <p className="text-xs text-secondary italic mt-0.5" style={{ textShadow: "0 0 10px hsl(var(--secondary) / 0.5)" }}>
                      「 {supporterBenefits.title || stats.title} 」
                    </p>
                  )}
                </div>

                {/* Level and Power Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background/50 border border-primary/20 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Level</p>
                    <p className="text-xl font-bold text-primary">{stats.level}</p>
                  </div>
                  <div className="bg-background/50 border border-secondary/20 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Power</p>
                    <p className="text-xl font-bold text-secondary">
                      {stats.strength + stats.agility + stats.intelligence + stats.vitality + stats.sense}
                    </p>
                  </div>
                </div>

                {/* Stat badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="border-red-500/50 text-red-400 text-xs px-1.5 py-0">
                    STR {stats.strength}
                  </Badge>
                  <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs px-1.5 py-0">
                    AGI {stats.agility}
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs px-1.5 py-0">
                    INT {stats.intelligence}
                  </Badge>
                  <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs px-1.5 py-0">
                    VIT {stats.vitality}
                  </Badge>
                  <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs px-1.5 py-0">
                    SEN {stats.sense}
                  </Badge>
                </div>
              </div>
            </div>

            {/* System quote */}
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground italic">
                "The System monitors your progress..."
              </p>
            </div>
          </Card>

          {/* Back - Achievements showcase */}
          <Card 
            className={cn(
              "absolute inset-0 px-6 py-4 md:py-5 bg-gradient-to-br from-background via-background to-amber-500/5 border-amber-500/30 shadow-[0_0_30px_hsl(45,90%,50%/0.15)] overflow-hidden backface-hidden",
            )}
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/30" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-500/30" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-500/30" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/30" />

            {/* Flip hint */}
            <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-amber-400/90" style={{ textShadow: "0 0 8px hsl(45 90% 50% / 0.6), 0 0 16px hsl(45 90% 50% / 0.4)" }}>
              <RotateCcw className="w-3 h-3" />
              <span>Flip for profile</span>
            </div>

            <div className="space-y-2 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-400 font-cinzel">Achievements</h3>
                  <p className="text-xs text-muted-foreground">
                    {unlockedAchievements.length} unlocked • {progress.totalPoints} pts
                  </p>
                </div>
              </div>

              {/* Top achievements grid */}
              <div 
                className="flex-1"
                data-badge-click
              >
                {topAchievements.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {topAchievements.map(achievement => (
                      <div
                        key={achievement.id}
                        data-badge-click
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAchievement(achievement);
                        }}
                        className="cursor-pointer"
                      >
                        <AchievementBadge
                          achievement={achievement}
                          size="md"
                          locked={false}
                          showTooltip={false}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No achievements yet. Start your journey!
                  </div>
                )}
              </div>

              {/* Rarity breakdown */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                {rarityOrder.map(rarity => {
                  const count = rarityCounts[rarity] || 0;
                  if (count === 0) return null;
                  const config = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];
                  return (
                    <span 
                      key={rarity}
                      className={cn(
                        "px-2 py-0.5 rounded text-xs border",
                        config.bgColor,
                        config.borderColor,
                        config.color
                      )}
                    >
                      {count} {rarity}
                    </span>
                  );
                })}
              </div>

              {/* View all button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/achievements");
                }}
              >
                View All Achievements
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        open={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </>
  );
};
