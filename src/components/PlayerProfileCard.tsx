import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerStats } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { getSupporterBenefits, TIER_CONFIG } from "@/lib/supporters";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementBadgeRow } from "./AchievementBadge";

interface PlayerProfileCardProps {
  stats: PlayerStats;
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

export const PlayerProfileCard = ({ stats }: PlayerProfileCardProps) => {
  // Check if avatar is a custom image (base64 data URL) or a class ID
  const isCustomImage = stats.avatar?.startsWith("data:");
  const classEmoji = CLASS_EMOJIS[stats.avatar || "default"] || CLASS_EMOJIS.default;
  
  // Get supporter benefits
  const supporterBenefits = getSupporterBenefits();
  const tierConfig = supporterBenefits.tier ? TIER_CONFIG[supporterBenefits.tier] : null;

  // Get top achievements
  const { unlockedAchievements } = useAchievements();
  const topAchievements = [...unlockedAchievements]
    .sort((a, b) => {
      const rarityOrder = ["mythic", "legendary", "epic", "rare", "uncommon", "common"];
      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    })
    .slice(0, 5);

  return (
    <Card className="p-6 bg-gradient-to-br from-background via-background to-primary/5 border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.15)] relative overflow-hidden">
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/30" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-secondary/30" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-secondary/30" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/30" />

      <div className="flex items-start gap-6 relative z-10">
        {/* Avatar */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-30 animate-pulse" />
          <Avatar className="h-24 w-24 border-4 border-primary/50 relative shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            {isCustomImage && <AvatarImage src={stats.avatar} alt={stats.name} className="object-cover" />}
            <AvatarFallback className="text-5xl bg-gradient-to-br from-background to-primary/20">
              {classEmoji}
            </AvatarFallback>
          </Avatar>
          
          {/* Rank badge on avatar */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-primary to-secondary px-3 py-1 rounded-full border-2 border-background shadow-lg">
            <span className="text-xs font-bold text-background">{stats.rank}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          {/* Name and Title */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-foreground font-cinzel tracking-wide">
                {stats.name}
              </h3>
              {/* Supporter Badge */}
              {supporterBenefits.badge && tierConfig && (
                <Badge className={`${tierConfig.bgColor} ${tierConfig.color} border ${tierConfig.borderColor} text-xs`}>
                  {tierConfig.icon} {tierConfig.name}
                </Badge>
              )}
            </div>
            {/* Custom supporter title takes precedence */}
            {(supporterBenefits.title || stats.title) && (
              <p className="text-sm text-secondary italic mt-1" style={{ textShadow: "0 0 10px hsl(var(--secondary) / 0.5)" }}>
                「 {supporterBenefits.title || stats.title} 」
              </p>
            )}
          </div>

          {/* Level and Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 border border-primary/20 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="text-2xl font-bold text-primary">{stats.level}</p>
            </div>
            <div className="bg-background/50 border border-secondary/20 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Power</p>
              <p className="text-2xl font-bold text-secondary">
                {stats.strength + stats.agility + stats.intelligence + stats.vitality + stats.sense}
              </p>
            </div>
          </div>

          {/* Stat badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-red-500/50 text-red-400 text-xs">
              STR {stats.strength}
            </Badge>
            <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
              AGI {stats.agility}
            </Badge>
            <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
              INT {stats.intelligence}
            </Badge>
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
              VIT {stats.vitality}
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
              SEN {stats.sense}
            </Badge>
          </div>
        </div>
      </div>

      {/* Achievements Row */}
      {topAchievements.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Top Achievements</p>
          <AchievementBadgeRow achievements={topAchievements} maxDisplay={5} size="sm" />
        </div>
      )}

      {/* System quote */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-center text-muted-foreground italic">
          "The System monitors your progress..."
        </p>
      </div>
    </Card>
  );
};
