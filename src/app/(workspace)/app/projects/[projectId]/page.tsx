import Link from "next/link";
import { loadProject } from "../../../../../lib/db/projects";
import { AssetManager, type DashAsset } from "../../../../../components/workspace/asset-manager";

const STATE_RANK: Record<string, number> = {
  onboarding: 0,
  script: 1,
  scenes: 2,
  storyboard: 3,
  done: 4,
};

const CHECK = (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const WARN = (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default async function ProjectDashboardPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, supabase } = await loadProject(params.projectId);
  const reached = STATE_RANK[project.workflow_state] ?? 0;

  const [{ count: sceneCount }, { count: shotCount }, { data: assets }, { count: boardCount }] =
    await Promise.all([
      supabase.from("scenes").select("id", { count: "exact", head: true }).eq("project_id", project.id),
      supabase.from("shots").select("id", { count: "exact", head: true }).eq("project_id", project.id),
      supabase
        .from("assets")
        .select("id, asset_type, name, description, image_url, status")
        .eq("project_id", project.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("storyboards")
        .select("id", { count: "exact", head: true })
        .eq("project_id", project.id)
        .not("image_url", "is", null),
    ]);

  const missing = (assets ?? []).filter((a) => a.status === "missing").length;
  const subParts = [
    project.style,
    project.mood,
    project.duration,
    `${sceneCount ?? 0} 场景 / ${shotCount ?? 0} 分镜`,
  ].filter(Boolean);

  const rows = [
    {
      done: reached >= 1,
      name: "剧本",
      meta: reached >= 1 ? "已确认" : "未开始",
      act: "重新编辑",
      href: `/app/projects/${project.id}/script`,
    },
    {
      done: reached >= 2,
      name: "场景 & 分镜",
      meta: reached >= 2 ? `${sceneCount ?? 0} 场景 · ${shotCount ?? 0} 分镜` : "未开始",
      act: "重新编辑",
      href: `/app/projects/${project.id}/scenes`,
    },
    {
      done: missing === 0 && (assets ?? []).length > 0,
      warn: missing > 0,
      name: "资产",
      meta: missing > 0 ? `${missing} 项待补充` : "全部就绪",
      act: "管理资产",
      href: `#asset-col`,
    },
    {
      done: (boardCount ?? 0) > 0,
      name: "Storyboard",
      meta: (boardCount ?? 0) > 0 ? `${boardCount} 张已生成` : "未生成",
      act: "查看/重新生成",
      href: `/app/projects/${project.id}/storyboard`,
    },
  ];

  return (
    <main className="main-scroll">
      <div className="dash-head">
        <h1 className="dash-title">{project.title}</h1>
        <p className="dash-sub">{subParts.join(" · ")}</p>
      </div>
      <div className="dash-grid">
        <div>
          <p className="kicker">项目进度</p>
          <div className="prog-list">
            {rows.map((r) => (
              <div className="prog-row" key={r.name}>
                <div className={`prog-ico ${r.done ? "done" : r.warn ? "warn" : ""}`}>
                  {r.done ? CHECK : r.warn ? WARN : "🔲"}
                </div>
                <div className="prog-info">
                  <div className="prog-name">{r.name}</div>
                  <div className={`prog-meta ${r.warn ? "warn" : ""}`}>{r.meta}</div>
                </div>
                <Link className="prog-act" href={r.href}>
                  {r.act}
                </Link>
              </div>
            ))}
          </div>
          <Link href={`/app/projects/${project.id}/export`} className="export-cta">
            导出素材包
          </Link>
        </div>

        <AssetManager projectId={project.id} assets={(assets ?? []) as DashAsset[]} />
      </div>
    </main>
  );
}
