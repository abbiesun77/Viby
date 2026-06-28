import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../lib/supabase/server";
import { resolveAiConfig, debitForAction } from "../../../../../../../lib/ai/config";
import { generateImageWithRef } from "../../../../../../../lib/ai/client";
import { buildAssetImagePrompt } from "../../../../../../../lib/ai/prompts";

export async function POST(
  request: Request,
  { params }: { params: { projectId: string; assetId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { description } = await request.json();
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "请填写描述" }, { status: 400 });
  }

  // Load asset + project visual_feel in one join
  const { data: asset } = await supabase
    .from("assets")
    .select("asset_type, projects(visual_feel)")
    .eq("id", params.assetId)
    .eq("project_id", params.projectId)
    .single();

  const visualFeel = (asset as any)?.projects?.visual_feel as string | null;

  // Find reference image:
  // - Character/prop: use first same-type asset with an image (consistency anchor)
  // - Scene: prefer style anchor (ST*), fall back to first scene image
  let referenceUrl: string | null = null;

  if (asset?.asset_type === "scene") {
    // Style anchor has priority for scene consistency
    const { data: styleRef } = await supabase
      .from("assets")
      .select("image_url")
      .eq("project_id", params.projectId)
      .eq("asset_type", "style")
      .not("image_url", "is", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    referenceUrl = styleRef?.image_url ?? null;
  }

  if (!referenceUrl && asset?.asset_type !== "style") {
    // Same-type reference anchor (C01 → C02, S01 → S02, etc.)
    const { data: sameTypeRef } = await supabase
      .from("assets")
      .select("image_url")
      .eq("project_id", params.projectId)
      .eq("asset_type", asset?.asset_type ?? "character")
      .not("image_url", "is", null)
      .neq("id", params.assetId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    referenceUrl = sameTypeRef?.image_url ?? null;
  }

  const enhancedPrompt = buildAssetImagePrompt(description.trim(), visualFeel, asset?.asset_type);

  try {
    const aiConfig = await resolveAiConfig(supabase, user.id);
    await debitForAction(supabase, user.id, "asset_generation", aiConfig.mode);
    const imageUrl = await generateImageWithRef(enhancedPrompt, aiConfig, referenceUrl);

    await supabase
      .from("assets")
      .update({ description: description.trim(), image_url: imageUrl, status: "generated" })
      .eq("id", params.assetId)
      .eq("project_id", params.projectId);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    if (message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Credit 不足，请在设置中切换到自己的 API Key。" },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
