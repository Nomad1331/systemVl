import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGuilds, Guild, GuildMember } from '@/hooks/useGuilds';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Castle, Users, Crown, Shield, Swords, MessageSquare, 
  Plus, LogOut, Trash2, Send, Trophy, Zap, Mail,
  Globe, UserPlus, Star, Flame, Target, Eye, ChevronUp, ChevronDown, X,
  Clock, UserX
} from 'lucide-react';
import { HunterProfileModal } from '@/components/HunterProfileModal';
import { HunterAvatar } from '@/components/HunterAvatar';
import GuildChallengesPanel from '@/components/GuildChallengesPanel';

const ROLE_COLORS: Record<string, string> = {
  guild_master: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  vice_master: 'bg-violet-500/20 text-violet-400 border-violet-500/50',
  elite: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  member: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
};

const ROLE_LABELS: Record<string, string> = {
  guild_master: 'Guild Master',
  vice_master: 'Vice Master',
  elite: 'Elite',
  member: 'Member',
};

const ACCESS_ICONS: Record<string, React.ReactNode> = {
  public: <Globe className="h-4 w-4" />,
  invite_only: <UserPlus className="h-4 w-4" />,
};

interface SearchResult {
  user_id: string;
  hunter_name: string;
  avatar: string;
}

const Guilds = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    guilds,
    myGuild,
    myMembership,
    guildMembers,
    guildMessages,
    myInvites,
    sentInvites,
    loading,
    createGuild,
    joinGuild,
    leaveGuild,
    disbandGuild,
    sendMessage,
    acceptInvite,
    declineInvite,
    searchUsers,
    sendInvite,
    revokeInvite,
    promoteMember,
    demoteMember,
    kickMember,
  } = useGuilds();

  const [activeTab, setActiveTab] = useState<string>(myGuild ? 'my-guild' : 'browse');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [guildDescription, setGuildDescription] = useState('');
  const [accessType, setAccessType] = useState<'public' | 'invite_only'>('public');
  const [messageInput, setMessageInput] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDisband, setConfirmDisband] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);
  const [manageMemberModal, setManageMemberModal] = useState<GuildMember | null>(null);
  const [manageInvitesOpen, setManageInvitesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guildMessages]);

  // Update tab when guild changes
  useEffect(() => {
    if (myGuild && activeTab === 'browse') {
      setActiveTab('my-guild');
    }
  }, [myGuild]);

  const handleCreateGuild = async () => {
    if (!guildName.trim()) return;
    
    const success = await createGuild(guildName, guildDescription, accessType);
    if (success) {
      setCreateModalOpen(false);
      setGuildName('');
      setGuildDescription('');
      setAccessType('public');
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput('');
    }
  };

  // Search for users to invite
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setSearching(false);
  };

  const handleInvite = async (inviteeId: string, inviteeName: string) => {
    const success = await sendInvite(inviteeId, inviteeName);
    if (success) {
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.user_id !== inviteeId));
    }
  };

  const canInvite = myMembership && ['guild_master', 'vice_master', 'elite'].includes(myMembership.role);

  if (!user) {
    return (
      <main className="md:pl-[70px] pt-16 pb-8 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <Castle className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
              <h2 className="text-2xl font-orbitron font-bold mb-2">Join the Hunt</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to create or join guilds and battle alongside fellow hunters!
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative text-center space-y-4 py-6">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent rounded-3xl blur-2xl" />
          
          <div className="relative flex items-center justify-center gap-4">
            <Castle className="h-10 w-10 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold font-orbitron tracking-wider">
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                GUILDS
              </span>
            </h1>
            <Castle className="h-10 w-10 text-primary animate-pulse" />
          </div>
          
          <p className="text-muted-foreground font-rajdhani text-lg">
            🏰 Unite with hunters and conquer together 🏰
          </p>
        </div>

        {/* Invites Banner */}
        {myInvites.length > 0 && (
          <Card className="border-2 border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">
                  You have {myInvites.length} pending invite{myInvites.length > 1 ? 's' : ''}!
                </span>
              </div>
              <div className="space-y-2">
                {myInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between bg-background/30 rounded-lg p-3">
                    <div>
                      <span className="font-medium">{invite.guild_name}</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        invited by {invite.inviter_name}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptInvite(invite.id, invite.guild_id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineInvite(invite.id)}
                      >
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
            <TabsTrigger value="browse" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="my-guild" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <Castle className="h-4 w-4" />
              <span className="hidden sm:inline">My Guild</span>
            </TabsTrigger>
            <TabsTrigger value="rankings" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Rankings</span>
            </TabsTrigger>
          </TabsList>

          {/* Browse Guilds */}
          <TabsContent value="browse" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-orbitron">Available Guilds</h2>
              {!myGuild && (
                <Button onClick={() => setCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Guild
                </Button>
              )}
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : guilds.length === 0 ? (
              <Card className="border-border/50 bg-card/30">
                <CardContent className="py-16 text-center">
                  <Castle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">No guilds found. Be the first to create one!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {guilds.map((guild) => (
                  <GuildCard
                    key={guild.id}
                    guild={guild}
                    onJoin={() => joinGuild(guild.id)}
                    isInGuild={!!myGuild}
                    isMyGuild={myGuild?.id === guild.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Guild */}
          <TabsContent value="my-guild" className="mt-4 space-y-4">
            {!myGuild ? (
              <Card className="border-border/50 bg-card/30">
                <CardContent className="py-16 text-center">
                  <Castle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-xl font-semibold mb-2">No Guild Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Join an existing guild or create your own!
                  </p>
                  <Button onClick={() => setActiveTab('browse')}>
                    Browse Guilds
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Guild Info */}
                <Card className="lg:col-span-1 border-primary/30 bg-card/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-orbitron">{myGuild.name}</CardTitle>
                      {ACCESS_ICONS[myGuild.access_type]}
                    </div>
                    <CardDescription>{myGuild.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Power</span>
                      <span className="font-bold text-primary">{myGuild.total_power.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span>{guildMembers.length} / {myGuild.max_members}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Role</span>
                      <Badge className={ROLE_COLORS[myMembership?.role || 'member']}>
                        {ROLE_LABELS[myMembership?.role || 'member']}
                      </Badge>
                    </div>

                    <div className="pt-4 border-t border-border/30 space-y-2">
                      {canInvite && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full border-primary/50 text-primary hover:bg-primary/10"
                            onClick={() => setInviteModalOpen(true)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Hunter
                          </Button>
                          {sentInvites.length > 0 && (
                            <Button
                              variant="outline"
                              className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                              onClick={() => setManageInvitesOpen(true)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Manage Invites ({sentInvites.length})
                            </Button>
                          )}
                        </>
                      )}
                      {myMembership?.role !== 'guild_master' && (
                        <Button
                          variant="outline"
                          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmLeave(true)}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Leave Guild
                        </Button>
                      )}
                      {myMembership?.role === 'guild_master' && (
                        <Button
                          variant="outline"
                          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDisband(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Disband Guild
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Members List */}
                <Card className="lg:col-span-1 border-border/50 bg-card/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-2">
                        {guildMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-background/30 hover:bg-background/50 transition-colors group"
                          >
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => setSelectedMember(member)}
                            >
                              <HunterAvatar 
                                avatar={member.avatar} 
                                hunterName={member.hunter_name || 'Unknown'} 
                                size="sm"
                              />
                              <div>
                                <p className="font-medium">{member.hunter_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Lv. {member.level} • {member.power} PWR
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Guild Master can manage non-master members */}
                              {myMembership?.role === 'guild_master' && member.role !== 'guild_master' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => { e.stopPropagation(); setManageMemberModal(member); }}
                                >
                                  <Users className="h-4 w-4" />
                                </Button>
                              )}
                              <Badge variant="outline" className={ROLE_COLORS[member.role]}>
                                {member.role === 'guild_master' && <Crown className="h-3 w-3 mr-1" />}
                                {member.role === 'vice_master' && <Shield className="h-3 w-3 mr-1" />}
                                {member.role === 'elite' && <Swords className="h-3 w-3 mr-1" />}
                                {ROLE_LABELS[member.role]}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Guild Chat */}
                <Card className="lg:col-span-1 border-border/50 bg-card/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Guild Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-[350px]">
                    <ScrollArea className="flex-1 pr-4 mb-4">
                      <div className="space-y-3">
                        {guildMessages.length === 0 ? (
                          <p className="text-center text-muted-foreground text-sm py-8">
                            No messages yet. Start the conversation!
                          </p>
                        ) : (
                          guildMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-2 rounded-lg ${
                                msg.user_id === user.id
                                  ? 'bg-primary/20 ml-4'
                                  : 'bg-background/30 mr-4'
                              }`}
                            >
                              <p className="text-xs text-primary font-medium mb-1">
                                {msg.sender_name}
                              </p>
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-background/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Guild Rankings */}
          <TabsContent value="rankings" className="mt-4">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Top Guilds by Power
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {guilds.slice(0, 20).map((guild, index) => (
                      <div
                        key={guild.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index === 0
                            ? 'bg-gradient-to-r from-yellow-500/30 to-transparent border-l-4 border-yellow-400'
                            : index === 1
                            ? 'bg-gradient-to-r from-gray-400/30 to-transparent border-l-4 border-gray-400'
                            : index === 2
                            ? 'bg-gradient-to-r from-amber-600/30 to-transparent border-l-4 border-amber-600'
                            : 'bg-background/30'
                        } ${myGuild?.id === guild.id ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`font-bold w-8 ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-400' :
                            index === 2 ? 'text-amber-600' :
                            'text-muted-foreground'
                          }`}>
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-semibold">{guild.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {guild.member_count} members • Master: {guild.master_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{guild.total_power.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Power</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Guild Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="border-primary/30 bg-card/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-orbitron">
                <Castle className="h-5 w-5 text-primary" />
                Create New Guild
              </DialogTitle>
              <DialogDescription>
                Establish your guild and recruit hunters to join your cause.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Guild Name</label>
                <Input
                  value={guildName}
                  onChange={(e) => setGuildName(e.target.value)}
                  placeholder="Enter guild name..."
                  className="bg-background/50"
                  maxLength={30}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={guildDescription}
                  onChange={(e) => setGuildDescription(e.target.value)}
                  placeholder="Describe your guild..."
                  className="bg-background/50 resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Access Type</label>
                <Select value={accessType} onValueChange={(v: any) => setAccessType(v)}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public - Anyone can join
                      </div>
                    </SelectItem>
                    <SelectItem value="invite_only">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Invite Only - Visible but requires invitation
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGuild} disabled={!guildName.trim()}>
                Create Guild
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Leave Modal */}
        <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
          <DialogContent className="border-destructive/30">
            <DialogHeader>
              <DialogTitle>Leave Guild?</DialogTitle>
              <DialogDescription>
                Are you sure you want to leave {myGuild?.name}? You'll lose your contribution progress.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmLeave(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  leaveGuild();
                  setConfirmLeave(false);
                }}
              >
                Leave Guild
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Disband Modal */}
        <Dialog open={confirmDisband} onOpenChange={setConfirmDisband}>
          <DialogContent className="border-destructive/30">
            <DialogHeader>
              <DialogTitle>Disband Guild?</DialogTitle>
              <DialogDescription>
                This will permanently delete {myGuild?.name} and remove all members. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDisband(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  disbandGuild();
                  setConfirmDisband(false);
                }}
              >
                Disband Guild
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hunter Profile Modal */}
        <HunterProfileModal
          open={!!selectedMember}
          onOpenChange={(open) => !open && setSelectedMember(null)}
          userId={selectedMember?.user_id || ''}
          hunterName={selectedMember?.hunter_name || ''}
        />

        {/* Invite Hunter Modal */}
        <Dialog open={inviteModalOpen} onOpenChange={(open) => {
          setInviteModalOpen(open);
          if (!open) {
            setSearchQuery('');
            setSearchResults([]);
          }
        }}>
          <DialogContent className="border-primary/30 bg-card/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-orbitron">
                <UserPlus className="h-5 w-5 text-primary" />
                Invite Hunter to Guild
              </DialogTitle>
              <DialogDescription>
                Search for hunters by name to invite them to {myGuild?.name}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Hunter Name</label>
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Enter hunter name..."
                  className="bg-background/50"
                />
              </div>
              
              <ScrollArea className="h-[250px] pr-4">
                {searching ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-14" />
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery.length < 2 
                      ? 'Type at least 2 characters to search' 
                      : 'No hunters found'
                    }
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.user_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <HunterAvatar 
                            avatar={result.avatar} 
                            hunterName={result.hunter_name} 
                            size="sm"
                          />
                          <span className="font-medium">{result.hunter_name}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleInvite(result.user_id, result.hunter_name)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Invite
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Member Modal */}
        <Dialog open={!!manageMemberModal} onOpenChange={() => setManageMemberModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Manage Member
              </DialogTitle>
              <DialogDescription>
                Manage {manageMemberModal?.hunter_name}'s role in the guild.
              </DialogDescription>
            </DialogHeader>
            
            {manageMemberModal && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-background/30">
                  <HunterAvatar 
                    avatar={manageMemberModal.avatar} 
                    hunterName={manageMemberModal.hunter_name || 'Unknown'} 
                    size="md"
                  />
                  <div>
                    <p className="font-semibold">{manageMemberModal.hunter_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Lv. {manageMemberModal.level} • {manageMemberModal.power} PWR
                    </p>
                    <Badge variant="outline" className={`mt-1 ${ROLE_COLORS[manageMemberModal.role]}`}>
                      {ROLE_LABELS[manageMemberModal.role]}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Actions</p>
                  <div className="grid gap-2">
                    {manageMemberModal.role !== 'vice_master' && (
                      <Button
                        variant="outline"
                        className="w-full justify-start border-green-500/50 text-green-400 hover:bg-green-500/10"
                        onClick={async () => {
                          await promoteMember(manageMemberModal.id, manageMemberModal.role);
                          setManageMemberModal(null);
                        }}
                      >
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Promote to {manageMemberModal.role === 'member' ? 'Elite' : 'Vice Master'}
                      </Button>
                    )}
                    {manageMemberModal.role !== 'member' && (
                      <Button
                        variant="outline"
                        className="w-full justify-start border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                        onClick={async () => {
                          await demoteMember(manageMemberModal.id, manageMemberModal.role);
                          setManageMemberModal(null);
                        }}
                      >
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Demote to {manageMemberModal.role === 'vice_master' ? 'Elite' : 'Member'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={async () => {
                        await kickMember(manageMemberModal.id, manageMemberModal.user_id);
                        setManageMemberModal(null);
                      }}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Kick from Guild
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setManageMemberModal(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Invites Modal */}
        <Dialog open={manageInvitesOpen} onOpenChange={setManageInvitesOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-yellow-400" />
                Pending Invites
              </DialogTitle>
              <DialogDescription>
                Manage pending invites for {myGuild?.name}. Invites expire after 48 hours.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {sentInvites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No pending invites</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {sentInvites.map((invite) => {
                      const expiresAt = new Date(invite.expires_at);
                      const hoursLeft = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)));
                      
                      return (
                        <div
                          key={invite.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/30"
                        >
                          <div>
                            <p className="font-medium">{invite.invitee_name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires in {hoursLeft}h
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => revokeInvite(invite.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setManageInvitesOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};

// Guild Card Component
const GuildCard = ({
  guild,
  onJoin,
  isInGuild,
  isMyGuild,
}: {
  guild: Guild;
  onJoin: () => void;
  isInGuild: boolean;
  isMyGuild: boolean;
}) => {
  return (
    <Card className={`border-border/50 bg-card/30 hover:border-primary/50 transition-all ${
      isMyGuild ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-orbitron">{guild.name}</CardTitle>
          <div className="flex items-center gap-2">
            {ACCESS_ICONS[guild.access_type]}
            {isMyGuild && (
              <Badge className="bg-primary/20 text-primary border-primary/50">
                Your Guild
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {guild.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{guild.member_count}/{guild.max_members}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">{guild.total_power.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Master: {guild.master_name}
          </span>
          {!isInGuild && guild.access_type === 'public' && (
            <Button size="sm" onClick={onJoin}>
              Join Guild
            </Button>
          )}
          {guild.access_type === 'invite_only' && !isMyGuild && (
            <Badge variant="outline" className="text-xs">
              Invite Only
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Guilds;
