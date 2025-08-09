import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { trackUserLogin, trackUserRegistration } from '@/lib/tracking';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user role when user changes
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
      if (error) throw error;
      setUserRole(data || 'member');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('member'); // Default fallback
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch role when user logs in
        if (session?.user) {
          fetchUserRole(session.user.id);
          
          // If this is a new user sign up, schedule onboarding emails
          if (event === 'SIGNED_IN') {
            // Check if this is a new user by checking user metadata or creation time
            const isNewUser = session.user.created_at && 
              (new Date().getTime() - new Date(session.user.created_at).getTime()) < 60000; // Within 1 minute
            
            if (isNewUser) {
              try {
                await supabase.functions.invoke('schedule-onboarding-emails', {
                  body: {
                    user_id: session.user.id,
                    email: session.user.email,
                    user_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
                  }
                });
                console.log('Onboarding emails scheduled successfully');
              } catch (error) {
                console.error('Error scheduling onboarding emails:', error);
              }
            }
          }
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserRole(session.user.id);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error('getSession error:', error);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      trackUserLogin('email');
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || email.split('@')[0]
        }
      }
    });
    
    if (!error) {
      trackUserRegistration('email');
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}