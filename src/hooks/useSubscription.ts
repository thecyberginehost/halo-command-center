import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

type SubscriptionPlan = Tables<"subscription_plans">;
type UserSubscription = Tables<"user_subscriptions">;
type OrganizationUsage = Tables<"organization_usage">;

interface SubscriptionData {
  subscription: UserSubscription | null;
  plan: SubscriptionPlan | null;
  usage: OrganizationUsage | null;
  loading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SubscriptionData>({
    subscription: null,
    plan: null,
    usage: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchSubscriptionData = async () => {
      try {
        // Get user's active subscription
        const { data: subscription, error: subError } = await supabase
          .from("user_subscriptions")
          .select(`
            *,
            subscription_plans (*)
          `)
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subError) throw subError;

        // Get organization usage if subscription exists
        let usage = null;
        if (subscription?.tenant_id) {
          const { data: usageData, error: usageError } = await supabase
            .from("organization_usage")
            .select("*")
            .eq("tenant_id", subscription.tenant_id)
            .maybeSingle();

          if (usageError && usageError.code !== 'PGRST116') {
            throw usageError;
          }
          usage = usageData;
        }

        setData({
          subscription,
          plan: subscription?.subscription_plans || null,
          usage,
          loading: false,
          error: null
        });
      } catch (error: any) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchSubscriptionData();
  }, [user]);

  const checkOrganizationLimit = async (tenantId: string) => {
    try {
      const { data, error } = await supabase.rpc("check_organization_limit", {
        p_tenant_id: tenantId
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error checking organization limit:", error);
      return { allowed: false, reason: "Error checking limits" };
    }
  };

  return {
    ...data,
    checkOrganizationLimit
  };
};

export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("price_monthly", { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return { plans, loading, error };
};