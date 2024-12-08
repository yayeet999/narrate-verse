import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserCredits {
  credits_remaining: number;
  subscription_tiers: {
    name: string;
  } | null;
}

export const useUserCredits = () => {
  return useQuery({
    queryKey: ['userCredits'],
    queryFn: async () => {
      console.log('Fetching user credits...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }
      
      if (!session?.user?.id) {
        console.error('No session found when fetching credits');
        throw new Error('No session found');
      }

      console.log('Fetching credits for user:', session.user.id);
      
      const { data: existingCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select(`
          credits_remaining,
          subscription_tiers (
            name
          )
        `)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching credits:', fetchError);
        throw fetchError;
      }

      if (existingCredits) {
        console.log('Found existing credits:', existingCredits);
        return existingCredits as UserCredits;
      }

      console.log('No credits found, creating new credits record...');
      
      const { data: freeTier, error: tierError } = await supabase
        .from('subscription_tiers')
        .select('id')
        .eq('name', 'Free')
        .single();

      if (tierError) {
        console.error('Error fetching free tier:', tierError);
        throw tierError;
      }

      if (!freeTier?.id) {
        console.error('No free tier found');
        return {
          credits_remaining: 0,
          subscription_tiers: {
            name: 'Free'
          }
        } as UserCredits;
      }

      const { data: newCredits, error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: session.user.id,
          credits_remaining: 10,
          tier_id: freeTier.id,
          last_reset: new Date().toISOString()
        })
        .select(`
          credits_remaining,
          subscription_tiers (
            name
          )
        `)
        .single();

      if (insertError) {
        console.error('Error creating user credits:', insertError);
        throw insertError;
      }

      console.log('Created new credits:', newCredits);
      return newCredits as UserCredits;
    },
  });
};