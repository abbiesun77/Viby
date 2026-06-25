import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { generateScenesForProject } from "../../../../../../lib/db/scene-service";

// POST: confirm script, generate scenes+shots+asset gaps, advance to scenes tab.
export async function POST(
  _request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { data: script } = await supabase
    .from("scripts")
    .select("id, content")
    .eq("project_id", params.projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!script) {
    return NextResponse.json({ error: "尚无剧本" }, { status: 400 });
  }

  await supabase
    .from("scripts")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", script.id);

  try {
    await generateScenesForProject(supabase, user.id, params.projectId, script.content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "场景生成失败";
    if (message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Credit 不足，请在设置中切换到自己的 API Key。" },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await supabase
    .from("projects")
    .update({ workflow_state: "scenes", updated_at: new Date().toISOString() })
    .eq("id", params.projectId);

  return NextResponse.json({ ok: true, workflowState: "scenes" });
}
