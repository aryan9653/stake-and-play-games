import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          wallet_address: `0x${Math.random().toString(16).substr(2, 40)}`,
        })
        .select()
        .single();

      if (!createError) {
        setProfile(newProfile);
      }
    } else if (!error) {
      setProfile(data);
    }

    setLoading(false);
  };

  const updateBalance = async (gtAmount: number, usdtAmount: number) => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        gt_balance: Number(profile.gt_balance) + gtAmount,
        usdt_balance: Number(profile.usdt_balance) - usdtAmount,
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (!error) {
      setProfile(data);
    }
    return { data, error };
  };

  return { profile, loading, fetchProfile, updateBalance };
};