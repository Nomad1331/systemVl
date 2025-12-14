import { Card } from "@/components/ui/card";
import type { PlayerStats } from "@/lib/storage";
import { ALL_FRAMES } from "@/lib/cardFrames";
import { useRef, useEffect } from "react";

// Import frame images
import iceFrame from "@/assets/frames/ice-frame.png";
import fireFrame from "@/assets/frames/fire-frame.png";
import shadowFrame from "@/assets/frames/shadow-frame.png";
import electricFrame from "@/assets/frames/electric-frame.png";
import natureFrame from "@/assets/frames/nature-frame.png";
import cosmicFrame from "@/assets/frames/cosmic-frame.png";
import demonFrame from "@/assets/frames/demon-frame.png";
import bloodFrame from "@/assets/frames/blood-frame.png";
import celestialFrame from "@/assets/frames/celestial-frame.png";
import emeraldFrame from "@/assets/frames/emerald-frame.png";
// Supporter exclusive frames
import monarchFrame from "@/assets/frames/monarch-frame.png";
import guildMasterFrame from "@/assets/frames/guild-master-frame.png";
import nationalHunterFrame from "@/assets/frames/national-hunter-frame.png";
import sovereignFrame from "@/assets/frames/sovereign-frame.png";

const FRAME_IMAGES: Record<string, string> = {
  "ice-frame": iceFrame,
  "fire-frame": fireFrame,
  "shadow-frame": shadowFrame,
  "electric-frame": electricFrame,
  "nature-frame": natureFrame,
  "cosmic-frame": cosmicFrame,
  "demon-frame": demonFrame,
  "blood-frame": bloodFrame,
  "celestial-frame": celestialFrame,
  "emerald-frame": emeraldFrame,
  // Supporter exclusive
  "monarch-frame": monarchFrame,
  "guild-master-frame": guildMasterFrame,
  "national-hunter-frame": nationalHunterFrame,
  "sovereign-frame": sovereignFrame,
};

interface StatsCardFrameProps {
  stats: PlayerStats;
  frameId?: string;
}

const AVATAR_EMOJIS: Record<string, string> = {
  warrior: "⚔️",
  mage: "🔮",
  assassin: "🗡️",
  tank: "🛡️",
  ranger: "🏹",
  necromancer: "💀",
  default: "👤",
};

const AVATAR_BACKGROUNDS: Record<string, string> = {
  warrior: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
  mage: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
  assassin: "linear-gradient(135deg, #475569 0%, #0f172a 100%)",
  tank: "linear-gradient(135deg, #ca8a04 0%, #713f12 100%)",
  ranger: "linear-gradient(135deg, #16a34a 0%, #14532d 100%)",
  necromancer: "linear-gradient(135deg, #6b21a8 0%, #2e1065 100%)",
  default: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
};

export const StatsCardFrame = ({ stats, frameId }: StatsCardFrameProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = ALL_FRAMES.find((f) => f.id === (frameId || stats.selectedCardFrame)) || ALL_FRAMES[0];
  const avatarEmoji = AVATAR_EMOJIS[stats.avatar || "default"];
  const avatarBackground = AVATAR_BACKGROUNDS[stats.avatar || "default"];
  const totalPower = stats.strength + stats.agility + stats.intelligence + stats.vitality + stats.sense;
  const isCustomAvatar = stats.avatar && !AVATAR_EMOJIS[stats.avatar];

  // Particle animation effect
  useEffect(() => {
    if (frame.styles.animation === "particles" && cardRef.current) {
      const canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "5";
      cardRef.current.prepend(canvas);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = cardRef.current.offsetWidth;
      canvas.height = cardRef.current.offsetHeight;

      const particles: Array<{ x: number; y: number; vx: number; vy: number; alpha: number }> = [];
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          alpha: Math.random() * 0.5 + 0.3,
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = frame.styles.glowColor;

        particles.forEach((p) => {
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });

        requestAnimationFrame(animate);
      };

      animate();

      return () => {
        canvas.remove();
      };
    }
  }, [frame]);

  // Render theme-specific elements
  const renderThemeElements = () => {
    if (!frame.styles.themeElements) return null;

    const { type, color } = frame.styles.themeElements;

    switch (type) {
      case "flames":
        return (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-8 animate-pulse"
                style={{
                  left: `${10 + i * 12}%`,
                  bottom: "0",
                  background: `linear-gradient(to top, ${color}, transparent)`,
                  opacity: 0.6,
                  animation: `pulse ${1 + Math.random()}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );
      
      case "ice-crystals":
        return (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  top: `${10 + i * 15}%`,
                  left: `${5 + (i % 2) * 90}%`,
                  width: "16px",
                  height: "16px",
                  background: color,
                  clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  opacity: 0.5,
                  animation: `shimmer ${2 + Math.random()}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        );

      case "shadows":
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: "100px",
                  height: "100px",
                  background: `radial-gradient(circle, ${color}80, transparent)`,
                  top: `${i * 30}%`,
                  left: i % 2 === 0 ? "-30px" : "auto",
                  right: i % 2 === 1 ? "-30px" : "auto",
                  animation: `float ${3 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        );

      case "lightning":
        return (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
            <div
              className="absolute top-0 left-1/4 w-1 h-full opacity-30"
              style={{
                background: `linear-gradient(to bottom, ${color}, transparent)`,
                animation: "pulse 0.3s ease-in-out infinite",
              }}
            />
            <div
              className="absolute top-0 right-1/4 w-1 h-full opacity-30"
              style={{
                background: `linear-gradient(to bottom, ${color}, transparent)`,
                animation: "pulse 0.3s ease-in-out infinite 0.15s",
              }}
            />
          </div>
        );

      case "stars":
        return (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: "4px",
                  height: "4px",
                  background: color,
                  borderRadius: "50%",
                  boxShadow: `0 0 10px ${color}`,
                  animation: `twinkle ${1 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      case "energy":
        return (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${color}20, transparent 70%)`,
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getCornerDecoration = () => {
    const baseClasses = "absolute w-12 h-12";
    const borderClasses = "border-2";
    
    switch (frame.styles.cornerStyle) {
      case "sharp":
        return borderClasses;
      case "rounded":
        return `${borderClasses} rounded-lg`;
      case "ornate":
        return `${borderClasses} rounded-full`;
      case "geometric":
        return borderClasses;
    }
  };

  const getAnimationClass = () => {
    switch (frame.styles.animation) {
      case "pulse":
        return "animate-pulse";
      case "shimmer":
        return "animate-shimmer";
      case "glow":
        return "animate-glow";
      case "holographic":
        return "animate-holographic";
      default:
        return "";
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-[320px] rounded-2xl"
      style={{
        boxShadow: `0 0 80px ${frame.styles.glowColor}`,
      }}
    >
      <Card className={`w-full bg-gradient-to-b from-black via-black/95 to-black border-4 relative overflow-hidden rounded-2xl ${getAnimationClass()}`}
        style={{
          borderImage: `linear-gradient(135deg, ${frame.styles.borderGradient.replace(/from-|via-|to-/g, '').split(' ').join(', ')}) 1`,
        }}
      >
        {/* Background overlay */}
        {frame.styles.backgroundOverlay && (
          <div
            className="absolute inset-0 z-0"
            style={{
              background: frame.styles.backgroundOverlay,
              opacity: 0.4,
            }}
          />
        )}

        {/* Subtle pattern */}
        <div className="absolute inset-0 z-0" style={{ opacity: frame.styles.patternOpacity }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 35px, currentColor 35px, currentColor 36px)",
              color: frame.styles.glowColor,
            }}
          />
        </div>

        {/* Theme-specific decorative elements */}
        {renderThemeElements()}

        <div className="relative z-10 flex flex-col p-4">
          {/* Top Info Bar */}
          <div className="flex justify-between items-center mb-4">
            {/* Name & Level */}
            <div className="flex-1 min-w-0 pr-3">
              <h2 className="text-lg font-bold font-cinzel text-white tracking-wider mb-1" style={{ textShadow: `0 0 15px ${frame.styles.glowColor}` }}>
                {stats.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: frame.styles.glowColor }}>LV. {stats.level}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-medium text-gray-300">{totalPower} ⚡</span>
              </div>
            </div>
            {/* Rank Badge */}
            <div
              className="text-sm font-bold px-3 py-2 bg-black/70 border-2 rounded-lg backdrop-blur-sm shrink-0 flex items-center justify-center leading-none"
              style={{
                borderColor: frame.styles.glowColor,
                color: frame.styles.glowColor,
                textShadow: `0 0 12px ${frame.styles.glowColor}`,
              }}
            >
              {stats.rank}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl border px-4 py-3" style={{ borderColor: `${frame.styles.glowColor}40` }}>
            {/* Stat Bars */}
            <div className="space-y-2">
              {[
                { label: "STR", value: stats.strength, color: "#ef4444", icon: "💪" },
                { label: "AGI", value: stats.agility, color: "#22c55e", icon: "⚡" },
                { label: "INT", value: stats.intelligence, color: "#3b82f6", icon: "🧠" },
                { label: "VIT", value: stats.vitality, color: "#eab308", icon: "❤️" },
                { label: "SEN", value: stats.sense, color: "#a855f7", icon: "👁️" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="text-base">{stat.icon}</span>
                  <span className="text-xs font-bold text-gray-300 w-8">{stat.label}</span>
                  <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-gray-700">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min((stat.value / 100) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${stat.color}, ${stat.color}dd)`,
                        boxShadow: `0 0 8px ${stat.color}`
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right" style={{ color: stat.color, textShadow: `0 0 8px ${stat.color}` }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Quote */}
          <div className="pt-3">
            <p className="text-[9px] text-gray-500 text-center italic tracking-wide">
              "I am a Hunter chosen by The System"
            </p>
          </div>
        </div>
      </Card>

      {/* 3D Frame Overlay - Powerclip Style */}
      {frame.styles.frameImage && FRAME_IMAGES[frame.styles.frameImage] && (
        <div 
          className="absolute pointer-events-none" 
          style={{ 
            zIndex: 50,
            top: `${frame.styles.frameInset?.top ?? -10}%`,
            right: `${frame.styles.frameInset?.right ?? -10}%`,
            bottom: `${frame.styles.frameInset?.bottom ?? -10}%`,
            left: `${frame.styles.frameInset?.left ?? -10}%`,
          }}
        >
          <img 
            src={FRAME_IMAGES[frame.styles.frameImage]} 
            alt={`${frame.name} frame`}
            className="w-full h-full object-fill"
            style={{
              mixBlendMode: "lighten",
              opacity: 1,
            }}
          />
        </div>
      )}
    </div>
  );
};
