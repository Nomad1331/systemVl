import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GuildChallenge {
  id: string;
  guild_id: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  reward_xp: number;
  reward_gold: number;
  starts_at: string;
  ends_at: string;
  is_completed: boolean;
  created_at: string;
}

export interface ChallengeContribution {
  id: string;
  challenge_id: string;
  user_id: string;
  contribution: number;
  hunter_name?: string;
}

export const useGuildChallenges = (guildId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<GuildChallenge[]>([]);
  const [contributions, setContributions] = useState<Record<string, ChallengeContribution[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!guildId) {
      setChallenges([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('guild_challenges')
        .select('*')
        .eq('guild_id', guildId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setChallenges((data || []) as GuildChallenge[]);

      // Fetch contributions for active challenges
      const activeIds = (data || []).filter(c => !c.is_completed).map(c => c.id);
      if (activeIds.length > 0) {
        const contribMap: Record<string, ChallengeContribution[]> = {};
        
        for (const challengeId of activeIds) {
          const { data: contribs } = await supabase
            .from('guild_challenge_contributions')
            .select('*')
            .eq('challenge_id', challengeId);

          const withNames = await Promise.all(
            (contribs || []).map(async (c) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('hunter_name')
                .eq('user_id', c.user_id)
                .maybeSingle();

              return {
                ...c,
                hunter_name: profile?.hunter_name || 'Unknown',
              } as ChallengeContribution;
            })
          );

          contribMap[challengeId] = withNames;
        }

        setContributions(contribMap);
      }
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
    }
  }, [guildId]);

  const createChallenge = async (
    title: string,
    description: string,
    targetValue: number,
    rewardXp: number,
    rewardGold: number,
    durationDays: number = 7
  ) => {
    if (!user || !guildId) return false;

    try {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + durationDays);

      const { error } = await supabase
        .from('guild_challenges')
        .insert({
          guild_id: guildId,
          title,
          description,
          target_value: targetValue,
          reward_xp: rewardXp,
          reward_gold: rewardGold,
          ends_at: endsAt.toISOString(),
        });

      if (error) throw error;

      toast({ title: "Challenge Created!", description: "Rally your guild to complete it!" });
      await fetchChallenges();
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
      return false;
    }
  };

  const contribute = async (challengeId: string, amount: number) => {
    if (!user) return false;

    try {
      // Upsert contribution
      const { data: existing } = await supabase
        .from('guild_challenge_contributions')
        .select('id, contribution')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('guild_challenge_contributions')
          .update({ contribution: existing.contribution + amount })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('guild_challenge_contributions')
          .insert({
            challenge_id: challengeId,
            user_id: user.id,
            contribution: amount,
          });

        if (error) throw error;
      }

      // Update challenge current_value
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        const newValue = challenge.current_value + amount;
        const isCompleted = newValue >= challenge.target_value;

        await supabase
          .from('guild_challenges')
          .update({ 
            current_value: newValue,
            is_completed: isCompleted,
          })
          .eq('id', challengeId);

        if (isCompleted) {
          toast({ title: "Challenge Complete!", description: "Your guild has earned the rewards!" });
        } else {
          toast({ title: "Contribution Added!", description: `+${amount} progress` });
        }
      }

      await fetchChallenges();
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
      return false;
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchChallenges().finally(() => setLoading(false));
  }, [fetchChallenges]);

  return {
    challenges,
    contributions,
    loading,
    createChallenge,
    contribute,
    refetch: fetchChallenges,
  };
};
