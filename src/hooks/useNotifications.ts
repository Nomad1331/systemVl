import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'guild_invite' | 'friend_request' | 'duel_challenge';
  title: string;
  description: string;
  data: any;
  created_at: string;
}

export interface NotificationCounts {
  guilds: number;
  friends: number;
  total: number;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({ guilds: 0, friends: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setCounts({ guilds: 0, friends: 0, total: 0 });
      setLoading(false);
      return;
    }

    try {
      const allNotifications: Notification[] = [];

      // Fetch pending guild invites
      const { data: guildInvites } = await supabase
        .from('guild_invites')
        .select('*')
        .eq('invitee_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (guildInvites) {
        for (const invite of guildInvites) {
          const { data: guild } = await supabase
            .from('guilds')
            .select('name')
            .eq('id', invite.guild_id)
            .maybeSingle();

          const { data: inviter } = await supabase
            .from('profiles')
            .select('hunter_name')
            .eq('user_id', invite.inviter_id)
            .maybeSingle();

          allNotifications.push({
            id: `guild_invite_${invite.id}`,
            type: 'guild_invite',
            title: 'Guild Invite',
            description: `${inviter?.hunter_name || 'Someone'} invited you to join ${guild?.name || 'a guild'}`,
            data: { inviteId: invite.id, guildId: invite.guild_id, guildName: guild?.name },
            created_at: invite.created_at,
          });
        }
      }

      // Fetch pending friend requests
      const { data: friendRequests } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (friendRequests) {
        for (const request of friendRequests) {
          const { data: requester } = await supabase
            .from('profiles')
            .select('hunter_name')
            .eq('user_id', request.requester_id)
            .maybeSingle();

          allNotifications.push({
            id: `friend_request_${request.id}`,
            type: 'friend_request',
            title: 'Friend Request',
            description: `${requester?.hunter_name || 'Someone'} wants to be your friend`,
            data: { requestId: request.id, requesterId: request.requester_id },
            created_at: request.created_at,
          });
        }
      }

      // Fetch pending duel challenges
      const { data: duelChallenges } = await supabase
        .from('streak_duels')
        .select('*')
        .eq('challenged_id', user.id)
        .eq('status', 'pending');

      if (duelChallenges) {
        for (const duel of duelChallenges) {
          const { data: challenger } = await supabase
            .from('profiles')
            .select('hunter_name')
            .eq('user_id', duel.challenger_id)
            .maybeSingle();

          allNotifications.push({
            id: `duel_challenge_${duel.id}`,
            type: 'duel_challenge',
            title: 'Duel Challenge',
            description: `${challenger?.hunter_name || 'Someone'} challenged you to a streak duel`,
            data: { duelId: duel.id, challengerId: duel.challenger_id },
            created_at: duel.created_at,
          });
        }
      }

      // Sort by created_at descending
      allNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Calculate counts by page
      const guildCount = allNotifications.filter(n => n.type === 'guild_invite').length;
      const friendCount = allNotifications.filter(n => n.type === 'friend_request' || n.type === 'duel_challenge').length;

      setCounts({
        guilds: guildCount,
        friends: friendCount,
        total: allNotifications.length,
      });

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscriptions
    if (!user) return;

    // Subscribe to guild_invites changes
    const guildInvitesChannel = supabase
      .channel('guild-invites-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guild_invites',
          filter: `invitee_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    // Subscribe to friendships changes
    const friendshipsChannel = supabase
      .channel('friendships-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    // Subscribe to streak_duels changes
    const duelsChannel = supabase
      .channel('duels-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streak_duels',
          filter: `challenged_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(guildInvitesChannel);
      supabase.removeChannel(friendshipsChannel);
      supabase.removeChannel(duelsChannel);
    };
  }, [fetchNotifications, user]);

  return {
    notifications,
    notificationCount: counts.total,
    counts,
    loading,
    refresh: fetchNotifications,
  };
};
