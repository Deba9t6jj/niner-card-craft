import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Activity {
  id: string;
  fid: number | null;
  username: string;
  avatar_url: string | null;
  action_type: 'score_updated' | 'nft_minted' | 'tier_achieved' | 'joined';
  action_data: Record<string, unknown>;
  created_at: string;
}

export const useActivityFeed = (limit: number = 20) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial activities
  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      setActivities((data as Activity[]) || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Set up real-time subscription
  useEffect(() => {
    fetchActivities();

    // Subscribe to new activities
    const channel = supabase
      .channel('live-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          console.log('New activity received:', payload);
          const newActivity = payload.new as Activity;
          setActivities((prev) => [newActivity, ...prev.slice(0, limit - 1)]);
        }
      )
      .subscribe((status) => {
        console.log('Activity feed subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities, limit]);

  return { activities, isLoading, error, refresh: fetchActivities };
};
