import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../../../../../lib/supabase/server";
import { demoScript } from "../../../../../lib/demo-data";
import { DemoScriptEditor } from "../../../../../components/workspace/demo-script-editor";

export default async function DemoScriptPage() {
  if (isSupabaseConfigured()) redirect("/app");

  return (
    <>
      <div className="tabbar" role="tablist">
        <div className="tab active"><span className="tab-mark cur">●</span> 剧本</div>
        <div className="tab"><span className="tab-mark">○</span> 场景 &amp; 分镜</div>
        <div className="tab"><span className="tab-mark">○</span> Storyboard</div>
      </div>
      <DemoScriptEditor content={demoScript} />
    </>
  );
}
