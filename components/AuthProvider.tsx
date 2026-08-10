"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/client";

export type CustomerProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
};

export type CustomerRewards = {
  user_id: string;
  paid_order_count: number;
  welcome_discount_used: boolean;
  lifetime_spend_pence: number;
  reward_points: number;
  tier: string;
  store_credit_pence: number;
  referral_code: string | null;
  referred_by: string | null;
  referral_rewarded: boolean;
};

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  profile: CustomerProfile | null;
  rewards: CustomerRewards | null;
  discountPercent: number;
  discountLabel: string;
  refreshCustomer: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getBrowserSupabase();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [rewards, setRewards] = useState<CustomerRewards | null>(null);

  const loadCustomer = useCallback(
    async (nextUser?: User | null) => {
      if (!supabase) {
        setUser(null);
        setProfile(null);
        setRewards(null);
        setLoading(false);
        return;
      }

      let resolvedUser = nextUser;
      if (resolvedUser === undefined) {
        const { data } = await supabase.auth.getUser();
        resolvedUser = data.user;
      }

      setUser(resolvedUser || null);

      if (!resolvedUser) {
        setProfile(null);
        setRewards(null);
        setLoading(false);
        return;
      }

      const [profileResult, rewardsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,email,first_name,last_name,phone,marketing_opt_in")
          .eq("id", resolvedUser.id)
          .maybeSingle(),
        supabase
          .from("customer_rewards")
          .select("user_id,paid_order_count,welcome_discount_used,lifetime_spend_pence,reward_points,tier,store_credit_pence,referral_code,referred_by,referral_rewarded")
          .eq("user_id", resolvedUser.id)
          .maybeSingle(),
      ]);

      setProfile((profileResult.data as CustomerProfile | null) || null);
      setRewards((rewardsResult.data as CustomerRewards | null) || null);
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    loadCustomer();

    const { data } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      window.setTimeout(() => void loadCustomer(session?.user || null), 0);
    });

    return () => data.subscription.unsubscribe();
  }, [loadCustomer, supabase]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRewards(null);
    window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "Signed out securely." }));
  }

  const paidOrders = rewards?.paid_order_count || 0;
  const discountPercent = user ? (paidOrders > 0 ? 10 : 20) : 0;
  const discountLabel = !user
    ? "Guest pricing"
    : paidOrders > 0
      ? "Returning customer · 10% loyalty pricing"
      : "New member · 20% first-order benefit";

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: Boolean(supabase),
      loading,
      user,
      profile,
      rewards,
      discountPercent,
      discountLabel,
      refreshCustomer: () => loadCustomer(user),
      signOut,
    }),
    [discountLabel, discountPercent, loading, loadCustomer, profile, rewards, supabase, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
