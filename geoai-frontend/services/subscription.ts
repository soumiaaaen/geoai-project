import { supabase } from "./supabaseClient";
import {
  currentYearMonth,
  getLimits,
  getQuotaLimit,
  normalizePlan,
  type PlanId,
} from "@/lib/plans";
import { ensureGuestSession } from "./guest";
import { api } from "./api";

export type UserSubscription = {
  plan: PlanId;
  analysesUsed: number;
  analysesLimit: number;
  yearMonth: string;
  planExpiresAt: string | null;
  isGuest?: boolean;
  quotaPeriod?: "day" | "month";
  quotaDay?: string | null;
};

export async function fetchSubscriptionFromSupabase(): Promise<UserSubscription | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const planRes = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  let plan = normalizePlan(planRes.data?.plan);
  const expires = planRes.data?.plan_expires_at;
  if (expires && plan !== "free") {
    if (new Date(expires) < new Date()) plan = "free";
  }

  const ym = currentYearMonth();
  const usageRes = await supabase
    .from("usage_monthly")
    .select("analysis_count")
    .eq("user_id", user.id)
    .eq("year_month", ym)
    .maybeSingle();

  const analysesUsed = usageRes.data?.analysis_count ?? 0;
  const limits = getLimits(plan);

  return {
    plan,
    analysesUsed,
    analysesLimit: limits.analysesPerMonth,
    yearMonth: ym,
    planExpiresAt: expires ?? null,
  };
}

export async function fetchSubscriptionFromApi(): Promise<UserSubscription | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    try {
      await ensureGuestSession();
    } catch {
      return null;
    }
  }

  try {
    const data = await api.get("/subscription/me");
    const plan = normalizePlan(data.plan);
    const limits = getLimits(plan);
    return {
      plan,
      analysesUsed: data.analysesUsed,
      analysesLimit: data.analysesLimit ?? getQuotaLimit(limits),
      yearMonth: data.yearMonth,
      planExpiresAt: null,
      isGuest: data.isGuest ?? plan === "guest",
      quotaPeriod: data.quotaPeriod ?? limits.quotaPeriod,
      quotaDay: data.quotaDay ?? null,
    };
  } catch {
    if (user) return fetchSubscriptionFromSupabase();
    return null;
  }
}

export async function ensureProfile(userId: string): Promise<void> {
  await supabase.from("profiles").upsert({ id: userId, plan: "free" }, { onConflict: "id" });
}
