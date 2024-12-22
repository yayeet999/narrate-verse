import { supabase } from "@/integrations/supabase/client";

export type SubscriptionStatus = {
  isPaid: boolean;
  maxContent: number;
  features: string[];
};

export const getUserSubscriptionStatus = async (): Promise<SubscriptionStatus | null> => {
  try {
    console.log('Fetching user subscription status...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('No authenticated user found');
      return null;
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_tiers (
          type,
          max_content_count,
          features
        )
      `)
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    if (!data) {
      console.log('No active subscription found');
      return null;
    }

    console.log('Subscription data:', data);
    return {
      isPaid: data.subscription_tiers.type === 'paid',
      maxContent: data.subscription_tiers.max_content_count,
      features: data.subscription_tiers.features
    };
  } catch (error) {
    console.error('Error in getUserSubscriptionStatus:', error);
    return null;
  }
};