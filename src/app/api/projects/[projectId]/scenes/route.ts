import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { generateScenesForProject } from "../../../../../lib/db/scene-service";

// GET: scenes + nested shots for a project.
export async function GET(
  _request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { data: scenes } = await supabase
    .from("scenes")
    .select("id, scene_number, title")
    .eq("project_id", params.projectId)
    .order("scene_number", { ascending: true });

  const { data: shots } = await supabase
    .from("shots")
    .select("id, scene_id, shot_number, framing, subject, action, mood")
    .eq("project_id", params.projectId)
    .order("shot_number", { ascending: true });

  return NextResponse.json({ scenes: scenes ?? [], shots: shots ?? [] });
}

// POST: regenerate scenes from the current script.
export async function POST(
  _request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { data: script } = await supabase
    .from("scripts")
    .select("content")
    .eq("project_id", params.projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (!script) return NextResponse.json({ error: "尚无剧本" }, { status: 400 });

  try {
    await generateScenesForProject(supabase, user.id, params.projectId, script.content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "场景生成失败";
    const status = message === "INSUFFICIENT_CREDITS" ? 402 : 500;
    return NextResponse.json(
      {
        error:
          status === 402
            ? "Credit 不足，请在设置中切换到自己的 API Key。"
            : message,
      },
      { status }
    );
  }

  return NextResponse.json({ ok: true });
}
