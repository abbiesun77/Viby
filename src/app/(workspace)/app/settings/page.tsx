import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { SettingsForm } from "../../../../components/workspace/settings-form";
import { COSTS } from "../../../../lib/credits";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("viby_credit_balance, active_ai_mode, byok_base_url")
    .eq("id", user.id)
    .single();

  const balance = profile?.viby_credit_balance ?? 0;

  return (
    <>
      <nav className="topnav">
        <div className="tn-left">
          <Link href="/app" className="tn-logo">Viby</Link>
          <span className="tn-sep">/</span>
          <span className="tn-proj">设置</span>
        </div>
        <div className="tn-right">
          <span className={`credit-pill${balance < 20 ? " warn" : ""}`}>
            Credit <b>{balance}</b>
          </span>
          <Link href="/app" className="tn-btn">返回</Link>
        </div>
      </nav>

      <main className="main-scroll">
        <div className="set-wrap">
          <h1 className="page-title">设置</h1>
          <p className="page-sub">管理 Viby Credit 与你的自定义 AI 接口。</p>

          <p className="kicker">Viby Credit</p>
          <div className="settings-sec">
            <div>
              <span className="credit-big">{balance}</span>
              <span className="credit-u">点</span>
            </div>
            <div className="credit-note">
              Credit 耗尽后请切换到下方自定义 Key 继续创作。
            </div>
            <div className="cost-table">
              <div className="cost-row">
                <span className="cost-k">生成剧本</span>
                <span className="cost-v">约 {COSTS.script_generation} 点</span>
              </div>
              <div className="cost-row">
                <span className="cost-k">生成场景 &amp; 分镜</span>
                <span className="cost-v">约 {COSTS.scene_generation} 点</span>
              </div>
              <div className="cost-row">
                <span className="cost-k">生成参考图</span>
                <span className="cost-v">约 {COSTS.asset_generation} 点</span>
              </div>
              <div className="cost-row">
                <span className="cost-k">生成 Storyboard</span>
                <span className="cost-v">约 {COSTS.storyboard_generation} 点</span>
              </div>
            </div>
          </div>

          <SettingsForm
            initialMode={profile?.active_ai_mode === "byok" ? "byok" : "viby_ai"}
            initialBaseUrl={profile?.byok_base_url ?? ""}
          />
        </div>
      </main>
    </>
  );
}
