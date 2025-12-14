import { useEffect, useState } from "react";
import { Achievement, RARITY_CONFIG, CATEGORY_CONFIG } from "@/lib/achievements";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AchievementUnlockPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementUnlockPopup = ({
  achievement,
  onClose,
}: AchievementUnlockPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      // Small delay for dramatic effect
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [achievement]);

  if (!achievement) return null;

  const rarity = RARITY_CONFIG[achievement.rarity];
  const category = CATEGORY_CONFIG[achievement.category];

  return (
    <Dialog open={!!achievement} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md border-2 overflow-hidden p-0 bg-background/95 backdrop-blur-xl">
        {/* Background glow effect */}
        <div 
          className={cn(
            "absolute inset-0 opacity-30",
            achievement.rarity === "mythic" && "bg-gradient-to-br from-rose-500/40 via-purple-500/40 to-rose-500/40 animate-pulse",
            achievement.rarity === "legendary" && "bg-gradient-to-br from-amber-500/40 to-yellow-500/40 animate-pulse",
            achievement.rarity === "epic" && "bg-gradient-to-br from-purple-500/30 to-purple-600/30",
            achievement.rarity === "rare" && "bg-gradient-to-br from-blue-500/20 to-blue-600/20",
          )}
        />
        
        <div className="relative z-10 p-6 text-center space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <p className="text-xs text-primary uppercase tracking-widest font-bold animate-pulse">
              Achievement Unlocked!
            </p>
            <div className={cn("text-sm", category.color)}>
              {category.icon} {category.name}
            </div>
          </div>

          {/* Achievement Icon */}
          <div 
            className={cn(
              "mx-auto w-24 h-24 rounded-2xl flex items-center justify-center border-4 transform transition-all duration-500",
              rarity.bgColor,
              rarity.borderColor,
              rarity.glow,
              isVisible ? "scale-100 rotate-0" : "scale-50 rotate-12"
            )}
          >
            <span className="text-5xl">{achievement.icon}</span>
          </div>

          {/* Achievement Name & Description */}
          <div className="space-y-2">
            <h2 className={cn("text-2xl font-bold font-cinzel", rarity.color)}>
              {achievement.name}
            </h2>
            <p className="text-muted-foreground text-sm">
              {achievement.description}
            </p>
          </div>

          {/* Rarity & Points */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase border",
              rarity.bgColor,
              rarity.borderColor,
              rarity.color
            )}>
              {achievement.rarity}
            </span>
            <span className="text-amber-400 font-bold">
              +{achievement.points} Achievement Points
            </span>
          </div>

          {/* Close Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 mt-4"
          >
            Claim Achievement
          </Button>
        </div>

        {/* Particle effects for mythic/legendary */}
        {(achievement.rarity === "mythic" || achievement.rarity === "legendary") && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-1 h-1 rounded-full animate-pulse",
                  achievement.rarity === "mythic" ? "bg-rose-400" : "bg-amber-400"
                )}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Wrapper component to handle the queue of unlocked achievements
interface AchievementUnlockQueueProps {
  achievements: Achievement[];
  onDismiss: (id: string) => void;
}

export const AchievementUnlockQueue = ({
  achievements,
  onDismiss,
}: AchievementUnlockQueueProps) => {
  const [current, setCurrent] = useState<Achievement | null>(null);

  useEffect(() => {
    if (achievements.length > 0 && !current) {
      setCurrent(achievements[0]);
    }
  }, [achievements, current]);

  const handleClose = () => {
    if (current) {
      onDismiss(current.id);
      setCurrent(null);
    }
  };

  return <AchievementUnlockPopup achievement={current} onClose={handleClose} />;
};
