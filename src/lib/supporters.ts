// Supporter system types and utilities

export type SupporterTier = 'e_rank' | 'd_rank' | 'c_rank' | 'b_rank' | 'a_rank' | 's_rank';

export interface Supporter {
  id: string;
  hunter_name: string;
  tier: SupporterTier;
  custom_title: string | null;
  custom_frame_id: string | null;
  ko_fi_username: string | null;
  discord_username: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface RedemptionCode {
  id: string;
  code: string;
  supporter_id: string | null;
  tier: SupporterTier;
  unlocks_badge: boolean;
  unlocks_frame: string | null;
  unlocks_title: string | null;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface SupporterBenefits {
  tier: SupporterTier | null;
  badge: boolean;
  frame: string | null; // Primary/highest tier frame
  unlockedFrames: string[]; // All frames unlocked based on tier
  title: string | null;
  hunterName: string | null;
  redeemedAt: string | null;
}

// Frame IDs mapped to minimum tier required (must match IDs in cardFrames.ts)
export const SUPPORTER_FRAME_TIERS: Record<string, SupporterTier> = {
  'guild-master-frame': 'b_rank',      // Guild Master's Crest - B-Rank+
  'national-hunter-frame': 'b_rank',   // National Level Hunter - B-Rank+
  'sovereign-frame': 'a_rank',         // Sovereign's Authority - A-Rank+
  'monarch-frame': 's_rank',           // Shadow Monarch's Throne - S-Rank only
};

// Get all frames unlocked for a given tier
export const getUnlockedFramesForTier = (tier: SupporterTier): string[] => {
  const tierRank = TIER_ORDER.indexOf(tier);
  const unlocked: string[] = [];
  
  for (const [frameId, minTier] of Object.entries(SUPPORTER_FRAME_TIERS)) {
    const frameTierRank = TIER_ORDER.indexOf(minTier);
    // If user's tier rank is <= frame's tier rank (lower index = higher rank)
    if (tierRank <= frameTierRank) {
      unlocked.push(frameId);
    }
  }
  
  return unlocked;
};

// Tier display configurations
export const TIER_CONFIG: Record<SupporterTier, {
  name: string;
  displayName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  icon: string;
  minDonation: string;
}> = {
  e_rank: {
    name: 'E-Rank',
    displayName: 'E-Rank Hunter',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/50',
    glowColor: 'shadow-gray-500/30',
    icon: '🗡️',
    minDonation: '$2',
  },
  d_rank: {
    name: 'D-Rank',
    displayName: 'D-Rank Hunter',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    glowColor: 'shadow-green-500/30',
    icon: '⚔️',
    minDonation: '$5',
  },
  c_rank: {
    name: 'C-Rank',
    displayName: 'C-Rank Hunter',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    glowColor: 'shadow-blue-500/30',
    icon: '🛡️',
    minDonation: '$7',
  },
  b_rank: {
    name: 'B-Rank',
    displayName: 'B-Rank Hunter',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/30',
    icon: '💎',
    minDonation: '$10',
  },
  a_rank: {
    name: 'A-Rank',
    displayName: 'A-Rank Hunter',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    glowColor: 'shadow-orange-500/30',
    icon: '👑',
    minDonation: '$15',
  },
  s_rank: {
    name: 'S-Rank',
    displayName: 'S-Rank Hunter',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    glowColor: 'shadow-yellow-500/30',
    icon: '⭐',
    minDonation: '$20-25',
  },
};

// Tier order for sorting (highest first)
export const TIER_ORDER: SupporterTier[] = ['s_rank', 'a_rank', 'b_rank', 'c_rank', 'd_rank', 'e_rank'];

// LocalStorage key for supporter benefits
const SUPPORTER_BENEFITS_KEY = 'soloLevelingSupporterBenefits';

export const getSupporterBenefits = (): SupporterBenefits => {
  const stored = localStorage.getItem(SUPPORTER_BENEFITS_KEY);
  if (!stored) {
    return {
      tier: null,
      badge: false,
      frame: null,
      unlockedFrames: [],
      title: null,
      hunterName: null,
      redeemedAt: null,
    };
  }
  const parsed = JSON.parse(stored);
  // Migration: add unlockedFrames if missing (for existing users)
  if (!parsed.unlockedFrames && parsed.tier) {
    parsed.unlockedFrames = getUnlockedFramesForTier(parsed.tier);
  }
  return parsed;
};

export const setSupporterBenefits = (benefits: SupporterBenefits): void => {
  localStorage.setItem(SUPPORTER_BENEFITS_KEY, JSON.stringify(benefits));
};

export const clearSupporterBenefits = (): void => {
  localStorage.removeItem(SUPPORTER_BENEFITS_KEY);
};
