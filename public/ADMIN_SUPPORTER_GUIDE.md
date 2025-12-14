# 🗡️ Supporter Management Guide
## Quick Reference for Handling New Supporters

---

## 📥 When You Receive a New Supporter

### Step 1: Wait for Their Message
After someone joins a tier on Ko-Fi, they'll send you a message with their preferred **Hunter Name**.

---

## 📊 Step 2: Add Supporter to Supabase

1. **Open Supabase Dashboard** → Go to Table Editor → Select `supporters` table
2. **Click "Insert row"** and fill in:

| Field | What to Enter |
|-------|---------------|
| `hunter_name` | Their preferred Hunter Name (from their message) |
| `tier` | Select: `e_rank`, `d_rank`, `c_rank`, `b_rank`, `a_rank`, or `s_rank` |
| `ko_fi_username` | Their Ko-Fi username (optional) |
| `discord_username` | Their Discord (optional, for DM) |
| `custom_title` | Only for A-Rank+ (e.g., "Shadow Monarch") |
| `custom_frame_id` | Only for S-Rank with custom frame |
| `is_visible` | `true` (shows them in Hall of Hunters) |
| `display_order` | `0` (or higher number = shows first) |

3. **Click Save** - Copy the generated `id` (UUID)

---

## 🔑 Step 3: Create Redemption Code

1. **Go to Table Editor** → Select `redemption_codes` table
2. **Click "Insert row"** and fill in:

| Field | What to Enter |
|-------|---------------|
| `code` | Create unique code (e.g., `HUNTER-ABC123` or `ERANK-JOHNDOE`) |
| `supporter_id` | Paste the UUID from Step 2 |
| `tier` | Same tier as the supporter |
| `unlocks_badge` | `true` |
| `unlocks_frame` | Frame ID (for B-Rank+) or leave `null` |
| `unlocks_title` | Custom title (for A-Rank+) or leave `null` |
| `max_uses` | `1` (one-time use) |
| `current_uses` | `0` |
| `is_active` | `true` |
| `expires_at` | Leave `null` (never expires) |

3. **Click Save**

---

## 💬 Step 4: Send the Code

**Template message to send via Ko-Fi/Discord:**

```
🎉 Welcome to the Hunt, [Hunter Name]!

Your [X]-Rank benefits are ready! Here's your exclusive code:

🔑 CODE: [YOUR-CODE-HERE]

To activate:
1. Open the app
2. Go to Hall of Hunters
3. Click "Redeem Code"
4. Enter your code

Thank you for supporting! ⚔️
```

---

## 📋 Tier Benefits Quick Reference

| Tier | Price | Badge | Hall Listing | Frame | Custom Title | Custom Frame |
|------|-------|-------|--------------|-------|--------------|--------------|
| E-Rank | $2 | ✓ | ✓ | ✗ | ✗ | ✗ |
| D-Rank | $5 | ✓ | ✓ | ✗ | ✗ | ✗ |
| C-Rank | $7 | ✓ | ✓ | ✗ | ✗ | ✗ |
| B-Rank | $10 | ✓ | ✓ | ✓ | ✗ | ✗ |
| A-Rank | $15 | ✓ | ✓ | ✓ | ✓ | ✗ |
| S-Rank | $20-25 | ✓ | ✓ | ✓ | ✓ | ✓ (commissioned) |

---

## 🎨 EXCLUSIVE Supporter Frame IDs

These frames are ONLY available to supporters (not purchasable with credits):

| Frame ID | Name | Minimum Tier |
|----------|------|--------------|
| `guild-master-frame` | Guild Master's Crest | B-Rank |
| `national-hunter-frame` | National Level Hunter | B-Rank |
| `sovereign-frame` | Sovereign's Authority | A-Rank |
| `monarch-frame` | Shadow Monarch's Throne | S-Rank |

**Usage in `unlocks_frame` field:**
- B-Rank supporters: Choose `guild-master-frame` or `national-hunter-frame`
- A-Rank supporters: Can use any of the above + `sovereign-frame`
- S-Rank supporters: Can use any frame + `monarch-frame` OR get a custom commissioned frame

---

## 🆘 Troubleshooting

**Code not working?**
- Check `is_active` is `true`
- Check `current_uses` < `max_uses`
- Check `expires_at` is null or in future

**Supporter not showing in Hall?**
- Check `is_visible` is `true` in supporters table

**Need to revoke access?**
- Set `is_active` to `false` on their redemption code

---

## 📱 Quick Links

- Supabase Table Editor: https://supabase.com/dashboard/project/gdkpmyznxfthobxpyryx/editor
- Ko-Fi Messages: https://ko-fi.com/manage/messages
