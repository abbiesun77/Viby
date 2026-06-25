import { createClient } from "../../../../../lib/supabase/server";
import JSZip from "jszip";

const ASSET_DIR: Record<string, string> = {
  character: "assets/characters",
  scene: "assets/scenes",
  prop: "assets/props",
  style: "assets/style",
};

// POST: bundle the whole project into a downloadable ZIP.
export async function POST(
  _request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "未登录" }), { status: 401 });
  }

  const [
    { data: project },
    { data: script },
    { data: scenes },
    { data: shots },
    { data: assets },
    { data: storyboards },
  ] = await Promise.all([
    supabase.from("projects").select("title").eq("id", params.projectId).single(),
    supabase
      .from("scripts")
      .select("content")
      .eq("project_id", params.projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("scenes")
      .select("id, scene_number, title")
      .eq("project_id", params.projectId)
      .order("scene_number", { ascending: true }),
    supabase
      .from("shots")
      .select("scene_id, shot_number, framing, subject, action, mood")
      .eq("project_id", params.projectId)
      .order("shot_number", { ascending: true }),
    supabase
      .from("assets")
      .select("asset_type, name, image_url")
      .eq("project_id", params.projectId),
    supabase
      .from("storyboards")
      .select("scene_id, image_url, prompt")
      .eq("project_id", params.projectId),
  ]);

  const zip = new JSZip();

  zip.file("script.txt", script?.content ?? "");

  const scenesData = (scenes ?? []).map((s) => ({
    ...s,
    shots: (shots ?? []).filter((sh) => sh.scene_id === s.id),
  }));
  zip.file("scenes.json", JSON.stringify(scenesData, null, 2));

  const sceneTitle = new Map((scenes ?? []).map((s) => [s.id, s.title]));
  const promptsText = (storyboards ?? [])
    .map(
      (sb) => `== ${sceneTitle.get(sb.scene_id) ?? sb.scene_id} ==\n${sb.prompt ?? ""}`
    )
    .join("\n\n");
  zip.file("prompts.txt", promptsText);

  await Promise.all([
    ...(assets ?? [])
      .filter((a) => a.image_url)
      .map(async (a, i) => {
        const dir = ASSET_DIR[a.asset_type] ?? "assets/other";
        const bytes = await fetchImage(a.image_url as string);
        if (bytes) zip.file(`${dir}/${i}-${safeName(a.name)}.png`, bytes);
      }),
    ...(storyboards ?? [])
      .filter((sb) => sb.image_url)
      .map(async (sb) => {
        const bytes = await fetchImage(sb.image_url as string);
        if (bytes)
          zip.file(
            `storyboards/${safeName(sceneTitle.get(sb.scene_id) ?? sb.scene_id)}.png`,
            bytes
          );
      }),
  ]);

  const blob = await zip.generateAsync({ type: "blob" });
  const filename = `${safeName(project?.title ?? "viby-project")}.zip`;

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}

async function fetchImage(url: string): Promise<Uint8Array | null> {
  try {
    if (url.startsWith("data:")) {
      const base64 = url.split(",")[1] ?? "";
      return Uint8Array.from(Buffer.from(base64, "base64"));
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function safeName(name: string) {
  return name.replace(/[^\w一-龥-]+/g, "_").slice(0, 40);
}
