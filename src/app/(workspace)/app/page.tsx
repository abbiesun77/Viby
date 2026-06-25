import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, workflow_state, updated_at")
    .order("updated_at", { ascending: false });

  if (!projects || projects.length === 0) {
    redirect("/app/new");
  }

  const stateLabels: Record<string, string> = {
    onboarding: "准备中",
    script: "剧本",
    scenes: "场景 & 分镜",
    storyboard: "Storyboard",
    done: "已完成",
  };

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
      <div className="plist-grid">
        {projects.map((p) => (
          <Link key={p.id} href={`/app/projects/${p.id}`} className="pcard">
            <div className="pcard-t">{p.title}</div>
            <div className="pcard-m">
              当前进度：{stateLabels[p.workflow_state] ?? p.workflow_state}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
