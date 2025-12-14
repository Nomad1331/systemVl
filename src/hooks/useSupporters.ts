import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Supporter, SupporterTier, TIER_ORDER } from '@/lib/supporters';

export const useSupporters = () => {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupporters = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('supporters')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Sort by tier (highest first), then by display_order
      const sorted = (data || []).sort((a, b) => {
        const tierIndexA = TIER_ORDER.indexOf(a.tier as SupporterTier);
        const tierIndexB = TIER_ORDER.indexOf(b.tier as SupporterTier);
        if (tierIndexA !== tierIndexB) {
          return tierIndexA - tierIndexB;
        }
        return a.display_order - b.display_order;
      });

      setSupporters(sorted as Supporter[]);
    } catch (err) {
      console.error('Error fetching supporters:', err);
      setError('Failed to load supporters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupporters();
  }, []);

  return {
    supporters,
    loading,
    error,
    refetch: fetchSupporters,
  };
};
