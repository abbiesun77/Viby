import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../../../../lib/supabase/server";
import { demoProject, demoAssets } from "../../../../lib/demo-data";
import { DemoAssetOverview } from "../../../../components/workspace/demo-asset-manager";

/**
 * Demo project page. Only reachable in demo mode (no Supabase configured).
 * Renders the full project dashboard with mock data so the UI is explorable.
 */
export default async function DemoProjectPage() {
  // If Supabase IS configured, this page is meaningless — bounce to the
  // real project list so the user doesn't get confused.
  if (isSupabaseConfigured()) {
    redirect("/app");
  }

  const project = demoProject;

  return (
    <>
      <nav className="topnav">
        <div className="tn-left">
          <a href="/app" className="tn-logo">Viby</a>
          <span className="tn-sep">/</span>
          <a href="/app">项目列表</a>
          <span className="tn-sep">/</span>
          <span className="tn-proj">{project.title}</span>
        </div>
        <div className="tn-right">
          <span className="credit-pill">Credit <b>120</b></span>
          <a href="/app/settings" className="tn-btn">设置</a>
          <a href="/app/projects/demo/export" className="tn-btn solid">导出</a>
        </div>
      </nav>

      <div className="demo-notice">
        演示模式：以下内容为示例数据，不可编辑。配置 Supabase 后可创建真实项目。
      </div>

      <div className="tabbar">
        <a className="tab active" href="/app/demo"><span className="tab-mark done">✓</span> 剧本</a>
        <a className="tab active" href="/app/demo"><span className="tab-mark done">✓</span> 场景 &amp; 分镜</a>
        <a className="tab active" href="/app/demo"><span className="tab-mark cur">●</span> Storyboard</a>
      </div>

      <main className="main-scroll">
        <div className="dash-head">
          <h1 className="dash-title">{project.title}</h1>
          <p className="dash-sub">{project.style} · {project.duration} · {project.mood}</p>
        </div>
        <div className="dash-grid">
          <div>
            <p className="kicker">项目进度</p>
            <div className="prog-list">
              <div className="prog-row">
                <div className="prog-ico done">✓</div>
                <div className="prog-info">
                  <div className="prog-name">剧本</div>
                  <div className="prog-meta">已确认 · 3 场景</div>
                </div>
                <a className="prog-act" href="/app/demo/script">查看剧本</a>
              </div>
              <div className="prog-row">
                <div className="prog-ico done">✓</div>
                <div className="prog-info">
                  <div className="prog-name">场景 &amp; 分镜</div>
                  <div className="prog-meta">3 场景 · 7 分镜</div>
                </div>
                <a className="prog-act" href="/app/demo/scenes">查看分镜</a>
              </div>
              <div className="prog-row">
                <div className="prog-ico warn">⚠</div>
                <div className="prog-info">
                  <div className="prog-name">资产</div>
                  <div className="prog-meta warn">5 项待补充</div>
                </div>
                <a className="prog-act" href="/app/demo/assets">管理资产</a>
              </div>
              <div className="prog-row">
                <div className="prog-ico">○</div>
                <div className="prog-info">
                  <div className="prog-name">Storyboard</div>
                  <div className="prog-meta">未生成</div>
                </div>
                <a className="prog-act" href="/app/demo/storyboard">查看 Storyboard</a>
              </div>
            </div>
            <a href="/app/projects/demo/export" className="export-cta">导出素材包</a>
          </div>

          <DemoAssetOverview assets={demoAssets} />
        </div>
      </main>
    </>
  );
}
