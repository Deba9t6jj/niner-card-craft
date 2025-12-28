import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

export async function saveUserProfile(profile: any) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile)
    .select();
  
  if (error) throw error;
  return data;
}

export async function getUserProfile(fid: number) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('fid', fid)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}