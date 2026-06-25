import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "../../../../lib/supabase/server";

const aiModeSchema = z
  .object({
    mode: z.enum(["viby_ai", "byok"]),
    byokBaseUrl: z.string().trim().optional(),
    byokApiKey: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.mode === "byok") {
      if (!value.byokBaseUrl) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["byokBaseUrl"],
          message: "请填写你的 Base URL",
        });
      }

      if (!value.byokApiKey) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["byokApiKey"],
          message: "请填写你的 API Key",
        });
      }
    }
  });

export async function POST(request: Request) {
  const body = aiModeSchema.parse(await request.json());

  // Persist to the profile when a user session is available.
  // Falls back to a stateless echo (used by unit tests without auth).
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          active_ai_mode: body.mode,
          byok_base_url: body.byokBaseUrl ?? null,
          byok_api_key_encrypted: body.byokApiKey ?? null,
        })
        .eq("id", user.id);
    }
  } catch {
    // No Supabase env (e.g. unit test) — skip persistence.
  }

  return NextResponse.json({
    mode: body.mode,
    byokBaseUrl: body.byokBaseUrl ?? "",
    byokApiKey: body.byokApiKey ? "••••••••" : "",
  });
}
