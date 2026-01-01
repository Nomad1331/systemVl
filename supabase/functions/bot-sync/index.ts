import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bot-secret',
};

// Bot secret for authentication (set this in Supabase Edge Function secrets)
const BOT_SECRET = Deno.env.get('BOT_SYNC_SECRET');

interface BotSyncRequest {
  discord_id: string;
  action: 'add_xp' | 'sync_stats' | 'get_stats' | 'link_class' | 'verify_link';
  data?: {
    xp?: number;
    source?: string;
    class_id?: string;
    stats?: {
      strength?: number;
      agility?: number;
      intelligence?: number;
      vitality?: number;
      sense?: number;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify bot authentication
    const botSecret = req.headers.get('x-bot-secret');
    if (!BOT_SECRET || botSecret !== BOT_SECRET) {
      console.error('Invalid or missing bot secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid bot secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: BotSyncRequest = await req.json();
    const { discord_id, action, data } = body;

    console.log(`Bot sync request: action=${action}, discord_id=${discord_id}`);

    if (!discord_id) {
      return new Response(
        JSON.stringify({ error: 'Missing discord_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find user by Discord ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, hunter_name, avatar, title')
      .eq('discord_id', discord_id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Database error fetching profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle verify_link action (doesn't require existing link)
    if (action === 'verify_link') {
      return new Response(
        JSON.stringify({ 
          linked: !!profile,
          hunter_name: profile?.hunter_name || null 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ 
          error: 'User not linked',
          message: 'This Discord account is not linked to a web app account. Please log in to the web app with Discord to link your accounts.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get player stats
    const { data: playerStats, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', profile.user_id)
      .single();

    if (statsError || !playerStats) {
      console.error('Error fetching player stats:', statsError);
      return new Response(
        JSON.stringify({ error: 'Player stats not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: Record<string, unknown> = {};

    switch (action) {
      case 'get_stats': {
        // Return current stats
        result = {
          success: true,
          profile: {
            hunter_name: profile.hunter_name,
            avatar: profile.avatar,
            title: profile.title,
          },
          stats: {
            level: playerStats.level,
            total_xp: playerStats.total_xp,
            weekly_xp: playerStats.weekly_xp,
            rank: playerStats.rank,
            strength: playerStats.strength,
            agility: playerStats.agility,
            intelligence: playerStats.intelligence,
            vitality: playerStats.vitality,
            sense: playerStats.sense,
            gold: playerStats.gold,
            gems: playerStats.gems,
            credits: playerStats.credits,
            unlocked_classes: playerStats.unlocked_classes,
          }
        };
        break;
      }

      case 'add_xp': {
        const xpAmount = data?.xp || 0;
        const source = data?.source || 'discord_bot';

        if (xpAmount <= 0) {
          return new Response(
            JSON.stringify({ error: 'XP amount must be positive' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Rate limit: max 1000 XP per call
        const cappedXP = Math.min(xpAmount, 1000);

        // Calculate new level
        const newTotalXP = playerStats.total_xp + cappedXP;
        const newWeeklyXP = playerStats.weekly_xp + cappedXP;
        
        // Level calculation: XP needed for level L = L * 100
        // Total XP for level L = 100 * (L-1) * L / 2
        let newLevel = playerStats.level;
        while (100 * newLevel * (newLevel + 1) / 2 <= newTotalXP) {
          newLevel += 1;
        }

        // Determine rank
        let newRank = 'E-Rank';
        if (newLevel >= 100) newRank = 'S-Rank';
        else if (newLevel >= 75) newRank = 'A-Rank';
        else if (newLevel >= 50) newRank = 'B-Rank';
        else if (newLevel >= 25) newRank = 'C-Rank';
        else if (newLevel >= 6) newRank = 'D-Rank';

        const levelsGained = newLevel - playerStats.level;
        const abilityPointsGained = levelsGained * 5;

        // Update stats
        const { error: updateError } = await supabase
          .from('player_stats')
          .update({
            total_xp: newTotalXP,
            weekly_xp: newWeeklyXP,
            level: newLevel,
            rank: newRank,
            available_points: playerStats.available_points + abilityPointsGained,
          })
          .eq('user_id', profile.user_id);

        if (updateError) {
          console.error('Error updating stats:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update stats' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Added ${cappedXP} XP to ${profile.hunter_name} (${discord_id}). Level: ${playerStats.level} -> ${newLevel}`);

        result = {
          success: true,
          xp_added: cappedXP,
          source,
          old_level: playerStats.level,
          new_level: newLevel,
          old_rank: playerStats.rank,
          new_rank: newRank,
          levels_gained: levelsGained,
          ability_points_gained: abilityPointsGained,
          total_xp: newTotalXP,
          weekly_xp: newWeeklyXP,
        };
        break;
      }

      case 'link_class': {
        const classId = data?.class_id;
        if (!classId) {
          return new Response(
            JSON.stringify({ error: 'Missing class_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const currentClasses = playerStats.unlocked_classes || [];
        if (currentClasses.includes(classId)) {
          result = {
            success: true,
            message: 'Class already unlocked',
            unlocked_classes: currentClasses,
          };
        } else {
          const newClasses = [...currentClasses, classId];
          
          const { error: updateError } = await supabase
            .from('player_stats')
            .update({ unlocked_classes: newClasses })
            .eq('user_id', profile.user_id);

          if (updateError) {
            console.error('Error updating classes:', updateError);
            return new Response(
              JSON.stringify({ error: 'Failed to update classes' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log(`Unlocked class ${classId} for ${profile.hunter_name}`);

          result = {
            success: true,
            message: `Class ${classId} unlocked`,
            unlocked_classes: newClasses,
          };
        }
        break;
      }

      case 'sync_stats': {
        // Sync specific stats from Discord bot
        const statsUpdate = data?.stats || {};
        const updateFields: Record<string, number> = {};

        if (statsUpdate.strength !== undefined) {
          updateFields.strength = Math.max(10, statsUpdate.strength);
        }
        if (statsUpdate.agility !== undefined) {
          updateFields.agility = Math.max(10, statsUpdate.agility);
        }
        if (statsUpdate.intelligence !== undefined) {
          updateFields.intelligence = Math.max(10, statsUpdate.intelligence);
        }
        if (statsUpdate.vitality !== undefined) {
          updateFields.vitality = Math.max(10, statsUpdate.vitality);
        }
        if (statsUpdate.sense !== undefined) {
          updateFields.sense = Math.max(10, statsUpdate.sense);
        }

        if (Object.keys(updateFields).length === 0) {
          return new Response(
            JSON.stringify({ error: 'No stats to update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: updateError } = await supabase
          .from('player_stats')
          .update(updateFields)
          .eq('user_id', profile.user_id);

        if (updateError) {
          console.error('Error syncing stats:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to sync stats' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Synced stats for ${profile.hunter_name}:`, updateFields);

        result = {
          success: true,
          updated_stats: updateFields,
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Bot sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
