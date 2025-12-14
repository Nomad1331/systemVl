import { Achievement, RARITY_CONFIG, isAchievementUnlocked } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  locked?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AchievementBadge = ({
  achievement,
  size = "md",
  showTooltip = true,
  locked,
  className,
  onClick,
}: AchievementBadgeProps) => {
  const isUnlocked = locked !== undefined ? !locked : isAchievementUnlocked(achievement.id);
  const rarity = RARITY_CONFIG[achievement.rarity];

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-xl",
    lg: "w-16 h-16 text-3xl",
  };

  const handleClick = (e: React.MouseEvent | React.PointerEvent) => {
    if (onClick) {
      e.stopPropagation();
      e.preventDefault();
      onClick();
    }
  };

  const badgeContent = (
    <div
      className={cn(
        "relative rounded-lg flex items-center justify-center border-2 transition-all duration-300",
        sizeClasses[size],
        isUnlocked
          ? `${rarity.bgColor} ${rarity.borderColor} ${rarity.glow}`
          : "bg-muted/50 border-muted-foreground/30 grayscale opacity-50",
        isUnlocked && "hover:scale-110",
        onClick && "cursor-pointer",
        className
      )}
    >
      <span className={cn(isUnlocked ? "" : "opacity-30")}>
        {achievement.icon}
      </span>
      
      {/* Rarity glow effect for unlocked achievements */}
      {isUnlocked && achievement.rarity === "mythic" && (
        <div className="absolute inset-0 rounded-lg animate-pulse bg-gradient-to-br from-rose-500/20 to-purple-500/20 pointer-events-none" />
      )}
      {isUnlocked && achievement.rarity === "legendary" && (
        <div className="absolute inset-0 rounded-lg animate-pulse bg-amber-500/10 pointer-events-none" />
      )}
    </div>
  );

  if (!showTooltip) {
    return (
      <button 
        type="button"
        onClick={handleClick}
        onPointerDown={handleClick}
        className="appearance-none bg-transparent border-none p-0 m-0"
      >
        {badgeContent}
      </button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button 
            type="button"
            onClick={handleClick}
            onPointerDown={handleClick}
            className="appearance-none bg-transparent border-none p-0 m-0"
          >
            {badgeContent}
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className={cn(
            "max-w-xs border-2 p-3",
            rarity.borderColor,
            rarity.bgColor
          )}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{achievement.icon}</span>
              <span className={cn("font-bold", rarity.color)}>
                {achievement.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {achievement.description}
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className={cn("text-xs capitalize", rarity.color)}>
                {achievement.rarity}
              </span>
              <span className="text-xs text-amber-400">
                +{achievement.points} pts
              </span>
            </div>
            {!isUnlocked && (
              <p className="text-xs text-muted-foreground/70 italic pt-1 border-t border-border/50">
                🔒 Click for details
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Mini version for profile cards - shows just a few badges in a row
interface AchievementBadgeRowProps {
  achievements: Achievement[];
  maxDisplay?: number;
  size?: "sm" | "md";
  onBadgeClick?: (achievement: Achievement) => void;
}

export const AchievementBadgeRow = ({
  achievements,
  maxDisplay = 5,
  size = "sm",
  onBadgeClick,
}: AchievementBadgeRowProps) => {
  const displayed = achievements.slice(0, maxDisplay);
  const remaining = achievements.length - maxDisplay;

  return (
    <div className="flex items-center gap-1.5">
      {displayed.map(achievement => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          size={size}
          locked={false}
          onClick={onBadgeClick ? () => onBadgeClick(achievement) : undefined}
        />
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-lg bg-muted/50 border border-muted-foreground/30 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">+{remaining}</span>
        </div>
      )}
    </div>
  );
};
