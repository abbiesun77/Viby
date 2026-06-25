import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { resolveAiConfig, debitForAction } from "../../../../../../lib/ai/config";
import { generateText } from "../../../../../../lib/ai/client";

// POST: apply a natural-language edit instruction to the script, return new text.
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { instruction, content } = await request.json();
  if (typeof instruction !== "string" || typeof content !== "string") {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }

  try {
    const aiConfig = await resolveAiConfig(supabase, user.id);
    await debitForAction(supabase, user.id, "script_generation", aiConfig.mode);

    const prompt = `你是剧本编辑助手。根据用户的修改要求，调整下面的剧本，保持 == 场景 N：标题 == 的分场标注格式，只返回修改后的完整剧本，不要解释。

修改要求：${instruction}

当前剧本：
${content}`;

    const updated = await generateText(prompt, aiConfig);

    // Persist the new version.
    const { data: existing } = await supabase
      .from("scripts")
      .select("id")
      .eq("project_id", params.projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (existing) {
      await supabase.from("scripts").update({ content: updated }).eq("id", existing.id);
    }

    return NextResponse.json({ content: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "调整失败";
    if (message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Credit 不足，请在设置中切换到自己的 API Key。" },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
