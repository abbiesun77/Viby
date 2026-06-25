import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";

// POST: add a new blank shot to a scene.
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { sceneId } = await request.json();
  if (typeof sceneId !== "string") {
    return NextResponse.json({ error: "缺少场景 ID" }, { status: 400 });
  }

  // Next shot number within this scene.
  const { count } = await supabase
    .from("shots")
    .select("id", { count: "exact", head: true })
    .eq("scene_id", sceneId);

  const { data, error } = await supabase
    .from("shots")
    .insert({
      scene_id: sceneId,
      project_id: params.projectId,
      shot_number: (count ?? 0) + 1,
      framing: "",
      subject: "",
      action: "",
      mood: "",
    })
    .select("id, scene_id, shot_number, framing, subject, action, mood")
    .single();

  if (error) return NextResponse.json({ error: "添加失败" }, { status: 500 });
  return NextResponse.json({ shot: data }, { status: 201 });
}
