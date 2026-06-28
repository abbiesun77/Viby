import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "../../../../lib/supabase/server";

const schema = z.object({
  mode: z.enum(["viby_ai", "byok"]),
  // Text provider
  byokBaseUrl: z.string().trim().optional(),
  byokApiKey: z.string().trim().optional(),
  byokTextModel: z.string().trim().optional(),
  // Image provider (optional; falls back to text if absent)
  byokImageBaseUrl: z.string().trim().optional(),
  byokImageApiKey: z.string().trim().optional(),
  byokImageModel: z.string().trim().optional(),
}).superRefine((v, ctx) => {
  if (v.mode === "byok") {
    if (!v.byokBaseUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["byokBaseUrl"], message: "请填写文本 AI 的 Base URL" });
    if (!v.byokApiKey) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["byokApiKey"], message: "请填写文本 AI 的 API Key" });
  }
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        active_ai_mode: body.mode,
        byok_base_url: body.byokBaseUrl ?? null,
        byok_api_key_encrypted: body.byokApiKey ?? null,
        byok_text_model: body.byokTextModel || null,
        byok_image_base_url: body.byokImageBaseUrl || null,
        byok_image_api_key: body.byokImageApiKey || null,
        byok_image_model: body.byokImageModel || null,
      }).eq("id", user.id);
    }
  } catch { /* no Supabase env */ }

  return NextResponse.json({ mode: body.mode });
}
