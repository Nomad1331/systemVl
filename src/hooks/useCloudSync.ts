import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { storage, PlayerStats } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface CloudProfile {
  id: string;
  user_id: string;
  hunter_name: string;
  avatar: string | null;
  title: string | null;
  discord_id: string | null;
  is_public: boolean;
}

interface CloudPlayerStats {
  id: string;
  user_id: string;
  level: number;
  total_xp: number;
  rank: string;
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  sense: number;
  available_points: number;
  gold: number;
  gems: number;
  credits: number;
  selected_card_frame: string | null;
  unlocked_card_frames: string[] | null;
  unlocked_classes: string[] | null;
}

export const useCloudSync = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [cloudProfile, setCloudProfile] = useState<CloudProfile | null>(null);
  const [cloudStats, setCloudStats] = useState<CloudPlayerStats | null>(null);

  // Fetch cloud data and sync when user logs in
  useEffect(() => {
    if (user) {
      fetchCloudData().then((cloudData) => {
        if (cloudData?.profile && cloudData?.stats) {
          // Cloud data exists - sync cloud to local
          syncCloudToLocal(cloudData.profile, cloudData.stats);
        } else {
          // No cloud data yet - migrate local to cloud if there's progress
          const localStats = storage.getStats();
          const hasLocalProgress = localStats.level > 1 || localStats.totalXP > 0;
          if (hasLocalProgress) {
            migrateLocalToCloud();
          }
        }
      });
    } else {
      setCloudProfile(null);
      setCloudStats(null);
    }
  }, [user]);

  const fetchCloudData = async () => {
    if (!user) return null;

    try {
      const [profileRes, statsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('player_stats').select('*').eq('user_id', user.id).single(),
      ]);

      if (profileRes.data) setCloudProfile(profileRes.data);
      if (statsRes.data) setCloudStats(statsRes.data);
      
      return { profile: profileRes.data, stats: statsRes.data };
    } catch (error) {
      console.error('Error fetching cloud data:', error);
      return null;
    }
  };

  // Sync cloud data to local storage - only if cloud has more progress
  const syncCloudToLocal = (profile: CloudProfile, stats: CloudPlayerStats) => {
    const currentLocalStats = storage.getStats();
    
    // Calculate total power to determine which data is more progressed
    const cloudPower = stats.strength + stats.agility + stats.intelligence + stats.vitality + stats.sense;
    const localPower = currentLocalStats.strength + currentLocalStats.agility + currentLocalStats.intelligence + currentLocalStats.vitality + currentLocalStats.sense;
    
    // Use cloud data if it has more progress (higher level, XP, or power)
    const cloudHasMoreProgress = stats.level > currentLocalStats.level || 
                                  stats.total_xp > currentLocalStats.totalXP ||
                                  (stats.level === currentLocalStats.level && cloudPower > localPower);
    
    // For avatar: prefer local custom image (base64) over cloud, unless cloud also has custom image
    // Custom images are base64 data URLs that start with "data:"
    const isLocalCustomImage = currentLocalStats.avatar?.startsWith('data:');
    const isCloudCustomImage = profile.avatar?.startsWith('data:');
    
    // Use local avatar if it's a custom image, otherwise use cloud avatar
    const resolvedAvatar = isLocalCustomImage 
      ? currentLocalStats.avatar 
      : (profile.avatar || currentLocalStats.avatar || 'default');
    
    // Always sync profile data (name, avatar, title) from cloud
    // But for stats, only sync if cloud has more progress
    const updatedStats = {
      ...currentLocalStats,
      name: profile.hunter_name || currentLocalStats.name,
      avatar: resolvedAvatar,
      title: profile.title || currentLocalStats.title || 'Awakened Hunter',
      // Only override stats if cloud has more progress
      level: cloudHasMoreProgress ? stats.level : currentLocalStats.level,
      totalXP: cloudHasMoreProgress ? stats.total_xp : currentLocalStats.totalXP,
      rank: cloudHasMoreProgress ? stats.rank : currentLocalStats.rank,
      strength: cloudHasMoreProgress ? stats.strength : currentLocalStats.strength,
      agility: cloudHasMoreProgress ? stats.agility : currentLocalStats.agility,
      intelligence: cloudHasMoreProgress ? stats.intelligence : currentLocalStats.intelligence,
      vitality: cloudHasMoreProgress ? stats.vitality : currentLocalStats.vitality,
      sense: cloudHasMoreProgress ? stats.sense : currentLocalStats.sense,
      availablePoints: cloudHasMoreProgress ? stats.available_points : currentLocalStats.availablePoints,
      gold: cloudHasMoreProgress ? stats.gold : currentLocalStats.gold,
      gems: cloudHasMoreProgress ? stats.gems : currentLocalStats.gems,
      credits: cloudHasMoreProgress ? stats.credits : currentLocalStats.credits,
      selectedCardFrame: stats.selected_card_frame || currentLocalStats.selectedCardFrame || 'default',
      unlockedCardFrames: stats.unlocked_card_frames || currentLocalStats.unlockedCardFrames || ['default'],
      unlockedClasses: stats.unlocked_classes || currentLocalStats.unlockedClasses || [],
      isFirstTime: false, // User already has an account, so skip first-time setup
    };
    
    storage.setStats(updatedStats);
    
    // Trigger a storage event so other components re-read the updated stats
    window.dispatchEvent(new Event('storage'));
    
    // If local had more progress, sync it to cloud
    if (!cloudHasMoreProgress && (currentLocalStats.level > 1 || currentLocalStats.totalXP > 0)) {
      // Sync local to cloud in background
      setTimeout(() => syncToCloud(updatedStats), 500);
    }
    
    toast({
      title: "Welcome Back, Hunter!",
      description: cloudHasMoreProgress ? "Your progress has been restored from the cloud." : "Your local progress is intact.",
    });
  };

  // Migrate localStorage data to cloud on first login
  const migrateLocalToCloud = async () => {
    if (!user) return false;

    setSyncing(true);
    try {
      const localStats = storage.getStats();
      
      // Check if user has meaningful local progress
      const hasLocalProgress = localStats.level > 1 || localStats.totalXP > 0;
      
      if (!hasLocalProgress) {
        setSyncing(false);
        return true; // Nothing to migrate
      }

      // Update cloud profile with local data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          hunter_name: localStats.name,
          avatar: localStats.avatar || 'default',
          title: localStats.title || 'Awakened Hunter',
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update cloud stats with local data
      const { error: statsError } = await supabase
        .from('player_stats')
        .update({
          level: localStats.level,
          total_xp: localStats.totalXP,
          rank: localStats.rank,
          strength: localStats.strength,
          agility: localStats.agility,
          intelligence: localStats.intelligence,
          vitality: localStats.vitality,
          sense: localStats.sense,
          available_points: localStats.availablePoints,
          gold: localStats.gold,
          gems: localStats.gems,
          credits: localStats.credits,
          selected_card_frame: localStats.selectedCardFrame || 'default',
          unlocked_card_frames: localStats.unlockedCardFrames || ['default'],
          unlocked_classes: localStats.unlockedClasses || [],
        })
        .eq('user_id', user.id);

      if (statsError) throw statsError;

      await fetchCloudData();
      
      toast({
        title: "Progress Synced!",
        description: "Your local progress has been saved to the cloud.",
      });

      setSyncing(false);
      return true;
    } catch (error) {
      console.error('Error migrating local data:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync your progress. Please try again.",
        variant: "destructive",
      });
      setSyncing(false);
      return false;
    }
  };

  // Sync local stats to cloud
  const syncToCloud = async (stats: PlayerStats) => {
    if (!user) return false;

    try {
      // Update profile
      await supabase
        .from('profiles')
        .update({
          hunter_name: stats.name,
          avatar: stats.avatar || 'default',
          title: stats.title || 'Awakened Hunter',
        })
        .eq('user_id', user.id);

      // Update stats
      await supabase
        .from('player_stats')
        .update({
          level: stats.level,
          total_xp: stats.totalXP,
          rank: stats.rank,
          strength: stats.strength,
          agility: stats.agility,
          intelligence: stats.intelligence,
          vitality: stats.vitality,
          sense: stats.sense,
          available_points: stats.availablePoints,
          gold: stats.gold,
          gems: stats.gems,
          credits: stats.credits,
          selected_card_frame: stats.selectedCardFrame || 'default',
          unlocked_card_frames: stats.unlockedCardFrames || ['default'],
          unlocked_classes: stats.unlockedClasses || [],
        })
        .eq('user_id', user.id);

      return true;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      return false;
    }
  };

  // Update privacy setting
  const setProfilePublic = async (isPublic: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_public: isPublic })
        .eq('user_id', user.id);

      if (error) throw error;

      setCloudProfile(prev => prev ? { ...prev, is_public: isPublic } : null);
      
      toast({
        title: isPublic ? "Profile Public" : "Profile Private",
        description: isPublic 
          ? "Other hunters can now see your profile on leaderboards."
          : "Your profile is now hidden from leaderboards.",
      });

      return true;
    } catch (error) {
      console.error('Error updating privacy:', error);
      return false;
    }
  };

  return {
    syncing,
    cloudProfile,
    cloudStats,
    fetchCloudData,
    migrateLocalToCloud,
    syncToCloud,
    syncCloudToLocal,
    setProfilePublic,
  };
};
