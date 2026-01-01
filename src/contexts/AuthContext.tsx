import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, hunterName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithDiscord: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Link Discord ID if signed in with Discord - defer to avoid blocking
      if (session?.user) {
        setTimeout(() => linkDiscordId(session.user), 0);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth event:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Link Discord ID on sign in - defer to avoid blocking auth state change
      if (session?.user && _event === 'SIGNED_IN') {
        setTimeout(() => linkDiscordId(session.user), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to extract Discord ID from user object
  const extractDiscordId = (user: User): string | null => {
    // Method 1: Check user_metadata.provider_id (most common)
    if (user.user_metadata?.provider_id) {
      return user.user_metadata.provider_id;
    }
    
    // Method 2: Check identities array (more reliable for OAuth)
    const discordIdentity = user.identities?.find(i => i.provider === 'discord');
    if (discordIdentity?.id) {
      return discordIdentity.id;
    }
    
    // Method 3: Check for sub in user_metadata (Discord OAuth returns this)
    if (user.user_metadata?.sub && user.app_metadata?.provider === 'discord') {
      return user.user_metadata.sub;
    }
    
    return null;
  };

  // Helper function to link Discord ID with timeout protection
  const linkDiscordId = async (user: User) => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Discord linking timeout')), 5000)
    );
    
    try {
      await Promise.race([
        (async () => {
          console.log('Checking Discord linking for user:', user.id);
          
          // Extract Discord ID using multiple methods
          const discordId = extractDiscordId(user);
          
          if (!discordId) {
            console.log('No Discord ID found - user may have signed up with email');
            return;
          }
          
          console.log('Found Discord ID:', discordId);
          
          // Check if profile exists and needs updating
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('discord_id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return;
          }
          
          if (!profile) {
            console.log('No profile found - will be created by database trigger');
            return;
          }
          
          // Update Discord ID if missing or empty
          if (!profile.discord_id || profile.discord_id === '') {
            console.log('Updating profile with Discord ID:', discordId);
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                discord_id: discordId,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);
            
            if (updateError) {
              console.error('Error updating Discord ID:', updateError);
            } else {
              console.log('✅ Discord ID successfully linked!');
            }
          } else {
            console.log('Discord ID already linked:', profile.discord_id);
          }
        })(),
        timeoutPromise
      ]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Discord linking timeout') {
        console.warn('⚠️ Discord linking timed out - continuing anyway');
      } else {
        console.error('Error in linkDiscordId:', error);
      }
    }
  };

  const signUp = async (email: string, password: string, hunterName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          hunter_name: hunterName,
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signInWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });
    
    return { error: error as Error | null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithDiscord,
      resetPassword,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
