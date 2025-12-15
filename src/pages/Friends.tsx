import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends, Friend, StreakDuel, DuelMode, CustomDuelSettings } from '@/hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, UserPlus, UserMinus, Swords, Trophy, 
  Mail, Search, Flame, Clock, CheckCircle, XCircle,
  Eye, Crown, Shield, Zap, AlertTriangle, Gift
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HunterProfileModal } from '@/components/HunterProfileModal';
import { HunterAvatar } from '@/components/HunterAvatar';

const RANK_COLORS: Record<string, string> = {
  'E-Rank': 'text-slate-400',
  'D-Rank': 'text-emerald-400',
  'C-Rank': 'text-blue-400',
  'B-Rank': 'text-violet-400',
  'A-Rank': 'text-amber-400',
  'S-Rank': 'text-red-400',
};

const Friends = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
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
  } = useFriends();

  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [duelChallengeTarget, setDuelChallengeTarget] = useState<Friend | null>(null);
  const [selectedDuelMode, setSelectedDuelMode] = useState<DuelMode>('system');
  const [viewingDuel, setViewingDuel] = useState<StreakDuel | null>(null);
  // Custom duel settings
  const [customXpPool, setCustomXpPool] = useState(50);
  const [customIsFixed, setCustomIsFixed] = useState(false);
  const [customIsCompetitive, setCustomIsCompetitive] = useState(false);

  const searchHunters = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      toast({ title: "Enter at least 2 characters" });
      return;
    }

    setSearching(true);
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, hunter_name, avatar, is_public')
        .ilike('hunter_name', `%${searchQuery}%`)
        .eq('is_public', true)
        .neq('user_id', user?.id)
        .limit(10);

      setSearchResults(profiles || []);
    } catch (error: any) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const getDuelStatus = (duel: StreakDuel) => {
    if (duel.status === 'pending') return 'pending';
    if (duel.status === 'declined') return 'declined';
    if (duel.status === 'completed') return 'completed';
    return 'active';
  };

  const calculateCurrentRewardPool = (duel: StreakDuel) => {
    if (duel.status !== 'active') return duel.reward_pool || 10;
    const startDate = new Date(duel.starts_at);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return 10 + (daysDiff * 3);
  };

  const getDuelWinner = (duel: StreakDuel) => {
    if (duel.winner_id) {
      return duel.winner_id === duel.challenger_id 
        ? duel.challenger_name 
        : duel.challenged_name;
    }
    return null;
  };

  const getDuelModeFromDuel = (duel: StreakDuel): DuelMode => {
    // Competitive mode is stored in challenger_streak field (1 = competitive, 0 = system)
    return duel.challenger_streak === 1 ? 'competitive' : 'system';
  };

  const handleSendChallenge = async () => {
    if (!duelChallengeTarget) return;
    
    if (selectedDuelMode === 'custom') {
      const customSettings: CustomDuelSettings = {
        xpPool: customXpPool,
        isFixed: customIsFixed,
        isCompetitive: customIsCompetitive,
      };
      await challengeToStreakDuel(duelChallengeTarget.friend_id, 'custom', customSettings);
    } else {
      await challengeToStreakDuel(duelChallengeTarget.friend_id, selectedDuelMode);
    }
    
    setDuelChallengeTarget(null);
    setSelectedDuelMode('system');
    setCustomXpPool(50);
    setCustomIsFixed(false);
    setCustomIsCompetitive(false);
  };

  const getDuelModeInfo = (duel: StreakDuel) => {
    const mode = duel.challenger_streak;
    const isFixed = duel.challenged_streak === 1;
    
    if (mode === 2) {
      return { isCustom: true, isCompetitive: isFixed, isFixed };
    } else if (mode === 1) {
      return { isCustom: false, isCompetitive: true, isFixed: false };
    }
    return { isCustom: false, isCompetitive: false, isFixed: false };
  };

  if (!user) {
    return (
      <main className="md:pl-[70px] pt-16 pb-8 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
              <h2 className="text-2xl font-orbitron font-bold mb-2">Find Your Allies</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to add friends and challenge them to streak duels!
              </p>
              <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90">
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="md:pl-[70px] pt-16 pb-8 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative text-center space-y-4 py-6">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent rounded-3xl blur-2xl" />
          
          <div className="relative flex items-center justify-center gap-4">
            <Users className="h-10 w-10 text-cyan-400 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold font-orbitron tracking-wider">
              <span className="bg-gradient-to-r from-cyan-400 via-primary to-cyan-400 bg-clip-text text-transparent">
                HUNTERS
              </span>
            </h1>
            <Users className="h-10 w-10 text-cyan-400 animate-pulse" />
          </div>
          
          <p className="text-muted-foreground font-rajdhani text-lg">
            Connect with fellow hunters and test your streaks
          </p>
        </div>

        {/* Friend Requests Banner */}
        {friendRequests.length > 0 && (
          <Card className="border-2 border-cyan-500/50 bg-cyan-500/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span className="font-semibold text-cyan-400">
                  {friendRequests.length} pending friend request{friendRequests.length > 1 ? 's' : ''}!
                </span>
              </div>
              <div className="space-y-2">
                  {friendRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between bg-background/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <HunterAvatar 
                          avatar={req.requester_avatar} 
                          hunterName={req.requester_name} 
                          size="md"
                        />
                        <span className="font-medium">{req.requester_name}</span>
                      </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptFriendRequest(req.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineFriendRequest(req.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/50 p-1">
            <TabsTrigger value="friends" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Friends</span>
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-1">{friends.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Find</span>
            </TabsTrigger>
            <TabsTrigger value="duels" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">Duels</span>
              {streakDuels.filter(d => d.status === 'pending' && d.challenged_id === user.id).length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {streakDuels.filter(d => d.status === 'pending' && d.challenged_id === user.id).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Friends List */}
          <TabsContent value="friends" className="mt-4 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <Card className="border-border/50 bg-card/30">
                <CardContent className="py-16 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-xl font-semibold mb-2">No Friends Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Search for hunters to add as friends!
                  </p>
                  <Button onClick={() => setActiveTab('search')}>
                    Find Hunters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {friends.map((friend) => (
                  <Card 
                    key={friend.id} 
                    className="border-border/50 bg-card/30 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <HunterAvatar 
                            avatar={friend.avatar} 
                            hunterName={friend.hunter_name} 
                            size="lg"
                          />
                          <div>
                            <h3 className="font-semibold">{friend.hunter_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Lv. {friend.level}</span>
                              <span className={RANK_COLORS[friend.rank]}>{friend.rank}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDuelChallengeTarget(friend);
                            }}
                            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                          >
                            <Swords className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmRemove(friend.id);
                            }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-4 space-y-4">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-lg">Find Hunters</CardTitle>
                <CardDescription>Search by hunter name to send friend requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter hunter name..."
                    className="bg-background/50"
                    onKeyDown={(e) => e.key === 'Enter' && searchHunters()}
                  />
                  <Button onClick={searchHunters} disabled={searching}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((hunter) => {
                      const isFriend = friends.some(f => f.friend_id === hunter.user_id);
                      const isPending = sentRequests.includes(hunter.user_id);
                      
                      return (
                        <div 
                          key={hunter.user_id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-background/30"
                        >
                          <div className="flex items-center gap-3">
                            <HunterAvatar 
                              avatar={hunter.avatar} 
                              hunterName={hunter.hunter_name} 
                              size="md"
                            />
                            <span className="font-medium">{hunter.hunter_name}</span>
                          </div>
                          {isFriend ? (
                            <Badge variant="secondary">Already Friends</Badge>
                          ) : isPending ? (
                            <Badge variant="outline">Request Sent</Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => sendFriendRequest(hunter.user_id)}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Streak Duels Tab */}
          <TabsContent value="duels" className="mt-4 space-y-4">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  Streak Duels
                </CardTitle>
                <CardDescription>
                  First to break their streak loses! Reward pool grows by 3 XP daily.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {streakDuels.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Swords className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No active duels. Challenge a friend from your friends list!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {streakDuels.map((duel) => {
                      const status = getDuelStatus(duel);
                      const isChallenger = duel.challenger_id === user.id;
                      const isPendingForMe = status === 'pending' && duel.challenged_id === user.id;
                      
                      return (
                        <div 
                          key={duel.id}
                          className={`p-4 rounded-lg border ${
                            status === 'active' 
                              ? 'border-orange-500/50 bg-orange-500/10' 
                              : status === 'pending'
                              ? 'border-yellow-500/50 bg-yellow-500/10'
                              : 'border-border/50 bg-background/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Swords className="h-5 w-5 text-orange-400" />
                              <span className="font-semibold">
                                {duel.challenger_name} vs {duel.challenged_name}
                              </span>
                            </div>
                            <Badge variant={
                              status === 'active' ? 'default' :
                              status === 'pending' ? 'secondary' :
                              status === 'completed' ? 'outline' : 'destructive'
                            }>
                              {status.toUpperCase()}
                            </Badge>
                          </div>

                          {status === 'active' && (
                            <>
                              {/* Reward Pool Display */}
                              <div className="flex items-center justify-center gap-2 mb-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                <Trophy className="h-5 w-5 text-yellow-400" />
                                <span className="font-bold text-yellow-400">
                                  Reward Pool: {calculateCurrentRewardPool(duel)} XP
                                </span>
                                <span className="text-xs text-muted-foreground">(+3 daily)</span>
                              </div>
                              
                              {/* Streak Display */}
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="text-center p-3 rounded-lg bg-background/30">
                                  <p className="text-sm text-muted-foreground">{duel.challenger_name}</p>
                                  <p className="text-lg font-bold text-orange-400">
                                    Active
                                    <Flame className="inline h-5 w-5 ml-1" />
                                  </p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-background/30">
                                  <p className="text-sm text-muted-foreground">{duel.challenged_name}</p>
                                  <p className="text-lg font-bold text-orange-400">
                                    Active
                                    <Flame className="inline h-5 w-5 ml-1" />
                                  </p>
                                </div>
                              </div>

                              {/* Report Streak Break Button */}
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={() => reportStreakBreak(duel.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                I Broke My Streak (Forfeit)
                              </Button>
                            </>
                          )}

                          {status === 'completed' && (
                            <div className="flex flex-col items-center gap-2 py-2">
                              <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-400" />
                                <span className="font-semibold">Winner: {getDuelWinner(duel) || 'Unknown'}</span>
                              </div>
                              <span className="text-sm text-green-400">
                                +{duel.reward_pool || 10} XP awarded!
                              </span>
                            </div>
                          )}

                          {isPendingForMe && (
                            <div className="space-y-3 mt-3">
                              {/* Duel Mode Info */}
                              {(() => {
                                const modeInfo = getDuelModeInfo(duel);
                                const isCustom = duel.challenger_streak === 2 || duel.reward_pool > 1;
                                const isCompetitive = duel.challenger_streak === 1;
                                const isFixed = duel.challenged_streak === 1;
                                
                                if (isCustom) {
                                  return (
                                    <div className="p-3 rounded-lg border border-purple-500/50 bg-purple-500/10">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-4 w-4 text-purple-400" />
                                        <span className="font-semibold text-purple-400">Custom Mode</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {duel.reward_pool} XP pool{isFixed ? ' (fixed)' : ' (+3 daily)'}.
                                        {isFixed ? ' Loser loses XP!' : ' No penalty for loser.'}
                                      </p>
                                    </div>
                                  );
                                } else if (isCompetitive) {
                                  return (
                                    <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/10">
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-4 w-4 text-red-400" />
                                        <span className="font-semibold text-red-400">Competitive Mode</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        Winner takes XP from loser! Loser loses the full reward pool.
                                      </p>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="p-3 rounded-lg border border-green-500/50 bg-green-500/10">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Gift className="h-4 w-4 text-green-400" />
                                        <span className="font-semibold text-green-400">System Reward Mode</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        Winner gets XP reward from the System. No penalty for the loser.
                                      </p>
                                    </div>
                                  );
                                }
                              })()}
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => respondToStreakDuel(duel.id, true)}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  Accept Challenge
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => respondToStreakDuel(duel.id, false)}
                                  className="flex-1"
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                          )}

                          {status === 'active' && (
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
                              <Clock className="h-3 w-3" />
                              Started: {new Date(duel.starts_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Hunter Profile Modal */}
      <HunterProfileModal
        open={!!selectedFriend}
        onOpenChange={(open) => !open && setSelectedFriend(null)}
        userId={selectedFriend?.friend_id || ''}
        hunterName={selectedFriend?.hunter_name || ''}
      />

      {/* Confirm Remove Dialog */}
      <Dialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
        <DialogContent className="border-destructive/30">
          <DialogHeader>
            <DialogTitle>Remove Friend?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this friend? You can always add them back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmRemove) removeFriend(confirmRemove);
                setConfirmRemove(null);
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duel Challenge Modal */}
      <Dialog open={!!duelChallengeTarget} onOpenChange={() => setDuelChallengeTarget(null)}>
        <DialogContent className="border-orange-500/30 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <Swords className="h-5 w-5" />
              Challenge to Streak Duel
            </DialogTitle>
            <DialogDescription>
              Challenge <span className="font-semibold text-foreground">{duelChallengeTarget?.hunter_name}</span> to a streak duel!
              First to break their daily streak loses.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm font-semibold text-foreground">Select Duel Mode:</p>
            <RadioGroup value={selectedDuelMode} onValueChange={(v) => setSelectedDuelMode(v as DuelMode)}>
              <div className="flex items-start gap-3 p-4 rounded-lg border border-green-500/30 bg-green-500/5 cursor-pointer hover:bg-green-500/10 transition-colors" onClick={() => setSelectedDuelMode('system')}>
                <RadioGroupItem value="system" id="system" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                    <Gift className="h-4 w-4 text-green-400" />
                    <span className="font-semibold text-green-400">System Reward</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Winner receives XP reward from the System. No penalty for the loser - perfect for friendly competition!
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg border border-red-500/30 bg-red-500/5 cursor-pointer hover:bg-red-500/10 transition-colors" onClick={() => setSelectedDuelMode('competitive')}>
                <RadioGroupItem value="competitive" id="competitive" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="competitive" className="flex items-center gap-2 cursor-pointer">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="font-semibold text-red-400">Competitive</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Winner takes XP from the loser! Loser loses the full reward pool. Higher stakes!
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 cursor-pointer hover:bg-purple-500/10 transition-colors" onClick={() => setSelectedDuelMode('custom')}>
                <RadioGroupItem value="custom" id="custom" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="custom" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <span className="font-semibold text-purple-400">Custom</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set your own XP pool and rules. Full control over the stakes!
                  </p>
                </div>
              </div>
            </RadioGroup>
            
            {/* Custom Settings Panel */}
            {selectedDuelMode === 'custom' && (
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-4">
                <div>
                  <Label className="text-sm text-foreground mb-2 block">XP Prize Pool</Label>
                  <Input
                    type="number"
                    min={10}
                    max={10000}
                    value={customXpPool}
                    onChange={(e) => setCustomXpPool(Math.max(10, parseInt(e.target.value) || 10))}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">Pool Growth</Label>
                    <p className="text-xs text-muted-foreground">
                      {customIsFixed ? "Pool stays fixed" : "Pool grows +3 XP daily"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCustomIsFixed(false)}
                      className={`px-3 py-1.5 text-xs rounded-l-md border transition-all ${
                        !customIsFixed 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold' 
                          : 'bg-background/50 border-border text-muted-foreground hover:bg-background/80'
                      }`}
                    >
                      Growing
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomIsFixed(true)}
                      className={`px-3 py-1.5 text-xs rounded-r-md border transition-all ${
                        customIsFixed 
                          ? 'bg-purple-500/20 border-purple-500 text-purple-400 font-semibold' 
                          : 'bg-background/50 border-border text-muted-foreground hover:bg-background/80'
                      }`}
                    >
                      Fixed
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">Loser Penalty</Label>
                    <p className="text-xs text-muted-foreground">
                      {customIsCompetitive ? "Loser loses XP to winner" : "No penalty for loser"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCustomIsCompetitive(false)}
                      className={`px-3 py-1.5 text-xs rounded-l-md border transition-all ${
                        !customIsCompetitive 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold' 
                          : 'bg-background/50 border-border text-muted-foreground hover:bg-background/80'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomIsCompetitive(true)}
                      className={`px-3 py-1.5 text-xs rounded-r-md border transition-all ${
                        customIsCompetitive 
                          ? 'bg-red-500/20 border-red-500 text-red-400 font-semibold' 
                          : 'bg-background/50 border-border text-muted-foreground hover:bg-background/80'
                      }`}
                    >
                      Competitive
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
              <p className="text-xs text-muted-foreground">Reward Pool</p>
              {selectedDuelMode === 'custom' ? (
                <p className="text-lg font-bold text-purple-400">
                  {customXpPool} XP{!customIsFixed && ' (+3 daily)'}
                </p>
              ) : (
                <p className="text-lg font-bold text-yellow-400">Starts at 10 XP, +3 XP daily</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuelChallengeTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleSendChallenge} className="bg-orange-600 hover:bg-orange-700">
              <Swords className="h-4 w-4 mr-2" />
              Send Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Friends;
