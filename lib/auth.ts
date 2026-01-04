import { supabase } from './supabaseClient';

export async function ensureProfile(user: any) {
  if (!user?.id) return null;
  try {
    // try select
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) return data;
    // insert profile (id must equal auth.uid())
    const display_name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null;
    const avatar_url = user.user_metadata?.avatar_url || null;
    const insertRes = await supabase.from('profiles').insert({ id: user.id, display_name, avatar_url }).select().single();
    if (insertRes.error) {
      // ignore errors (might be race conditions)
      console.warn('ensureProfile insert error', insertRes.error);
    }
    return insertRes.data || null;
  } catch (err) {
    console.warn('ensureProfile failed', err);
    return null;
  }
}

export async function getProfile(userId: string) {
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data || null;
  } catch (err) {
    return null;
  }
}
