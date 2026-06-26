import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "../../../../lib/supabase/server";
import { SettingsForm } from "../../../../components/workspace/settings-form";

export default async function SettingsPage() {
  const configured = isSupabaseConfigured();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (configured && !user) redirect("/sign-in");

  const { data: profile } = configured
    ? await supabase
        .from("profiles")
        .select("viby_credit_balance, active_ai_mode, byok_base_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  const balance = profile?.viby_credit_balance ?? 120;

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

          <SettingsForm
            initialMode={profile?.active_ai_mode === "byok" ? "byok" : "viby_ai"}
            initialBaseUrl={profile?.byok_base_url ?? ""}
            creditBalance={balance}
          />
        </div>
      </main>
    </>
  );
}
