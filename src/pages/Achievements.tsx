import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementBadge } from "@/components/AchievementBadge";
import { AchievementDetailModal } from "@/components/AchievementDetailModal";
import { 
  Achievement, 
  AchievementCategory, 
  ACHIEVEMENTS, 
  CATEGORY_CONFIG, 
  RARITY_CONFIG 
} from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { Trophy, Star, Filter } from "lucide-react";

const Achievements = () => {
  const { progress, unlockedAchievements, lockedAchievements, allAchievements } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "all">("all");
  const [showLocked, setShowLocked] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const categories: (AchievementCategory | "all")[] = ["all", "streak", "power", "gates", "quests", "habits", "level", "special"];

  const filteredAchievements = allAchievements.filter(a => {
    if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
    if (!showLocked && !progress.unlockedAchievements.includes(a.id)) return false;
    return true;
  });

  // Sort: unlocked first, then by rarity
  const rarityOrder = ["mythic", "legendary", "epic", "rare", "uncommon", "common"];
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    const aUnlocked = progress.unlockedAchievements.includes(a.id);
    const bUnlocked = progress.unlockedAchievements.includes(b.id);
    if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
  });

  // Stats
  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = unlockedAchievements.length;
  const completionPercent = Math.round((unlockedCount / totalAchievements) * 100);

  return (
    <div className="container mx-auto px-4 py-6 pt-20 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary font-cinzel" style={{ textShadow: "0 0 20px hsl(var(--primary) / 0.5)" }}>
            ACHIEVEMENTS
          </h1>
          <p className="text-muted-foreground">
            Collect badges and prove your worth as a Hunter
          </p>
        </div>

        {/* Stats Overview */}
        <Card className="p-6 bg-gradient-to-br from-background via-background to-amber-500/5 border-amber-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion</span>
                <span className="text-sm font-bold text-amber-400">{unlockedCount}/{totalAchievements}</span>
              </div>
              <Progress value={completionPercent} className="h-3 bg-muted" />
              <p className="text-xs text-muted-foreground text-center">{completionPercent}% Complete</p>
            </div>

            {/* Total Points */}
            <div className="flex flex-col items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-3xl font-bold text-amber-400">{progress.totalPoints}</p>
              <p className="text-xs text-muted-foreground">Achievement Points</p>
            </div>

            {/* Rarity Breakdown */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground mb-2">By Rarity</p>
              <div className="flex flex-wrap gap-1">
                {rarityOrder.map(rarity => {
                  const total = ACHIEVEMENTS.filter(a => a.rarity === rarity).length;
                  const unlocked = unlockedAchievements.filter(a => a.rarity === rarity).length;
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
                      {unlocked}/{total}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category tabs */}
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AchievementCategory | "all")} className="flex-1">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent">
              {categories.map(cat => {
                const config = cat === "all" ? null : CATEGORY_CONFIG[cat];
                const count = cat === "all" 
                  ? unlockedAchievements.length 
                  : unlockedAchievements.filter(a => a.category === cat).length;
                return (
                  <TabsTrigger 
                    key={cat}
                    value={cat}
                    className={cn(
                      "data-[state=active]:bg-primary/20 data-[state=active]:text-primary",
                      "px-3 py-1.5 text-xs"
                    )}
                  >
                    {config ? `${config.icon} ` : "🏆 "}
                    {cat === "all" ? "All" : config?.name}
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1">{count}</Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Show locked toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLocked(!showLocked)}
            className={cn(
              "text-xs",
              showLocked ? "border-primary/50" : "border-muted-foreground/30 opacity-60"
            )}
          >
            <Filter className="w-3 h-3 mr-1" />
            {showLocked ? "Showing All" : "Unlocked Only"}
          </Button>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAchievements.map(achievement => {
            const isUnlocked = progress.unlockedAchievements.includes(achievement.id);
            const rarity = RARITY_CONFIG[achievement.rarity];
            const category = CATEGORY_CONFIG[achievement.category];

            return (
              <Card
                key={achievement.id}
                className={cn(
                  "p-4 transition-all duration-300 border-2 cursor-pointer",
                  isUnlocked 
                    ? `${rarity.borderColor} ${rarity.glow} hover:scale-[1.02]`
                    : "border-muted-foreground/20 opacity-60 hover:opacity-80"
                )}
                onClick={() => setSelectedAchievement(achievement)}
              >
                <div className="flex items-start gap-4">
                  <AchievementBadge 
                    achievement={achievement} 
                    size="lg" 
                    showTooltip={false}
                    locked={!isUnlocked}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={cn(
                        "font-bold truncate",
                        isUnlocked ? rarity.color : "text-muted-foreground"
                      )}>
                        {achievement.name}
                      </h3>
                      <span className={cn("text-xs", category.color)}>
                        {category.icon}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] px-1.5 capitalize",
                          isUnlocked && rarity.borderColor,
                          isUnlocked && rarity.color
                        )}
                      >
                        {achievement.rarity}
                      </Badge>
                      <span className="text-xs text-amber-400">
                        <Star className="w-3 h-3 inline mr-0.5" />
                        {achievement.points}
                      </span>
                      {!isUnlocked && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          🔒
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {sortedAchievements.length === 0 && (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No achievements found with current filters</p>
          </Card>
        )}

        {/* Achievement Detail Modal */}
        <AchievementDetailModal
          achievement={selectedAchievement}
          open={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      </div>
  );
};

export default Achievements;
