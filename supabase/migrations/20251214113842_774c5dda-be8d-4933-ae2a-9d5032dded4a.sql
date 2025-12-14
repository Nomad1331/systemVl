-- Clear all user-related data (order matters due to foreign keys)
-- First, clear tables that reference other tables
DELETE FROM public.guild_challenge_contributions;
DELETE FROM public.guild_challenges;
DELETE FROM public.guild_messages;
DELETE FROM public.guild_invites;
DELETE FROM public.guild_members;
DELETE FROM public.guilds;
DELETE FROM public.streak_duels;
DELETE FROM public.friendships;
DELETE FROM public.player_stats;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;
-- Keep: redemption_codes, supporters, custom_frames (these are system/admin data)