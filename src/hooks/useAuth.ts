import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useWallet } from './useWallet';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { account, isConnected } = useWallet();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (!error && data.user) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: data.user.id,
          wallet_address: account || `0x${Math.random().toString(16).substr(2, 40)}`,
        });
      
      if (profileError) console.error('Profile creation error:', profileError);
    }
    return { data, error };
  };

  const signOut = () => supabase.auth.signOut();

  const signInWithWallet = async () => {
    if (!account) return { data: null, error: { message: 'No wallet connected' } };
    
    // Create or get user with wallet address as email
    const walletEmail = `${account.toLowerCase()}@wallet.local`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: walletEmail,
      password: account, // Use wallet address as password
    });
    
    if (error && error.message.includes('Invalid login credentials')) {
      // User doesn't exist, create account
      return await signUpWithWallet();
    }
    
    return { data, error };
  };

  const signUpWithWallet = async () => {
    if (!account) return { data: null, error: { message: 'No wallet connected' } };
    
    const walletEmail = `${account.toLowerCase()}@wallet.local`;
    const { data, error } = await supabase.auth.signUp({
      email: walletEmail,
      password: account,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          wallet_address: account
        }
      }
    });
    
    if (!error && data.user) {
      // Create profile with actual wallet address
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: data.user.id,
          wallet_address: account,
        });
      
      if (profileError) console.error('Profile creation error:', profileError);
    }
    
    return { data, error };
  };

  return { user, loading, signIn, signUp, signOut, signInWithWallet, signUpWithWallet, account, isConnected };
};