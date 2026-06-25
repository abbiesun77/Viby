import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../lib/supabase/server";
import { resolveAiConfig, debitForAction } from "../../../../../../../lib/ai/config";
import { generateImage } from "../../../../../../../lib/ai/client";

// POST: generate an image for this asset and store the URL.
export async function POST(
  request: Request,
  { params }: { params: { projectId: string; assetId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { description } = await request.json();
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "请填写描述" }, { status: 400 });
  }

  try {
    const aiConfig = await resolveAiConfig(supabase, user.id);
    await debitForAction(supabase, user.id, "asset_generation", aiConfig.mode);
    const imageUrl = await generateImage(description.trim(), aiConfig);

    await supabase
      .from("assets")
      .update({
        description: description.trim(),
        image_url: imageUrl,
        status: "generated",
      })
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
