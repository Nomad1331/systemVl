# Solo Leveling System - Project Context

## Project Overview

A gamified self-improvement application inspired by the Solo Leveling manhwa/anime. Users complete daily quests, build habits, face boss challenges (Gates), and track their personal growth through an RPG-style leveling system.

**Live Inspiration**: User has provided 5 reference screenshots from their original inspiration that showcase the target UI/UX and features.

## Current Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system (index.css)
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Routing**: React Router DOM
- **AI**: Hugging Face Transformers (@huggingface/transformers) - MobileBERT zero-shot classification
- **State**: React hooks + localStorage persistence
- **Icons**: Lucide React
- **Fonts**: Cinzel (imperial headings), Rajdhani, Orbitron

## Design Aesthetic

**Target**: Solo Leveling manhwa/anime aesthetic
- **Primary Font**: Cinzel (imperial, authoritative feel)
- **Color Scheme**: Dark theme with neon accents (purple, blue, cyan)
- **Visual Style**: Dramatic, game-like UI with glowing effects, rank badges, and atmospheric gradients
- **Design System**: All colors must use HSL format via CSS variables in index.css and tailwind.config.ts
- **Critical Rule**: NEVER use direct colors like text-white, bg-black, etc. Always use semantic tokens from the design system

## Critical Constraints

1. **FREE AI Only**: Must use free AI providers (like Hugging Face) - NOT Lovable's paid AI features. Reason: avoid vendor lock-in and enable independent deployment
2. **Changelog Required**: MUST update CHANGELOG.md after EVERY change, no matter how small
3. **No Backend (Yet)**: Currently 100% client-side with localStorage. No Lovable Cloud/Supabase integration yet
4. **Design System First**: Always customize via index.css and tailwind.config.ts, never inline styles

## Current Features (Implemented)

### 1. Status Page (Player Dashboard)
**Location**: `src/pages/Status.tsx`
- Player stats display: Level, Rank, XP progress bar
- Stat attributes: Strength, Agility, Intelligence, Vitality, Sense
- Radar chart visualization using Recharts (`src/components/StatsRadar.tsx`)
- Stat allocation system (5 points per level up)
- 4-card grid: Progress, Current Streak, Best Streak, Total XP
- Golden power calculation

### 2. Quests Page (Daily Quest System)
**Location**: `src/pages/Quests.tsx`
- **AI-Powered Quest Creation**: Natural language quest description → automatic generation
  - Uses `src/lib/questAI.ts` with MobileBERT zero-shot classification
  - Analyzes quest context to determine: stat type, amount, XP reward, quest name
  - Keywords detection + AI confidence scoring
  - Difficulty and duration multipliers (easy, hard, quick, long, etc.)
  - Model lazy loads on first use to minimize bundle size
- Quest completion tracking with checkboxes
- XP and stat rewards on completion
- Edit/delete quest functionality
- Daily reset system
- Toast notifications for completions and level-ups

### 3. Streak System
**Location**: Integrated in `Quests.tsx` + `src/lib/storage.ts`
- Tracks consecutive days of completing ALL quests
- Awards 100 bonus XP every 7-day milestone
- Visual effects:
  - Glowing animated cards when streak ≥7 days
  - Pulsing fire icon when streak ≥3 days
- Stores: currentStreak, longestStreak, lastCompletionDate, totalRewards
- Automatic validation on quest completion

### 4. Habits Page
**Status**: ✅ FULLY IMPLEMENTED
**Location**: `src/pages/Habits.tsx`

**Features**:
- **Automatic Win/Loss Detection**: Habits auto-finalize when goal period ends
  - 80% completion rate = WIN (grants winXP)
  - Below 80% = LOSS (deducts loseXP)
  - Manual override buttons available for early finalization
- **GitHub-style contribution grid** (`src/components/HabitGrid.tsx`)
  - 7-row layout with dynamic columns
  - Color intensity based on completion
  - Current day highlighting
- **Habit Goals tracking** (`src/components/HabitGoalCard.tsx`)
  - Days remaining countdown
  - Win/Lose XP stakes
  - Progress percentage and bar
  - Status indicators (active/won/lost)
- **Three-tab interface**:
  - Month: Grid view of all habits
  - Agenda: Today's checklist
  - Goals: Detailed goal cards
- **Full CRUD operations**:
  - Create habits with custom icon, color, goals
  - Mark daily completion
  - Auto-finalize or manual override
  - Delete habits
- **Data persistence** via localStorage

### 5. Gates Page
**Status**: Placeholder ("Coming Soon")
**Location**: `src/pages/Gates.tsx`

### 6. Navigation
**Location**: `src/components/Navigation.tsx`, `src/components/NavLink.tsx`
- Horizontal navigation bar
- Active state highlighting

## Data Architecture

### Storage (`src/lib/storage.ts`)

**PlayerStats Interface**:
```typescript
{
  level: number
  xp: number
  gold: number
  rank: string
  availablePoints: number
  strength: number
  agility: number
  intelligence: number
  vitality: number
  sense: number
}
```

**DailyQuest Interface**:
```typescript
{
  id: string
  name: string
  completed: boolean
  xpReward: number
  stat: keyof PlayerStats
  statBoostAmount: number
}
```

**StreakData Interface**:
```typescript
{
  currentStreak: number
  longestStreak: number
  lastCompletionDate: string
  totalRewards: number
}
```

### Custom Hooks

**usePlayerStats** (`src/hooks/usePlayerStats.ts`):
- `addXP(amount)`: Handles XP gain and auto level-ups (100 XP per level)
- `addGold(amount)`: Gold management
- `allocateStat(stat, amount)`: Spend available points
- `getTotalPower()`: Sum of all stats
- Level → Rank mapping: E (1-9), D (10-24), C (25-49), B (50-74), A (75-99), S (100+)

## Quest AI System (`src/lib/questAI.ts`)

### How It Works
1. User enters natural language quest description
2. MobileBERT zero-shot classification analyzes text
3. Predicts most appropriate stat from: intelligence, strength, sense, agility, vitality
4. Applies keyword-based refinement if:
   - AI confidence is low (<0.4)
   - AI suggests "sense" but keywords clearly match another stat
5. Calculates XP and stat boost based on:
   - Base values (XP: 50, stat boost: 1)
   - Difficulty multipliers: easy (0.7x), hard/difficult (1.5x)
   - Duration multipliers: quick (0.8x), long (1.3x)
6. Generates quest name from first sentence of description

### Stat Categories & Keywords
- **Intelligence**: study, read, learn, course, lecture, research, homework, exam
- **Strength**: workout, exercise, gym, pushups, weights, lift, training
- **Sense**: meditate, mindfulness, journal, reflect, music, art, observe
- **Agility**: run, sprint, cardio, yoga, stretch, dance, climb
- **Vitality**: sleep, rest, meal, water, health, checkup

### Recent Fixes (v1.1.1 - v1.1.2)
- Fixed: Quest AI was defaulting everything to "+1 sense"
- Solution: Combined AI predictions with keyword fallback logic
- Fixed: Quest rewards were using raw AI label instead of refined stat
- Current Status: Working correctly

## Planned Roadmap (Based on Inspiration Screenshots)

### Phase 1: Habits System ✅ COMPLETE
**Status**: Fully implemented with automatic win/loss detection

All planned features have been implemented:
- ✅ Habit data structure with completionGrid tracking
- ✅ GitHub-style contribution grid component
- ✅ Habit Goals cards with countdown and stakes
- ✅ Full CRUD functionality (create, mark, delete)
- ✅ Month/Agenda/Goals tabs
- ✅ **Automatic finalization**: 80% completion = win, below = loss
- ✅ Visual customization (icons, colors)
- ✅ XP rewards/penalties on completion

### Phase 2: Gates System (Boss Challenges)
**Goal**: Transform placeholder into boss challenge system

**Features to Implement**:
1. **Gate Data Structure**:
   - id, name, rank (C-Rank, B-Rank, etc.)
   - description, loreText
   - dailyChallenge (specific task)
   - requiredDays (7-day commitment)
   - progress (checkboxes), losses counter
   - rewards (gold, XP, special techniques/titles)
   - unlockRequirement (total XP threshold)

2. **Gate Card Components**:
   - Rank badges with Japanese characters
   - 7-day checkbox tracker (横 horizontal layout)
   - Loss counter ("Losses: X")
   - Challenge description
   - Reward preview

3. **"The System" Notification Panel**:
   - Boss appearance alerts
   - Dramatic lore/story text
   - Reward announcements
   - Ominous styling

4. **Gate Progression System**:
   - Unlock gates based on player level/total XP
   - Multiple difficulty tiers
   - Penalty system for failing 7-day challenges

### Phase 3: Enhanced Quests Page
**Goal**: Upgrade existing quests with advanced features

**Features to Add**:
1. **Pomodoro Timer**:
   - 25/50 minute work sessions
   - Short break (5 min) / Long break (15 min)
   - Auto-start next session option
   - Sound notifications

2. **Reward Centre**:
   - Define custom rewards ("1 Hour Free Time", "Game for 30 mins")
   - Cost in Credits (new currency)
   - Claim reward button
   - Credits earned from quest completion

3. **Task Log/History**:
   - Completed quests archive
   - Timestamps and dates
   - XP and Credits earned per task
   - Search/filter functionality

4. **Quest Difficulty System**:
   - Easy/Normal/Hard badges
   - Adjusts XP multipliers automatically
   - Visual difficulty indicators

### Phase 4: Navigation & Visual Overhaul
**Goal**: Achieve inspiration screenshot aesthetic

**Changes to Make**:
1. **Vertical Card Navigation**:
   - Replace horizontal nav with large vertical cards
   - Artwork/background areas on cards
   - Vertical text labels (rotated 90°)
   - Japanese accent text

2. **Page Renaming**:
   - "Status" → "Awakening" (fits Solo Leveling theme)
   - Keep: Quests, Habits, Gates

3. **Atmospheric Header**:
   - Mountain/aurora landscape gradient
   - Animated glow effects
   - Dramatic sky background

4. **Enhanced Typography**:
   - More Cinzel usage for headings
   - Japanese character accents
   - Glowing text effects

### Phase 5: Player Profile Enhancements
**Goal**: Upgrade Status/Awakening page

**Features to Add**:
1. **Title System**:
   - Unlock titles based on achievements
   - Display under player name
   - Multiple titles to collect
   - "The Weakest Hunter", "Shadow Monarch", etc.

2. **Enhanced Rank Display**:
   - Star ratings within ranks (e.g., C★★★)
   - Visual rank badges/emblems
   - Rank progression animation

3. **System Sidebar Widget**:
   - Current streak status
   - Active boosts/buffs
   - Warning messages
   - Today's remaining quests preview

## User Preferences & Patterns

1. **Chat-Based Quest Creation**: User prefers natural language input over manual form fields
2. **Automatic System**: Wants AI to handle complexity, user just describes intent
3. **Accuracy First**: Quest stat assignment must be accurate (recent focus)
4. **Solo Leveling Authentic**: Design should feel like the actual manhwa/anime
5. **Free & Open**: Avoid paid services for core features

## Known Issues & Technical Debt

1. **No Backend**: Everything is localStorage - consider Lovable Cloud for multiplayer/cloud sync in future
2. **Habits/Gates Placeholders**: Need full implementation (see Phase 1 & 2)
3. **No Credits System**: Mentioned in inspiration but not implemented yet
4. **No Achievements**: Could be added to Status page
5. **Navigation**: Current horizontal nav doesn't match inspiration's vertical card design

## How to Continue Development

### Starting Point Recommendations
1. **Begin with Phase 1 (Habits System)** - it's a placeholder with high impact potential
2. Reference inspiration screenshots for visual design decisions
3. Maintain the existing design system architecture
4. Test quest AI accuracy after any changes to `questAI.ts`
5. Update CHANGELOG.md after every change

### Code Organization Best Practices
- Keep components focused and single-purpose
- Extract reusable UI into separate components
- Store complex logic in `/lib` utilities
- Use custom hooks for stateful logic
- Maintain localStorage schema compatibility

### Design System Guidelines
- Define new colors in `index.css` as HSL CSS variables
- Add color mappings to `tailwind.config.ts`
- Never use direct color values in components
- Create component variants for special cases
- Use Cinzel for headings, Rajdhani for body text

## File Structure Reference

```
src/
├── components/
│   ├── ui/              # Shadcn components
│   ├── Navigation.tsx   # Main nav bar
│   ├── NavLink.tsx      # Nav link component
│   └── StatsRadar.tsx   # Radar chart
├── hooks/
│   ├── usePlayerStats.ts # Player state management
│   └── use-toast.ts     # Toast notifications
├── lib/
│   ├── storage.ts       # localStorage utilities
│   ├── questAI.ts       # AI quest analysis
│   └── utils.ts         # Helper functions
├── pages/
│   ├── Status.tsx       # Player dashboard
│   ├── Quests.tsx       # Daily quests
│   ├── Habits.tsx       # Habits (placeholder)
│   ├── Gates.tsx        # Gates (placeholder)
│   └── NotFound.tsx     # 404 page
├── index.css            # Design system + Tailwind
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Version History

See `CHANGELOG.md` for detailed version history. Key milestones:
- **v1.0.0**: Initial release with Cinzel font, streak system, automatic quest generation
- **v1.1.0**: AI-powered quest analysis using Hugging Face Transformers
- **v1.1.1**: Fixed quest AI defaulting to "sense" for everything
- **v1.1.2**: Corrected quest rewards to use refined stat selection
- **v1.2.0**: Complete Habits System implementation
- **v1.3.0**: Automatic habit win/loss detection with 80% threshold
- **v1.8.0**: Pokemon-style card frame system with animations
- **v1.9.0**: Anime-style card edges, thematic elements, 4K sharing with animations
- **v1.10.0**: Immersive 3D card borders with thick textured effects wrapping entire cards

## Next Session Action Items

When resuming this project in a new chat:

1. **Review inspiration screenshots** (9 images provided by user)
2. **Choose starting phase** (recommend Phase 2: Gates System - Habits now complete!)
3. **Plan implementation** for chosen phase in detail
4. **Maintain design consistency** with existing aesthetic
5. **Update CHANGELOG.md** after every change
6. **Test thoroughly** especially AI and auto-detection features

---

**Last Updated**: 2025-11-29  
**Current Version**: 1.10.0  
**Status**: Active Development - Immersive 3D card border effects complete
