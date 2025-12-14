import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp } from "lucide-react";
import { playLevelUp } from "@/lib/sounds";

interface LevelUpAnimationProps {
  newLevel: number;
  pointsEarned: number;
  onComplete: () => void;
}

export const LevelUpAnimation = ({ newLevel, pointsEarned, onComplete }: LevelUpAnimationProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    playLevelUp();
    
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-neon-purple border-4 border-primary shadow-[0_0_80px_hsl(var(--primary)/0.8)] animate-scale-in">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 animate-pulse" style={{
            background: "repeating-linear-gradient(45deg, transparent, transparent 35px, hsl(var(--primary)) 35px, hsl(var(--primary)) 36px)"
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 p-12 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="w-24 h-24 text-primary" />
              </div>
              <TrendingUp className="w-24 h-24 text-white relative z-10" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-6xl font-bold text-white font-cinzel animate-pulse" style={{ textShadow: "0 0 30px hsl(var(--primary))" }}>
              LEVEL UP!
            </h2>
            <p className="text-4xl font-bold text-primary" style={{ textShadow: "0 0 20px hsl(var(--primary))" }}>
              Level {newLevel}
            </p>
            <p className="text-xl text-secondary">
              +{pointsEarned} Ability Points Earned
            </p>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-300 italic max-w-md mx-auto">
            "The System acknowledges your growth. You are becoming stronger..."
          </p>
        </div>

        {/* Glowing corners */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`absolute w-32 h-32 ${
              i === 0 ? "top-0 left-0" : 
              i === 1 ? "top-0 right-0" : 
              i === 2 ? "bottom-0 left-0" : "bottom-0 right-0"
            }`}
          >
            <div className={`absolute ${
              i === 0 ? "top-4 left-4 border-t-4 border-l-4" :
              i === 1 ? "top-4 right-4 border-t-4 border-r-4" :
              i === 2 ? "bottom-4 left-4 border-b-4 border-l-4" :
              "bottom-4 right-4 border-b-4 border-r-4"
            } w-16 h-16 border-white animate-pulse`} />
          </div>
        ))}
      </Card>
    </div>
  );
};
