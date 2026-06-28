import type { SupabaseClient } from "@supabase/supabase-js";
import type { AiConfig } from "./client";
import { COSTS, type CreditAction } from "../credits";

export async function resolveAiConfig(
  supabase: SupabaseClient,
  userId: string
): Promise<AiConfig> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "active_ai_mode, byok_base_url, byok_api_key_encrypted, byok_text_model, byok_image_base_url, byok_image_api_key, byok_image_model"
    )
    .eq("id", userId)
    .single();

  if (error || !data) throw new Error("无法读取用户的 AI 配置。");

  const mode = data.active_ai_mode === "byok" ? "byok" : "viby_ai";
  return {
    mode,
    // Text provider (falls back to shared byok_base_url)
    byokBaseUrl: data.byok_base_url ?? undefined,
    byokApiKey: data.byok_api_key_encrypted ?? undefined,
    byokTextModel: data.byok_text_model ?? undefined,
    // Image provider (separate config; falls back to text provider if not set)
    byokImageBaseUrl: data.byok_image_base_url ?? data.byok_base_url ?? undefined,
    byokImageApiKey: data.byok_image_api_key ?? data.byok_api_key_encrypted ?? undefined,
    byokImageModel: data.byok_image_model ?? undefined,
  };
}

/**
 * Atomically debit credits for a Viby AI action and record it in the ledger.
 * BYOK actions are free (user pays their own provider). Returns the new balance.
 * Throws if the balance is insufficient in viby_ai mode.
 */
export async function debitForAction(
  supabase: SupabaseClient,
  userId: string,
  action: CreditAction,
  mode: AiConfig["mode"]
): Promise<number> {
  if (mode === "byok") {
    return -1; // sentinel: not tracked for BYOK
  }

  const cost = COSTS[action];

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("viby_credit_balance")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new Error("无法读取 Credit 余额。");
  }

  if (profile.viby_credit_balance < cost) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  const newBalance = profile.viby_credit_balance - cost;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ viby_credit_balance: newBalance })
    .eq("id", userId);

  if (updateError) {
    throw new Error("Credit 扣除失败。");
  }

  await supabase.from("credit_ledger").insert({
    user_id: userId,
    action,
    delta: -cost,
  });

  return newBalance;
}
