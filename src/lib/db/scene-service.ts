import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAiConfig, debitForAction } from "../ai/config";
import { generateText } from "../ai/client";
import {
  buildScenePrompt,
  buildAssetGapPrompt,
  parseJsonFromText,
} from "../ai/prompts";

interface SceneShape {
  scene_number: number;
  title: string;
  shots: {
    shot_number: number;
    framing?: string;
    subject?: string;
    action?: string;
    mood?: string;
  }[];
}

interface AssetShape {
  asset_type: "character" | "scene" | "prop" | "style";
  name: string;
  description?: string;
  priority?: "required" | "suggested";
}

/**
 * Generate scenes + shots + asset gaps for a project from its script.
 * Clears any existing scenes first so re-running is idempotent.
 * Debits credits for scene generation (one charge covers the whole pass).
 */
export async function generateScenesForProject(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  scriptContent: string
) {
  const aiConfig = await resolveAiConfig(supabase, userId);
  await debitForAction(supabase, userId, "scene_generation", aiConfig.mode);

  // Load duration for shot-count constraints
  const { data: project } = await supabase
    .from("projects").select("duration")
    .eq("id", projectId).single();

  const sceneText = await generateText(buildScenePrompt(scriptContent, project?.duration), aiConfig);
  const { scenes } = parseJsonFromText<{ scenes: SceneShape[] }>(sceneText);

  // Clear existing scenes (cascade removes shots) for a clean regenerate.
  await supabase.from("scenes").delete().eq("project_id", projectId);

  for (const scene of scenes) {
    const { data: sceneRow } = await supabase
      .from("scenes")
      .insert({
        project_id: projectId,
        scene_number: scene.scene_number,
        title: scene.title,
      })
      .select("id")
      .single();

    if (!sceneRow) continue;

    const shotRows = (scene.shots ?? []).map((shot) => ({
      scene_id: sceneRow.id,
      project_id: projectId,
      shot_number: shot.shot_number,
      framing: shot.framing ?? null,
      subject: shot.subject ?? null,
      action: shot.action ?? null,
      mood: shot.mood ?? null,
    }));

    if (shotRows.length > 0) {
      await supabase.from("shots").insert(shotRows);
    }
  }

  // Asset gap detection — separate prompt, no extra debit (bundled).
  try {
    const assetText = await generateText(buildAssetGapPrompt(scriptContent), aiConfig);
    const { assets } = parseJsonFromText<{ assets: AssetShape[] }>(assetText);

    await supabase.from("assets").delete().eq("project_id", projectId);

    const assetRows = (assets ?? []).map((a) => ({
      project_id: projectId,
      asset_type: a.asset_type,
      name: a.name,
      description: a.description ?? null,
      status: "missing",
      priority: a.priority ?? "suggested",
    }));

    if (assetRows.length > 0) {
      await supabase.from("assets").insert(assetRows);
    }
  } catch {
    // Asset gaps are advisory; failure here shouldn't block scene generation.
  }
}
