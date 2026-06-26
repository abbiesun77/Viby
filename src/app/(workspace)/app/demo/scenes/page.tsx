import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../../../../../lib/supabase/server";
import { DemoSceneWorkspace } from "../../../../../components/workspace/demo-scene-workspace";

export default async function DemoScenesPage() {
  if (isSupabaseConfigured()) redirect("/app");

  return (
    <>
      <div className="tabbar" role="tablist">
        <div className="tab"><span className="tab-mark done">✓</span> 剧本</div>
        <div className="tab active"><span className="tab-mark cur">●</span> 场景 &amp; 分镜</div>
        <div className="tab"><span className="tab-mark">○</span> Storyboard</div>
      </div>
      <DemoSceneWorkspace />
      <div className="action-bar">
        <div className="ab-left">
          <a className="btn-g" href="/app/demo/script">← 返回剧本</a>
        </div>
        <a className="btn-p" href="/app/demo/storyboard">确认场景，生成 Storyboard →</a>
      </div>
    </>
  );
}
