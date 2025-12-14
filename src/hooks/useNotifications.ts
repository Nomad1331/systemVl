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

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
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

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    notificationCount: notifications.length,
    loading,
    refresh: fetchNotifications,
  };
};
