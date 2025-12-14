import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useGuilds } from '@/hooks/useGuilds';
import { useFriends } from '@/hooks/useFriends';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bell, Castle, Users, Swords, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'guild_invite':
      return <Castle className="h-4 w-4 text-yellow-400" />;
    case 'friend_request':
      return <Users className="h-4 w-4 text-blue-400" />;
    case 'duel_challenge':
      return <Swords className="h-4 w-4 text-red-400" />;
  }
};

export const NotificationCenter = () => {
  const navigate = useNavigate();
  const { notifications, notificationCount, refresh } = useNotifications();
  const { acceptInvite, declineInvite } = useGuilds();
  const { acceptFriendRequest, declineFriendRequest, respondToStreakDuel } = useFriends();
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAccept = async (notification: Notification) => {
    setProcessing(notification.id);
    try {
      switch (notification.type) {
        case 'guild_invite':
          await acceptInvite(notification.data.inviteId, notification.data.guildId);
          break;
        case 'friend_request':
          await acceptFriendRequest(notification.data.requestId);
          break;
        case 'duel_challenge':
          await respondToStreakDuel(notification.data.duelId, true);
          break;
      }
      await refresh();
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (notification: Notification) => {
    setProcessing(notification.id);
    try {
      switch (notification.type) {
        case 'guild_invite':
          await declineInvite(notification.data.inviteId);
          break;
        case 'friend_request':
          await declineFriendRequest(notification.data.requestId);
          break;
        case 'duel_challenge':
          await respondToStreakDuel(notification.data.duelId, false);
          break;
      }
      await refresh();
    } finally {
      setProcessing(null);
    }
  };

  const handleViewAll = (type: Notification['type']) => {
    setOpen(false);
    switch (type) {
      case 'guild_invite':
        navigate('/guilds');
        break;
      case 'friend_request':
      case 'duel_challenge':
        navigate('/friends');
        break;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold">Notifications</h4>
        </div>
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{notification.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {notification.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          className="h-7 text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => handleAccept(notification)}
                          disabled={processing === notification.id}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleDecline(notification)}
                          disabled={processing === notification.id}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs ml-auto"
                          onClick={() => handleViewAll(notification.type)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};
