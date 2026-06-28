import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../lib/supabase/server";
import { resolveAiConfig, debitForAction } from "../../../../../../../lib/ai/config";
import { generateImage, type AspectRatio } from "../../../../../../../lib/ai/client";
import { buildStoryboardPrompt } from "../../../../../../../lib/ai/prompts";

/** Parse a duration string like "5秒", "30秒", "1分30秒" into seconds. */
function parseDurationSeconds(raw: string | null | undefined): number {
  if (!raw) return 30;
  const mins = raw.match(/(\d+)\s*分/);
  const secs = raw.match(/(\d+)\s*秒/);
  return (mins ? parseInt(mins[1]) * 60 : 0) + (secs ? parseInt(secs[1]) : 0) || 30;
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string; sceneId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const aspectRatio: AspectRatio = body.aspectRatio === "9:16" ? "9:16" : "16:9";
  const customPrompt: string | undefined = body.customPrompt;

  // Load scene + shots
  const { data: scene } = await supabase
    .from("scenes").select("id, title")
    .eq("id", params.sceneId).eq("project_id", params.projectId).single();
  if (!scene) return NextResponse.json({ error: "场景不存在" }, { status: 404 });

  const { data: shots } = await supabase
    .from("shots").select("framing, subject, action, mood")
    .eq("scene_id", params.sceneId).order("shot_number", { ascending: true });

  // Load project duration + total scene count to calculate per-scene duration
  const { data: project } = await supabase
    .from("projects").select("duration")
    .eq("id", params.projectId).single();

  const { count: sceneCount } = await supabase
    .from("scenes").select("id", { count: "exact", head: true })
    .eq("project_id", params.projectId);

  const totalSecs = parseDurationSeconds(project?.duration);
  const perSceneSecs = Math.round(totalSecs / Math.max(sceneCount ?? 1, 1));

  // gridSize = number of shots (one panel per shot), capped 1-9
  const shotList = shots ?? [];
  const gridSize: number = body.gridSize ?? Math.max(1, Math.min(shotList.length || 1, 9));

  const prompt =
    customPrompt?.trim() ||
    buildStoryboardPrompt(scene.title, shotList, gridSize, aspectRatio, null, perSceneSecs);

  try {
    const aiConfig = await resolveAiConfig(supabase, user.id);
    await debitForAction(supabase, user.id, "storyboard_generation", aiConfig.mode);
    const imageUrl = await generateImage(prompt, aiConfig, aspectRatio);

    const { data: existing } = await supabase
      .from("storyboards").select("id")
      .eq("scene_id", params.sceneId).limit(1).single();

    if (existing) {
      await supabase.from("storyboards").update({
        grid_size: gridSize, aspect_ratio: aspectRatio,
        image_url: imageUrl, prompt, status: "done",
      }).eq("id", existing.id);
    } else {
      await supabase.from("storyboards").insert({
        scene_id: params.sceneId, project_id: params.projectId,
        grid_size: gridSize, aspect_ratio: aspectRatio,
        image_url: imageUrl, prompt, status: "done",
      });
    }

    return NextResponse.json({ imageUrl, prompt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    if (message === "INSUFFICIENT_CREDITS")
      return NextResponse.json({ error: "Credit 不足，请在设置中切换到自己的 API Key。" }, { status: 402 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
