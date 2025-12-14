# Previous Chat History & Project Decisions

This document contains the full context of decisions made in previous chat sessions for the Solo Leveling Habit Tracker project. Use this as reference when continuing development in a new chat/account.

---

## Project Overview

**Solo Leveling Habit Tracker** - A gamified habit tracking app themed around the Solo Leveling anime/manhwa. Users track habits, complete quests, earn XP, level up, and unlock rewards.

---

## Monetization Strategy (Ko-Fi Integration)

### Decision: Ko-Fi Donation Tiers with Hunter Ranks

We implemented a non-intrusive monetization system using Ko-Fi donations that fits the Solo Leveling theme:

| Tier | Donation | Benefits |
|------|----------|----------|
| E-Rank | $2 | Token of appreciation |
| D-Rank | $3 | Supporter badge on profile |
| C-Rank | $5 | Badge + Hall of Hunters listing |
| B-Rank | $10 | Badge + Hall listing + exclusive frame choices |
| A-Rank | $15 | Badge + Hall listing + custom title + exclusive frame |
| S-Rank | $20-25 | All above + custom commissioned frame |

### Supporter Benefits System

Benefits unlocked via **redemption codes**:
- **Tier badges**: Displayed on PlayerProfileCard, colored by tier
- **Exclusive frames**: Special card frames only for supporters (not purchasable with credits)
- **Custom titles**: Override default player titles (A-Rank+)
- **Hall of Hunters listing**: Public recognition (C-Rank+)

### How It Works
1. User donates on Ko-Fi
2. Admin (you) manually DMs them their unique redemption code
3. User enters code in the app's "Redeem Code" modal
4. Benefits are stored locally and applied to their profile

---

## Supporter-Exclusive Frames (IMPORTANT!)

### Decision: Create NEW exclusive frames separate from credit shop frames

We had a conflict where frames listed as "B-Rank exclusive" were also purchasable in the credit shop. **Resolution**: Create completely new frames that are ONLY unlockable via redemption codes.

### Exclusive Frame Tiers (Correct as of latest session):

| Frame | Tier Required |
|-------|---------------|
| Guild Master's Crest | B-Rank |
| National Level Hunter | B-Rank |
| Sovereign's Authority | A-Rank |
| Shadow Monarch's Throne | S-Rank |

### Credit Shop Frames (Available to ALL users)

These frames are purchasable with in-game credits by anyone:
- Hunter's Standard (Common, free)
- Emerald Guardian (Rare, 150 credits)
- Storm Caller (Rare, 200 credits)
- Frozen Fortress (Epic, 300 credits)
- Inferno Blaze (Epic, 300 credits)
- Forest Warden (Epic, 350 credits)
- Shadow Monarch (Legendary, 500 credits)
- Blood Reaper (Legendary, 500 credits)
- Cosmic Voyager (Legendary, 600 credits)
- Celestial Divine (Mythic, 1000 credits)
- Demon Lord (Mythic, 1200 credits)

---

## Backend Architecture

### Decision: External Supabase (NOT Lovable Cloud)

We're using the user's personal Supabase instance to:
- Avoid vendor lock-in
- Prevent future migration issues
- Have full control over data

### Supabase Tables

1. **supporters** - Stores supporter information
   - `id`, `hunter_name`, `tier`, `discord_username`, `ko_fi_username`
   - `custom_title`, `custom_frame_id`, `is_visible`, `display_order`

2. **redemption_codes** - Stores codes for supporters to redeem
   - `id`, `code`, `tier`, `supporter_id`
   - `unlocks_badge`, `unlocks_frame`, `unlocks_title`
   - `max_uses`, `current_uses`, `expires_at`, `is_active`

3. **custom_frames** - For S-Rank custom commissioned frames
   - `id`, `name`, `supporter_id`, `image_url`, `rarity`
   - `is_supporter_exclusive`

### Code Redemption Flow
1. User enters code in modal
2. App queries Supabase to validate code
3. If valid: increments `current_uses`, stores benefits locally
4. Benefits persist in localStorage

---

## Hall of Hunters Page

**Route**: `/supporters`

Features:
- Displays all visible supporters grouped by tier
- Solo Leveling guild ranking board aesthetic
- Hunter Cards Gallery format
- Access from main navigation and Awakening page
- Includes "Become a Supporter" info and "Redeem Code" buttons

---

## S-Rank Custom Commissioned Frames

Special feature for highest-tier supporters ($20-25):
1. User becomes S-Rank supporter
2. They receive design ideas via Discord DM or email
3. Agent creates the custom frame image
4. Frame is added to codebase tagged with their name/username
5. They receive unique redemption code to unlock it

---

## Admin Guide Location

A comprehensive admin guide exists at: `public/ADMIN_SUPPORTER_GUIDE.md`

Contains:
- How to add supporters to database
- How to create redemption codes
- Frame IDs for each tier
- SQL examples for common operations

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/lib/cardFrames.ts` | All frame definitions (regular + exclusive) |
| `src/components/CardFrameShop.tsx` | Frame shop UI with exclusive section |
| `src/components/PlayerProfileCard.tsx` | Shows supporter badge/title |
| `src/components/CodeRedemptionModal.tsx` | Code entry modal |
| `src/hooks/useCodeRedemption.ts` | Code validation logic |
| `src/pages/Supporters.tsx` | Hall of Hunters page |
| `src/lib/storage.ts` | localStorage for benefits |
| `public/ADMIN_SUPPORTER_GUIDE.md` | Admin instructions |

---

## Frame Images Location

All frame images are stored in: `src/assets/frames/`

**Supporter Exclusive Frames (user-edited with transparent centers):**
- `monarch-frame.png` (S-Rank exclusive) - Purple/violet frame with ornate corners
- `sovereign-frame.png` (A-Rank exclusive) - Gold frame with crown and crimson gems
- `guild-master-frame.png` (B-Rank exclusive) - Golden ornate frame with shield emblems
- `national-hunter-frame.png` (B-Rank exclusive) - Blue frame with purple ribbons, star motif

**Regular Shop Frames:**
- Plus all regular frames (fire, ice, shadow, emerald, electric, cosmic, etc.)

**Important:** All supporter exclusive frames have transparent centers edited by the user to properly overlay on the stats card without obscuring content.

---

## Known Issues / Notes

1. **PayPal verification**: User mentioned PayPal account was newly created and taking 1-2 days to verify for Ko-Fi

2. **Frame image quality**: Some AI-generated frames needed refinement:
   - Guild Master: Corner studs were too wedged in (regenerated)
   - Sovereign: Looked too "barbie/feminine" (regenerated with darker theme)

---

## Remix Instructions

When remixing this project to a new account:

1. **Connect Supabase**: Use the same Supabase project credentials
2. **Reference this file**: Point new chat to `PREVIOUS_CHAT_HISTORY.md`
3. **Check admin guide**: Review `public/ADMIN_SUPPORTER_GUIDE.md`
4. **Verify frame tiers**: Ensure exclusive frames have correct tier requirements

---

## Recent Development Sessions (December 2024)

### Session: Analytics & Export Features

**Analytics Page** (`src/pages/Analytics.tsx`):
- Created new `/analytics` route accessible from sidebar
- Weekly/monthly progress reports with XP trends
- Comparison stats with previous period (% change indicators)
- Charts: XP trend (area chart), Daily activity (bar chart)
- All-time stats panel
- **Export functionality**:
  - Image export (PNG) using html2canvas
  - Text export with formatted ASCII report

**Habit Bug Fix** (`src/pages/Habits.tsx`):
- Fixed critical bug where completing one habit caused unrelated habits to auto-finalize as losses
- Issue: The old logic used `daysElapsed >= habit.goalDays` which triggered when ANY day count matched
- Fix: Now properly calculates end date as `startDate + goalDays - 1` and only finalizes when:
  1. User completed ALL required days (early win), OR
  2. The habit period has FULLY elapsed (past end date)

### Session: FAQ Corrections

**Necromancer FAQ Fix** (`src/pages/FAQ.tsx`):
- Corrected misinformation about "Necromancer Mode" being a weekly challenge
- Clarified that "Path of the Necromancer" is a 90-day legendary streak challenge
- Updated to show it UNLOCKS the Necromancer Class (not requires it)
- Fixed reward descriptions for Normal vs Hard mode

### Session: Monetization Implementation

**Ko-Fi Supporter System**:
- Implemented tiered supporter benefits (E-Rank through S-Rank)
- Created redemption code system for unlocking benefits
- Built Hall of Hunters page (`/supporters`) for public recognition
- Designed 4 exclusive supporter frames with transparent centers

---

## Ko-Fi Integration Details

### Supporter Tiers & Benefits

| Tier | Donation | Benefits |
|------|----------|----------|
| E-Rank | $2 | Token of appreciation |
| D-Rank | $3 | Supporter badge on profile |
| C-Rank | $5 | Badge + Hall of Hunters listing |
| B-Rank | $10 | Badge + Hall listing + exclusive frame choices |
| A-Rank | $15 | Badge + Hall listing + custom title + exclusive frame |
| S-Rank | $20-25 | All above + custom commissioned frame |

### Exclusive Frame IDs (for redemption codes)
- `guild-master` - B-Rank
- `national-hunter` - B-Rank  
- `sovereign` - A-Rank
- `monarch` - S-Rank

---

## Contact / Support

- Ko-Fi page: [To be set up by user]
- Discord: [User's Discord for supporter communication]

---

*Last updated: December 2024*
