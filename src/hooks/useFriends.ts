import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Friend {
  id: string;
  friend_id: string;
  hunter_name: string;
  avatar: string;
  title: string;
  level: number;
  power: number;
  rank: string;
  is_public: boolean;
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_avatar: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
}

export interface StreakDuel {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenger_name: string;
  challenged_name: string;
  challenger_streak: number; // Used to store duel mode: 0=system, 1=competitive, 2=custom
  challenged_streak: number; // Used to store: 0=growing pool, 1=fixed pool
  status: string;
  starts_at: string;
  ends_at: string;
  winner_id: string | null;
  reward_pool: number;
  last_pool_update: string | null;
  duel_mode?: 'system' | 'competitive' | 'custom';
}

export type DuelMode = 'system' | 'competitive' | 'custom';

export interface CustomDuelSettings {
  xpPool: number;
  isFixed: boolean; // true = fixed pool, false = grows daily
  isCompetitive: boolean; // true = loser loses XP, false = only winner gains
}

export const useFriends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [streakDuels, setStreakDuels] = useState<StreakDuel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    try {
      // Get accepted friendships where user is requester or addressee
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      const friendIds = (friendships || []).map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      // Fetch friend profiles
      const friendsData = await Promise.all(
        friendIds.map(async (friendId) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', friendId)
            .maybeSingle();

          const { data: stats } = await supabase
            .from('player_stats')
            .select('level, strength, agility, intelligence, vitality, sense, rank')
            .eq('user_id', friendId)
            .maybeSingle();

          const power = stats 
            ? stats.strength + stats.agility + stats.intelligence + stats.vitality + stats.sense
            : 0;

          const friendship = friendships?.find(f => 
            f.requester_id === friendId || f.addressee_id === friendId
          );

          return {
            id: friendship?.id || '',
            friend_id: friendId,
            hunter_name: profile?.hunter_name || 'Unknown',
            avatar: profile?.avatar || 'default',
            title: profile?.title || 'Hunter',
            level: stats?.level || 1,
            power,
            rank: stats?.rank || 'E-Rank',
            is_public: profile?.is_public ?? true,
          } as Friend;
        })
      );

      setFriends(friendsData);
    } catch (error: any) {
      console.error('Error fetching friends:', error);
    }
  }, [user]);

  const fetchFriendRequests = useCallback(async () => {
    if (!user) return;

    try {
      // Incoming requests
      const { data: incoming, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      const requestsWithNames = await Promise.all(
        (incoming || []).map(async (req) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('hunter_name, avatar')
            .eq('user_id', req.requester_id)
            .maybeSingle();

          return {
            id: req.id,
            requester_id: req.requester_id,
            requester_name: profile?.hunter_name || 'Unknown',
            requester_avatar: profile?.avatar || 'default',
            status: req.status,
            created_at: req.created_at,
          } as FriendRequest;
        })
      );

      setFriendRequests(requestsWithNames);

      // Sent requests (to track who we've already sent to)
      const { data: sent } = await supabase
        .from('friendships')
        .select('addressee_id')
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      setSentRequests((sent || []).map(s => s.addressee_id));
    } catch (error: any) {
      console.error('Error fetching friend requests:', error);
    }
  }, [user]);

  const fetchStreakDuels = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('streak_duels')
        .select('*')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const duelsWithNames = await Promise.all(
        (data || []).map(async (duel) => {
          const { data: challenger } = await supabase
            .from('profiles')
            .select('hunter_name')
            .eq('user_id', duel.challenger_id)
            .maybeSingle();

          const { data: challenged } = await supabase
            .from('profiles')
            .select('hunter_name')
            .eq('user_id', duel.challenged_id)
            .maybeSingle();

          return {
            ...duel,
            challenger_name: challenger?.hunter_name || 'Unknown',
            challenged_name: challenged?.hunter_name || 'Unknown',
          } as StreakDuel;
        })
      );

      setStreakDuels(duelsWithNames);
    } catch (error: any) {
      console.error('Error fetching streak duels:', error);
    }
  }, [user]);

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return false;

    try {
      // Check if already friends or request pending
      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'accepted') {
          toast({ title: "Already Friends", description: "You're already friends with this hunter!" });
        } else if (existing.status === 'pending') {
          toast({ title: "Request Pending", description: "A friend request is already pending." });
        }
        return false;
      }

      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUserId,
          status: 'pending',
        });

      if (error) throw error;

      toast({ title: "Request Sent!", description: "Friend request sent successfully." });
      await fetchFriendRequests();
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast({ title: "Friend Added!", description: "You're now friends!" });
      await Promise.all([fetchFriends(), fetchFriendRequests()]);
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
      return false;
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast({ title: "Request Declined" });
      await fetchFriendRequests();
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
      return false;
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({ title: "Friend Removed" });
      await fetchFriends();
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
      return false;
    }
  };

  const challengeToStreakDuel = async (friendId: string, duelMode: DuelMode = 'system', customSettings?: CustomDuelSettings) => {
    if (!user) return false;

    try {
      // Check for existing active duel
      const { data: existing } = await supabase
        .from('streak_duels')
        .select('id')
        .or(`and(challenger_id.eq.${user.id},challenged_id.eq.${friendId}),and(challenger_id.eq.${friendId},challenged_id.eq.${user.id})`)
        .in('status', ['pending', 'active'])
        .maybeSingle();

      if (existing) {
        toast({ title: "Duel Exists", description: "You already have an active duel with this hunter!" });
        return false;
      }

      // Store duel mode and settings:
      // reward_pool: stores initial XP pool (or mode indicator for non-custom)
      // For pending duels: 0=system, 1=competitive, >1=custom with that pool amount
      // challenger_streak: 0=system, 1=competitive, 2=custom
      // challenged_streak: 0=growing pool, 1=fixed pool
      
      let initialPool: number;
      let modeIndicator: number;
      let poolTypeIndicator: number;
      
      if (duelMode === 'custom' && customSettings) {
        initialPool = customSettings.xpPool;
        modeIndicator = customSettings.isCompetitive ? 2 : 2; // 2 = custom mode
        poolTypeIndicator = customSettings.isFixed ? 1 : 0;
      } else if (duelMode === 'competitive') {
        initialPool = 1; // Will be set to 10 when accepted
        modeIndicator = 1;
        poolTypeIndicator = 0;
      } else {
        initialPool = 0; // Will be set to 10 when accepted
        modeIndicator = 0;
        poolTypeIndicator = 0;
      }

      const { error } = await supabase
        .from('streak_duels')
        .insert({
          challenger_id: user.id,
          challenged_id: friendId,
          status: 'pending',
          reward_pool: initialPool,
          challenger_streak: modeIndicator,
          challenged_streak: poolTypeIndicator,
        });

      if (error) throw error;

      const modeDesc = duelMode === 'custom' 
        ? `Custom (${customSettings?.xpPool} XP, ${customSettings?.isFixed ? 'fixed' : 'growing'}, ${customSettings?.isCompetitive ? 'competitive' : 'normal'})` 
        : duelMode === 'competitive' ? 'Competitive' : 'System Reward';
      
      toast({ 
        title: "Challenge Sent!", 
        description: `Streak duel challenge sent (${modeDesc} mode)!` 
      });
      await fetchStreakDuels();
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
      return false;
    }
  };

  const respondToStreakDuel = async (duelId: string, accept: boolean) => {
    if (!user) return false;

    try {
      // Get the duel to check the mode
      const duel = streakDuels.find(d => d.id === duelId);
      if (!duel) return false;
      
      const modeIndicator = duel.challenger_streak; // 0=system, 1=competitive, 2=custom
      const isCustom = modeIndicator === 2 || duel.reward_pool > 1;
      const isCompetitive = modeIndicator === 1 || (isCustom && duel.challenged_streak === 1);
      const isFixedPool = duel.challenged_streak === 1;
      
      const startDate = new Date();
      
      // For custom mode, keep the reward_pool as set. For others, start at 10
      const startingPool = isCustom ? duel.reward_pool : 10;
      
      const { error } = await supabase
        .from('streak_duels')
        .update({ 
          status: accept ? 'active' : 'declined',
          starts_at: accept ? startDate.toISOString() : undefined,
          ends_at: undefined, // No end date - duel continues until someone breaks streak
          reward_pool: accept ? startingPool : 0,
          last_pool_update: accept ? startDate.toISOString().split('T')[0] : undefined,
          // Preserve mode indicators
          challenger_streak: accept ? modeIndicator : 0,
          challenged_streak: accept ? duel.challenged_streak : 0,
        })
        .eq('id', duelId);

      if (error) throw error;

      let modeDescription = "";
      if (isCustom) {
        modeDescription = `Custom mode: ${startingPool} XP pool${isFixedPool ? ' (fixed)' : ' (+3 daily)'}, ${isCompetitive ? 'loser loses XP!' : 'no penalty for loser.'}`;
      } else if (isCompetitive) {
        modeDescription = "Competitive mode: Winner takes XP from loser!";
      } else {
        modeDescription = "System mode: Winner gets reward, no penalty for loser.";
      }

      toast({ 
        title: accept ? "Duel Accepted!" : "Duel Declined",
        description: accept ? modeDescription : "Duel has been declined."
      });
      await fetchStreakDuels();
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
      return false;
    }
  };

  // Report streak break - loser reports, winner gets XP
  const reportStreakBreak = async (duelId: string, isAutomatic: boolean = false) => {
    if (!user) return false;

    try {
      const duel = streakDuels.find(d => d.id === duelId);
      if (!duel || duel.status !== 'active') {
        toast({ variant: "destructive", title: "Error", description: "Duel not found or not active." });
        return false;
      }

      // Calculate days since start and update reward pool
      const startDate = new Date(duel.starts_at);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check mode settings
      const modeIndicator = duel.challenger_streak; // 0=system, 1=competitive, 2=custom
      const isCustom = modeIndicator === 2;
      // For competitive: modeIndicator=1 OR (custom mode with challenged_streak=1 meaning competitive penalty)
      const isCompetitive = modeIndicator === 1 || (isCustom && duel.challenged_streak === 1);
      const isFixedPool = duel.challenged_streak === 1;
      
      // Calculate final reward pool
      let finalRewardPool: number;
      if (isCustom && isFixedPool) {
        finalRewardPool = duel.reward_pool; // Fixed pool stays the same
      } else if (isCustom) {
        finalRewardPool = duel.reward_pool + (daysDiff * 3); // Custom starting pool + growth
      } else {
        finalRewardPool = 10 + (daysDiff * 3); // Default: 10 + 3 per day
      }

      // The person reporting is the loser, the other is the winner
      const loserId = user.id;
      const winnerId = user.id === duel.challenger_id ? duel.challenged_id : duel.challenger_id;

      const { error: updateError } = await supabase
        .from('streak_duels')
        .update({
          status: 'completed',
          winner_id: winnerId,
          reward_pool: finalRewardPool,
        })
        .eq('id', duelId);

      if (updateError) throw updateError;

      // Award XP to winner
      const { error: xpError } = await supabase.rpc('add_player_xp', {
        _user_id: winnerId,
        _xp_amount: finalRewardPool,
      });

      if (xpError) console.error('Failed to award XP:', xpError);

      // In competitive mode, deduct FULL XP from loser (same as winner gains)
      if (isCompetitive) {
        const { error: loserXpError } = await supabase.rpc('add_player_xp', {
          _user_id: loserId,
          _xp_amount: -finalRewardPool, // Loser loses the same amount winner gains
        });
        
        if (loserXpError) console.error('Failed to deduct XP:', loserXpError);
        
        toast({ 
          title: isAutomatic ? "Streak Broken - Auto Loss!" : "Streak Broken!", 
          description: `Competitive mode: You lost ${finalRewardPool} XP. Opponent wins ${finalRewardPool} XP!`
        });
      } else {
        toast({ 
          title: isAutomatic ? "Streak Broken - Auto Loss!" : "Streak Broken!", 
          description: `Your opponent wins ${finalRewardPool} XP! No penalty for you.`
        });
      }
      
      await fetchStreakDuels();
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
      return false;
    }
  };

  // Check for automatic streak break losses
  const checkAutoStreakLoss = async () => {
    if (!user) return;
    
    const streakData = JSON.parse(localStorage.getItem("soloLevelingStreak") || '{}');
    const lastCompletion = streakData.lastCompletionDate;
    
    if (!lastCompletion) return;
    
    const lastDate = new Date(lastCompletion);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If more than 1 day since last completion, streak is broken
    if (daysDiff > 1) {
      // Find active duels where user is participating
      const activeDuels = streakDuels.filter(d => 
        d.status === 'active' && 
        (d.challenger_id === user.id || d.challenged_id === user.id)
      );
      
      for (const duel of activeDuels) {
        // Auto-report streak break
        await reportStreakBreak(duel.id, true);
      }
    }
  };

  // Check for auto loss on mount and when streak duels change
  useEffect(() => {
    if (user && streakDuels.length > 0) {
      checkAutoStreakLoss();
    }
  }, [user, streakDuels.length]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchFriends(), fetchFriendRequests(), fetchStreakDuels()])
        .finally(() => setLoading(false));
    }
  }, [user, fetchFriends, fetchFriendRequests, fetchStreakDuels]);

  return {
    friends,
    friendRequests,
    sentRequests,
    streakDuels,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    challengeToStreakDuel,
    respondToStreakDuel,
    reportStreakBreak,
    refetch: () => Promise.all([fetchFriends(), fetchFriendRequests(), fetchStreakDuels()]),
  };
};
