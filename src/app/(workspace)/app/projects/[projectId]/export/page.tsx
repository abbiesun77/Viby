import { loadProject } from "../../../../../../lib/db/projects";
import {
  ExportPanel,
  type ExportChecklistItem,
} from "../../../../../../components/workspace/export-panel";

export default async function ExportPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, supabase } = await loadProject(params.projectId);

  const [{ data: script }, { count: sceneCount }, { data: assets }, { data: storyboards }] =
    await Promise.all([
      supabase
        .from("scripts")
        .select("content")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase.from("scenes").select("id", { count: "exact", head: true }).eq("project_id", project.id),
      supabase.from("assets").select("name, asset_type, status, image_url").eq("project_id", project.id),
      supabase.from("storyboards").select("id, image_url").eq("project_id", project.id),
    ]);

  const hasAsset = (type: string) =>
    (assets ?? []).some((a) => a.asset_type === type && a.image_url);

  const checklist: ExportChecklistItem[] = [
    { key: "script", label: "剧本文本", path: "script.txt", available: !!script?.content },
    { key: "scenes", label: "场景 & 分镜数据", path: "scenes.json", available: (sceneCount ?? 0) > 0 },
    { key: "character", label: "角色参考图", path: "assets/characters/", available: hasAsset("character") },
    { key: "scene", label: "场景参考图", path: "assets/scenes/", available: hasAsset("scene") },
    { key: "prop", label: "道具参考图", path: "assets/props/", available: hasAsset("prop") },
    { key: "style", label: "风格锚点", path: "assets/style/", available: hasAsset("style") },
    {
      key: "storyboards",
      label: "Storyboard 图",
      path: "storyboards/",
      available: (storyboards ?? []).some((s) => s.image_url),
    },
    { key: "prompts", label: "图像提示词", path: "prompts.txt", available: (storyboards ?? []).length > 0 },
  ];

  const missingAssets = (assets ?? [])
    .filter((a) => a.status === "missing")
    .map((a) => a.name);

  return (
    <main className="main-scroll">
      <div className="ex-wrap">
        <h1 className="page-title">导出素材包</h1>
        <p className="page-sub">
          勾选要打包的内容，Viby 会生成一个可直接交给视频模型的 ZIP。
        </p>
        <ExportPanel
          projectId={project.id}
          checklist={checklist}
          missingAssets={missingAssets}
        />
      </div>
    </main>
  );
}
