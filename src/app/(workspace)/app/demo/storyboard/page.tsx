import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../../../../../lib/supabase/server";
import { DemoStoryboardWorkspace } from "../../../../../components/workspace/demo-storyboard-workspace";

export default async function DemoStoryboardPage() {
  if (isSupabaseConfigured()) redirect("/app");

  return (
    <>
      <div className="tabbar" role="tablist">
        <div className="tab"><span className="tab-mark done">✓</span> 剧本</div>
        <div className="tab"><span className="tab-mark done">✓</span> 场景 &amp; 分镜</div>
        <div className="tab active"><span className="tab-mark cur">●</span> Storyboard</div>
      </div>
      <DemoStoryboardWorkspace />
    </>
  );
}
