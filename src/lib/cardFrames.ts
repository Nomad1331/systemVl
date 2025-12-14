// Card Frame definitions for shareable stats cards

export interface CardFrame {
  id: string;
  name: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Supporter";
  creditCost: number;
  unlocked: boolean;
  supporterExclusive?: boolean; // Only unlockable via redemption code
  supporterTierRequired?: "b_rank" | "a_rank" | "s_rank"; // Minimum tier required
  styles: {
    borderGradient: string;
    glowColor: string;
    glowIntensity: number;
    patternOpacity: number;
    cornerStyle: "sharp" | "rounded" | "ornate" | "geometric";
    edgeStyle?: "sharp" | "flame" | "ice" | "shadow" | "ornate" | "electric" | "nature" | "cosmic" | "demon" | "monarch" | "guild";
    animation?: "pulse" | "shimmer" | "glow" | "particles" | "holographic";
    backgroundOverlay?: string;
    frameImage?: string;
    frameInset?: { top: number; right: number; bottom: number; left: number };
    themeElements?: {
      type: "flames" | "ice-crystals" | "shadows" | "lightning" | "stars" | "energy";
      color: string;
    };
  };
}

export const CARD_FRAMES: CardFrame[] = [
  // === COMMON ===
  {
    id: "default",
    name: "Hunter's Standard",
    rarity: "Common",
    creditCost: 0,
    unlocked: true,
    styles: {
      borderGradient: "from-primary via-secondary to-primary",
      glowColor: "hsl(var(--primary))",
      glowIntensity: 0.4,
      patternOpacity: 0.05,
      cornerStyle: "sharp",
      edgeStyle: "sharp",
      animation: "pulse",
    },
  },
  // === RARE ===
  {
    id: "emerald",
    name: "Emerald Guardian",
    rarity: "Rare",
    creditCost: 150,
    unlocked: false,
    styles: {
      borderGradient: "from-emerald-600 via-green-400 to-emerald-600",
      glowColor: "hsl(160 90% 50%)",
      glowIntensity: 0.5,
      patternOpacity: 0.07,
      cornerStyle: "rounded",
      edgeStyle: "sharp",
      animation: "pulse",
      backgroundOverlay: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), transparent)",
      frameImage: "emerald-frame",
      frameInset: { top: -6, right: -8, bottom: -2, left: -8 },
      themeElements: {
        type: "energy",
        color: "hsl(160 90% 60%)",
      },
    },
  },
  {
    id: "electric",
    name: "Storm Caller",
    rarity: "Rare",
    creditCost: 200,
    unlocked: false,
    styles: {
      borderGradient: "from-yellow-400 via-blue-400 to-yellow-400",
      glowColor: "hsl(55 100% 60%)",
      glowIntensity: 0.7,
      patternOpacity: 0.1,
      cornerStyle: "geometric",
      edgeStyle: "electric",
      animation: "shimmer",
      backgroundOverlay: "linear-gradient(90deg, rgba(255, 255, 0, 0.1), rgba(0, 100, 255, 0.1), rgba(255, 255, 0, 0.1))",
      frameImage: "electric-frame",
      frameInset: { top: -4, right: -2, bottom: 0, left: -2 },
      themeElements: {
        type: "lightning",
        color: "hsl(55 100% 70%)",
      },
    },
  },
  // === EPIC ===
  {
    id: "ice",
    name: "Frozen Fortress",
    rarity: "Epic",
    creditCost: 300,
    unlocked: false,
    styles: {
      borderGradient: "from-cyan-400 via-blue-300 to-cyan-400",
      glowColor: "hsl(190 90% 60%)",
      glowIntensity: 0.6,
      patternOpacity: 0.08,
      cornerStyle: "geometric",
      edgeStyle: "ice",
      animation: "shimmer",
      backgroundOverlay: "linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 150, 255, 0.1))",
      frameImage: "ice-frame",
      frameInset: { top: -2, right: -8, bottom: -2, left: -8 },
      themeElements: {
        type: "ice-crystals",
        color: "hsl(190 90% 70%)",
      },
    },
  },
  {
    id: "fire",
    name: "Inferno Blaze",
    rarity: "Epic",
    creditCost: 300,
    unlocked: false,
    styles: {
      borderGradient: "from-orange-600 via-red-500 to-orange-600",
      glowColor: "hsl(15 100% 50%)",
      glowIntensity: 0.7,
      patternOpacity: 0.12,
      cornerStyle: "sharp",
      edgeStyle: "flame",
      animation: "glow",
      backgroundOverlay: "radial-gradient(circle at 50% 50%, rgba(255, 69, 0, 0.2), transparent)",
      frameImage: "fire-frame",
      frameInset: { top: -8, right: -10, bottom: -4, left: -10 },
      themeElements: {
        type: "flames",
        color: "hsl(15 100% 60%)",
      },
    },
  },
  {
    id: "nature",
    name: "Forest Warden",
    rarity: "Epic",
    creditCost: 350,
    unlocked: false,
    styles: {
      borderGradient: "from-green-600 via-lime-400 to-green-600",
      glowColor: "hsl(120 80% 50%)",
      glowIntensity: 0.6,
      patternOpacity: 0.08,
      cornerStyle: "rounded",
      edgeStyle: "nature",
      animation: "pulse",
      backgroundOverlay: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(132, 204, 22, 0.15))",
      frameImage: "nature-frame",
      frameInset: { top: -8, right: -10, bottom: -8, left: -10 },
      themeElements: {
        type: "energy",
        color: "hsl(120 80% 60%)",
      },
    },
  },
  // === LEGENDARY ===
  {
    id: "shadow",
    name: "Shadow Monarch",
    rarity: "Legendary",
    creditCost: 500,
    unlocked: false,
    styles: {
      borderGradient: "from-purple-900 via-purple-500 to-purple-900",
      glowColor: "hsl(270 70% 60%)",
      glowIntensity: 0.8,
      patternOpacity: 0.1,
      cornerStyle: "ornate",
      edgeStyle: "shadow",
      animation: "particles",
      backgroundOverlay: "radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.2), transparent)",
      frameImage: "shadow-frame",
      frameInset: { top: -12, right: -10, bottom: -4, left: -12 },
      themeElements: {
        type: "shadows",
        color: "hsl(270 70% 40%)",
      },
    },
  },
  {
    id: "blood",
    name: "Blood Reaper",
    rarity: "Legendary",
    creditCost: 500,
    unlocked: false,
    styles: {
      borderGradient: "from-red-900 via-red-600 to-red-900",
      glowColor: "hsl(0 80% 40%)",
      glowIntensity: 0.8,
      patternOpacity: 0.1,
      cornerStyle: "sharp",
      edgeStyle: "flame",
      animation: "glow",
      backgroundOverlay: "radial-gradient(circle at 30% 30%, rgba(139, 0, 0, 0.3), transparent)",
      frameImage: "blood-frame",
      frameInset: { top: -2, right: -8, bottom: -2, left: -8 },
      themeElements: {
        type: "flames",
        color: "hsl(0 80% 50%)",
      },
    },
  },
  {
    id: "cosmic",
    name: "Cosmic Voyager",
    rarity: "Legendary",
    creditCost: 600,
    unlocked: false,
    styles: {
      borderGradient: "from-indigo-600 via-purple-400 to-pink-400",
      glowColor: "hsl(250 80% 60%)",
      glowIntensity: 0.9,
      patternOpacity: 0.12,
      cornerStyle: "rounded",
      edgeStyle: "cosmic",
      animation: "holographic",
      backgroundOverlay: "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.15), transparent)",
      frameImage: "cosmic-frame",
      frameInset: { top: -8, right: -10, bottom: -8, left: -10 },
      themeElements: {
        type: "stars",
        color: "hsl(250 80% 70%)",
      },
    },
  },
  // === MYTHIC ===
  {
    id: "celestial",
    name: "Celestial Divine",
    rarity: "Mythic",
    creditCost: 1000,
    unlocked: false,
    styles: {
      borderGradient: "from-yellow-300 via-pink-300 to-purple-400",
      glowColor: "hsl(45 100% 70%)",
      glowIntensity: 1.0,
      patternOpacity: 0.15,
      cornerStyle: "ornate",
      edgeStyle: "ornate",
      animation: "holographic",
      backgroundOverlay: "conic-gradient(from 0deg, rgba(255, 215, 0, 0.2), rgba(255, 105, 180, 0.2), rgba(138, 43, 226, 0.2), rgba(255, 215, 0, 0.2))",
      frameImage: "celestial-frame",
      frameInset: { top: -12, right: -14, bottom: -12, left: -14 },
      themeElements: {
        type: "stars",
        color: "hsl(45 100% 80%)",
      },
    },
  },
  {
    id: "demon",
    name: "Demon Lord",
    rarity: "Mythic",
    creditCost: 1200,
    unlocked: false,
    styles: {
      borderGradient: "from-red-900 via-black to-red-900",
      glowColor: "hsl(0 100% 30%)",
      glowIntensity: 1.0,
      patternOpacity: 0.15,
      cornerStyle: "sharp",
      edgeStyle: "demon",
      animation: "glow",
      backgroundOverlay: "radial-gradient(circle at 50% 50%, rgba(139, 0, 0, 0.4), rgba(0, 0, 0, 0.8))",
      frameImage: "demon-frame",
      frameInset: { top: -6, right: -10, bottom: -2, left: -10 },
      themeElements: {
        type: "shadows",
        color: "hsl(0 100% 40%)",
      },
    },
  },
];

// === SUPPORTER EXCLUSIVE FRAMES ===
// These frames can ONLY be unlocked via redemption codes for B-Rank+ supporters
// Ordered from B-Rank to S-Rank

export const SUPPORTER_EXCLUSIVE_FRAMES: CardFrame[] = [
  // B-Rank Frames
  {
    id: "guild-master-frame",
    name: "Guild Master's Crest",
    rarity: "Supporter",
    creditCost: 0,
    unlocked: false,
    supporterExclusive: true,
    supporterTierRequired: "b_rank",
    styles: {
      borderGradient: "from-amber-600 via-yellow-400 to-amber-600",
      glowColor: "hsl(45 100% 55%)",
      glowIntensity: 0.9,
      patternOpacity: 0.12,
      cornerStyle: "ornate",
      edgeStyle: "guild",
      animation: "shimmer",
      backgroundOverlay: "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(180, 120, 20, 0.15))",
      frameImage: "guild-master-frame",
      frameInset: { top: -18, right: -20, bottom: -18, left: -20 },
      themeElements: {
        type: "energy",
        color: "hsl(45 100% 65%)",
      },
    },
  },
  {
    id: "national-hunter-frame",
    name: "National Level Hunter",
    rarity: "Supporter",
    creditCost: 0,
    unlocked: false,
    supporterExclusive: true,
    supporterTierRequired: "b_rank",
    styles: {
      borderGradient: "from-blue-700 via-cyan-400 to-blue-700",
      glowColor: "hsl(200 100% 55%)",
      glowIntensity: 1.0,
      patternOpacity: 0.14,
      cornerStyle: "geometric",
      edgeStyle: "ornate",
      animation: "holographic",
      backgroundOverlay: "linear-gradient(180deg, rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.2), transparent)",
      frameImage: "national-hunter-frame",
      frameInset: { top: -10, right: -14, bottom: -8, left: -14 },
      themeElements: {
        type: "stars",
        color: "hsl(200 100% 70%)",
      },
    },
  },
  // A-Rank Frame
  {
    id: "sovereign-frame",
    name: "Sovereign's Authority",
    rarity: "Supporter",
    creditCost: 0,
    unlocked: false,
    supporterExclusive: true,
    supporterTierRequired: "a_rank",
    styles: {
      borderGradient: "from-amber-900 via-yellow-500 to-amber-900",
      glowColor: "hsl(45 100% 50%)",
      glowIntensity: 1.2,
      patternOpacity: 0.18,
      cornerStyle: "sharp",
      edgeStyle: "monarch",
      animation: "holographic",
      backgroundOverlay: "radial-gradient(ellipse at 50% 30%, rgba(180, 140, 20, 0.3), rgba(100, 50, 20, 0.4), rgba(20, 10, 5, 0.9))",
      frameImage: "sovereign-frame",
      frameInset: { top: -14, right: -16, bottom: -14, left: -16 },
      themeElements: {
        type: "energy",
        color: "hsl(45 100% 55%)",
      },
    },
  },
  // S-Rank Frame
  {
    id: "monarch-frame",
    name: "Shadow Monarch's Throne",
    rarity: "Supporter",
    creditCost: 0,
    unlocked: false,
    supporterExclusive: true,
    supporterTierRequired: "s_rank",
    styles: {
      borderGradient: "from-violet-900 via-purple-600 to-violet-900",
      glowColor: "hsl(270 90% 50%)",
      glowIntensity: 1.0,
      patternOpacity: 0.15,
      cornerStyle: "ornate",
      edgeStyle: "monarch",
      animation: "particles",
      backgroundOverlay: "radial-gradient(ellipse at 50% 30%, rgba(139, 92, 246, 0.4), rgba(30, 0, 50, 0.9))",
      frameImage: "monarch-frame",
      frameInset: { top: -10, right: -16, bottom: -10, left: -16 },
      themeElements: {
        type: "shadows",
        color: "hsl(270 90% 60%)",
      },
    },
  },
];

// Combine all frames for lookup
export const ALL_FRAMES: CardFrame[] = [...CARD_FRAMES, ...SUPPORTER_EXCLUSIVE_FRAMES];

export const getFrameById = (id: string): CardFrame | undefined => {
  return ALL_FRAMES.find(frame => frame.id === id);
};

export const getRarityColor = (rarity: CardFrame["rarity"]): string => {
  switch (rarity) {
    case "Common": return "text-gray-400";
    case "Rare": return "text-blue-400";
    case "Epic": return "text-purple-400";
    case "Legendary": return "text-orange-400";
    case "Mythic": return "text-pink-400";
    case "Supporter": return "text-emerald-400";
  }
};
