import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HunterProfileModal } from '@/components/HunterProfileModal';
import { HunterAvatar } from '@/components/HunterAvatar';
import { Trophy, Medal, Crown, Globe, Calendar, Target, User, TrendingUp, Swords, Flame, Sparkles, Shield, Star, Zap } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  hunterName: string;
  avatar?: string;
  level: number;
  totalXp: number;
  weeklyXp: number;
  playerRank: string;
  power: number;
  isCurrentUser: boolean;
}

const RANK_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  'E-Rank': { bg: 'from-slate-700/40 to-slate-900/60', border: 'border-slate-500', text: 'text-slate-300', glow: 'shadow-slate-500/20' },
  'D-Rank': { bg: 'from-emerald-800/40 to-emerald-950/60', border: 'border-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
  'C-Rank': { bg: 'from-blue-800/40 to-blue-950/60', border: 'border-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
  'B-Rank': { bg: 'from-violet-800/40 to-violet-950/60', border: 'border-violet-500', text: 'text-violet-400', glow: 'shadow-violet-500/40' },
  'A-Rank': { bg: 'from-orange-700/40 to-orange-950/60', border: 'border-orange-500', text: 'text-orange-400', glow: 'shadow-orange-500/40' },
  'S-Rank': { bg: 'from-red-700/40 to-red-950/60', border: 'border-red-500', text: 'text-red-400', glow: 'shadow-red-500/50' },
};

const RANK_BADGE_COLORS: Record<string, string> = {
  'E-Rank': 'bg-slate-800/80 text-slate-300 border-slate-500/60',
  'D-Rank': 'bg-emerald-900/80 text-emerald-400 border-emerald-500/60',
  'C-Rank': 'bg-blue-900/80 text-blue-400 border-blue-500/60',
  'B-Rank': 'bg-violet-900/80 text-violet-400 border-violet-500/60',
  'A-Rank': 'bg-orange-900/80 text-orange-400 border-orange-500/60',
  'S-Rank': 'bg-red-900/80 text-red-400 border-red-500/60',
};

const RANK_ICONS: Record<string, React.ReactNode> = {
  'E-Rank': <Shield className="h-4 w-4" />,
  'D-Rank': <Shield className="h-4 w-4" />,
  'C-Rank': <Swords className="h-4 w-4" />,
  'B-Rank': <Swords className="h-4 w-4" />,
  'A-Rank': <Zap className="h-4 w-4" />,
  'S-Rank': <Crown className="h-4 w-4" />,
};

const RANK_ORDER = ['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank', 'S-Rank'];

type SortBy = 'level' | 'xp' | 'power';
type LeaderboardType = 'global' | 'weekly' | 'rank';

const Leaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('global');
  const [sortBy, setSortBy] = useState<SortBy>('level');
  const [selectedRank, setSelectedRank] = useState<string>('E-Rank');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  
  // Hunter profile modal state
  const [selectedHunter, setSelectedHunter] = useState<{ userId: string; hunterName: string } | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, sortBy, selectedRank, user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch public profiles first
      const { data: publicProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, hunter_name, avatar')
        .eq('is_public', true);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      const publicUserIds = publicProfiles?.map(p => p.user_id) || [];
      
      if (publicUserIds.length === 0) {
        setEntries([]);
        setUserPosition(null);
        setLoading(false);
        return;
      }

      // Build query for player stats of public users
      let query = supabase
        .from('player_stats')
        .select('user_id, level, total_xp, weekly_xp, rank, strength, agility, intelligence, vitality, sense')
        .in('user_id', publicUserIds);

      // Filter by rank for rank-based leaderboard
      if (leaderboardType === 'rank') {
        query = query.eq('rank', selectedRank);
      }

      // Sort by selected metric (weekly uses weekly_xp)
      if (leaderboardType === 'weekly') {
        query = query.order('weekly_xp', { ascending: false });
      } else {
        switch (sortBy) {
          case 'level':
            query = query.order('level', { ascending: false }).order('total_xp', { ascending: false });
            break;
          case 'xp':
            query = query.order('total_xp', { ascending: false });
            break;
          case 'power':
            query = query.order('total_xp', { ascending: false });
            break;
        }
      }

      query = query.limit(100);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      // Create a map of user_id to profile data
      const profileMap = new Map(publicProfiles?.map(p => [p.user_id, { name: p.hunter_name, avatar: p.avatar }]) || []);

      // Transform and calculate power
      let leaderboardData: LeaderboardEntry[] = (data || []).map((entry, index) => {
        const power = entry.strength + entry.agility + entry.intelligence + entry.vitality + entry.sense;
        const profile = profileMap.get(entry.user_id);
        return {
          rank: index + 1,
          userId: entry.user_id,
          hunterName: profile?.name || 'Unknown Hunter',
          avatar: profile?.avatar,
          level: entry.level,
          totalXp: entry.total_xp,
          weeklyXp: entry.weekly_xp || 0,
          playerRank: entry.rank,
          power,
          isCurrentUser: user?.id === entry.user_id,
        };
      });

      // Sort by power if that's the selected metric (and not weekly)
      if (sortBy === 'power' && leaderboardType !== 'weekly') {
        leaderboardData.sort((a, b) => b.power - a.power);
        leaderboardData = leaderboardData.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
      }

      setEntries(leaderboardData);

      // Find current user's position
      const userEntry = leaderboardData.find(e => e.isCurrentUser);
      setUserPosition(userEntry?.rank || null);

    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHunterClick = (entry: LeaderboardEntry) => {
    if (!entry.isCurrentUser) {
      setSelectedHunter({ userId: entry.userId, hunterName: entry.hunterName });
      setProfileModalOpen(true);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return (
          <div className="relative">
            <Crown className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
          </div>
        );
      case 2:
        return <Medal className="h-7 w-7 text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.6)]" />;
      case 3:
        return <Medal className="h-7 w-7 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-background/50 border border-border/50 flex items-center justify-center">
            <span className="text-muted-foreground font-mono font-bold text-sm">
              {position}
            </span>
          </div>
        );
    }
  };

  const getPositionBgClass = (position: number, playerRank: string) => {
    const rankColors = RANK_COLORS[playerRank] || RANK_COLORS['E-Rank'];
    
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/30 via-amber-600/20 to-yellow-500/10 border-l-4 border-l-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]';
      case 2:
        return 'bg-gradient-to-r from-gray-400/30 via-slate-500/20 to-gray-400/10 border-l-4 border-l-gray-300 shadow-[0_0_20px_rgba(209,213,219,0.2)]';
      case 3:
        return 'bg-gradient-to-r from-amber-600/30 via-orange-700/20 to-amber-600/10 border-l-4 border-l-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
      default:
        return `bg-gradient-to-r ${rankColors.bg} border-l-4 ${rankColors.border} hover:shadow-lg ${rankColors.glow} transition-all duration-300`;
    }
  };

  const getDisplayValue = (entry: LeaderboardEntry) => {
    if (leaderboardType === 'weekly') {
      return { main: `${entry.weeklyXp.toLocaleString()} XP`, sub: `Lv. ${entry.level}` };
    }
    switch (sortBy) {
      case 'level':
        return { main: `Lv. ${entry.level}`, sub: `${entry.totalXp.toLocaleString()} XP` };
      case 'xp':
        return { main: `${entry.totalXp.toLocaleString()} XP`, sub: `Lv. ${entry.level}` };
      case 'power':
        return { main: `${entry.power.toLocaleString()} PWR`, sub: `Lv. ${entry.level}` };
    }
  };

  // Calculate days until Monday reset
  const getDaysUntilReset = () => {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    return daysUntilMonday;
  };

  return (
    <>
      <main className="md:pl-[70px] pt-16 pb-8 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Solo Leveling Style Header */}
          <div className="relative text-center space-y-4 py-8">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent rounded-3xl blur-2xl" />
            
            <div className="relative flex items-center justify-center gap-4">
              <div className="relative">
                <Shield className="h-10 w-10 text-primary animate-pulse" />
                <Flame className="absolute -top-2 -right-2 h-5 w-5 text-orange-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-orbitron tracking-wider">
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent drop-shadow-lg">
                  HUNTER
                </span>
                <span className="text-foreground ml-3">RANKINGS</span>
              </h1>
              <div className="relative">
                <Shield className="h-10 w-10 text-primary animate-pulse" />
                <Flame className="absolute -top-2 -left-2 h-5 w-5 text-orange-500" />
              </div>
            </div>
            
            <p className="text-muted-foreground font-rajdhani text-lg tracking-wide">
              ⚔️ Prove your strength among the world's greatest hunters ⚔️
            </p>
            
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
              <Star className="h-4 w-4 text-primary" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
            </div>
          </div>

          {/* User's Current Position */}
          {user && userPosition && (
            <Card className="border-2 border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/20">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground font-semibold">Your Position</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xl font-bold border-2 border-primary text-primary px-4 py-1 shadow-lg shadow-primary/30">
                    #{userPosition}
                  </Badge>
                  <span className="text-sm text-muted-foreground">of {entries.length} hunters</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard Tabs */}
          <Tabs value={leaderboardType} onValueChange={(v) => setLeaderboardType(v as LeaderboardType)}>
            <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/50 p-1">
              <TabsTrigger value="global" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline font-semibold">Global</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline font-semibold">Weekly</span>
              </TabsTrigger>
              <TabsTrigger value="rank" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline font-semibold">By Rank</span>
              </TabsTrigger>
            </TabsList>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 mt-4">
              {leaderboardType !== 'weekly' && (
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                  <SelectTrigger className="w-[160px] bg-card/50 border-border/50">
                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="level">🎯 Level</SelectItem>
                    <SelectItem value="xp">⚡ Total XP</SelectItem>
                    <SelectItem value="power">⚔️ Power</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {leaderboardType === 'rank' && (
                <Select value={selectedRank} onValueChange={setSelectedRank}>
                  <SelectTrigger className="w-[160px] bg-card/50 border-border/50">
                    <Swords className="h-4 w-4 mr-2 text-secondary" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RANK_ORDER.map((rank) => (
                      <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Leaderboard Content */}
            <TabsContent value={leaderboardType} className="mt-4">
              <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {leaderboardType === 'global' && (
                        <>
                          <Globe className="h-5 w-5 text-primary" />
                          <span className="font-orbitron">All-Time Rankings</span>
                        </>
                      )}
                      {leaderboardType === 'weekly' && (
                        <>
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="font-orbitron">Weekly Rankings</span>
                        </>
                      )}
                      {leaderboardType === 'rank' && (
                        <>
                          <Target className="h-5 w-5 text-primary" />
                          <span className="font-orbitron">{selectedRank} Hunters</span>
                        </>
                      )}
                    </div>
                    {leaderboardType === 'weekly' && (
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary border border-secondary/50">
                        🔄 Resets in {getDaysUntilReset()} day{getDaysUntilReset() > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="space-y-2 p-4">
                      {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-semibold">No hunters found</p>
                      <p className="text-sm">Be the first to claim the throne!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/20">
                      {entries.map((entry) => {
                        const displayValue = getDisplayValue(entry);
                        const rankColors = RANK_COLORS[entry.playerRank] || RANK_COLORS['E-Rank'];
                        
                        return (
                          <div
                            key={entry.userId}
                            onClick={() => handleHunterClick(entry)}
                            className={`relative flex items-center gap-4 p-4 transition-all duration-300 ${
                              entry.isCurrentUser 
                                ? 'bg-gradient-to-r from-primary/30 via-primary/15 to-transparent border-l-4 border-l-primary shadow-[0_0_30px_rgba(0,200,255,0.3)]' 
                                : `${getPositionBgClass(entry.rank, entry.playerRank)} cursor-pointer hover:scale-[1.01]`
                            }`}
                          >
                            {/* Rank-based accent line on right */}
                            <div className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${rankColors.bg}`} />
                            
                            {/* Position */}
                            <div className="flex items-center justify-center w-12">
                              {getRankIcon(entry.rank)}
                            </div>

                            {/* Avatar */}
                            <HunterAvatar 
                              avatar={entry.avatar} 
                              hunterName={entry.hunterName} 
                              size="md"
                            />

                            {/* Hunter Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-bold text-lg truncate ${entry.isCurrentUser ? 'text-primary' : rankColors.text} font-rajdhani tracking-wide`}>
                                  {entry.hunterName}
                                </span>
                                {entry.isCurrentUser && (
                                  <Badge variant="outline" className="text-xs border-primary text-primary bg-primary/10 shadow-sm animate-pulse">
                                    YOU
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs font-bold px-2.5 py-0.5 flex items-center gap-1 ${RANK_BADGE_COLORS[entry.playerRank] || ''} shadow-sm`}
                                >
                                  {RANK_ICONS[entry.playerRank]}
                                  {entry.playerRank}
                                </Badge>
                                <span className="text-xs text-muted-foreground/60">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {entry.power.toLocaleString()} Power
                                </span>
                                {!entry.isCurrentUser && (
                                  <>
                                    <span className="text-xs text-muted-foreground/60">•</span>
                                    <span className="text-xs text-primary/70 hover:text-primary transition-colors">View Profile →</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="text-right space-y-1">
                              <div className={`font-bold text-xl font-rajdhani tracking-wide ${entry.rank <= 3 ? 'text-foreground' : rankColors.text}`}>
                                {displayValue.main}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {displayValue.sub}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Call to Action for non-logged users */}
          {!user && (
            <Card className="border-2 border-primary/50 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 shadow-xl">
              <CardContent className="py-8 text-center space-y-6">
                <div className="relative inline-block">
                  <Trophy className="h-16 w-16 mx-auto text-primary animate-pulse" />
                  <Sparkles className="absolute top-0 right-0 h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 font-orbitron">Join the Rankings!</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create an account to track your progress, compete with hunters worldwide, and rise through the ranks.
                  </p>
                  <button
                    onClick={() => navigate('/auth')}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                  >
                    ⚔️ Begin Your Awakening
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Hunter Profile Modal */}
      {selectedHunter && (
        <HunterProfileModal
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
          userId={selectedHunter.userId}
          hunterName={selectedHunter.hunterName}
        />
      )}
    </>
  );
};

export default Leaderboard;