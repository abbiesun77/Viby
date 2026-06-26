import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";

const stateLabels: Record<string, string> = {
  onboarding: "准备中",
  script: "剧本",
  scenes: "场景 & 分镜",
  storyboard: "Storyboard",
  done: "已完成",
};

const stateProgress: Record<string, number> = {
  onboarding: 0,
  script: 25,
  scenes: 50,
  storyboard: 75,
  done: 100,
};

export default async function AppHomePage() {
  const configured = isSupabaseConfigured();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // In demo mode the mock client returns a synthetic user, so we never
  // redirect to /sign-in — the email-auth-form already routes here.
  if (configured && !user) redirect("/sign-in");

  const { data: projects } = configured
    ? await supabase
        .from("projects")
        .select("id, title, workflow_state, style, duration, mood, updated_at")
        .order("updated_at", { ascending: false })
    : { data: [] };

  // Empty list in real mode → onboarding. In demo mode, fall through and
  // show the demo entry so the user can still explore the UI.
  if (configured && (!projects || projects.length === 0)) {
    redirect("/app/new");
  }

  return (
    <>
      <nav className="topnav">
        <div className="tn-left">
          <Link href="/" className="tn-logo">Viby</Link>
          <span className="tn-sep">/</span>
          <span className="tn-proj">我的项目</span>
        </div>
        <div className="tn-right">
          <Link href="/app/settings" className="tn-btn">设置</Link>
          <Link href="/app/new" className="tn-btn solid">+ 新建项目</Link>
        </div>
      </nav>

      <div className="plist-head">
        <p className="kicker" style={{ marginBottom: 0 }}>项目列表</p>
      </div>

      {!configured && (
        <div className="demo-banner">
          <div className="demo-banner-inner">
            <div>
              <div className="demo-banner-title">演示模式</div>
              <div className="demo-banner-sub">
                未配置 Supabase，下面是一个示例项目。配置后可创建自己的项目。
              </div>
            </div>
            <Link href="/app/demo" className="demo-banner-cta">查看示例项目 →</Link>
          </div>
        </div>
      )}

      <div className="plist-grid">
        {configured && projects && projects.length > 0 ? (
          projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))
        ) : (
          // Demo mode: show the demo project as a single card.
          <Link href="/app/demo" className="pcard demo-card">
            <div className="pcard-thumb-wrap">
              <div className="pcard-thumb" data-state="storyboard" />
              <span className="pcard-state-pill">Storyboard 阶段</span>
            </div>
            <div className="pcard-body">
              <div className="pcard-t">便利店里的未来自己</div>
              <div className="pcard-meta">电影感 · 30秒 · 孤寂、带点温情</div>
              <div className="pcard-progress">
                <div className="pcard-progress-bar">
                  <div className="pcard-progress-fill" style={{ width: "75%" }} />
                </div>
                <span className="pcard-progress-label">3 场景 · 7 分镜</span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </>
  );
}

function ProjectCard({ project }: { project: any }) {
  const state = project.workflow_state ?? "onboarding";
  const progress = stateProgress[state] ?? 0;
  const meta = [project.style, project.duration, project.mood].filter(Boolean).join(" · ");

  return (
    <Link href={`/app/projects/${project.id}`} className="pcard">
      <div className="pcard-thumb-wrap">
        <div className="pcard-thumb" data-state={state} />
        <span className="pcard-state-pill">{stateLabels[state] ?? state}</span>
      </div>
      <div className="pcard-body">
        <div className="pcard-t">{project.title}</div>
        {meta && <div className="pcard-meta">{meta}</div>}
        <div className="pcard-progress">
          <div className="pcard-progress-bar">
            <div className="pcard-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="pcard-progress-label">{progress}%</span>
        </div>
      </div>
    </Link>
  );
}
