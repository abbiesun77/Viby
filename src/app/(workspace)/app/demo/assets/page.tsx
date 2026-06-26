import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../../../../../lib/supabase/server";
import { demoAssets } from "../../../../../lib/demo-data";
import { DemoAssetManagerFull } from "../../../../../components/workspace/demo-asset-manager";

export default async function DemoAssetsPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  if (isSupabaseConfigured()) redirect("/app");

  const validTypes = ["character", "scene", "prop", "style"];
  const filterType = searchParams.type && validTypes.includes(searchParams.type)
    ? searchParams.type
    : undefined;

  return (
    <>
      <div className="tabbar">
        <a className="tab active" href="/app/demo/script"><span className="tab-mark done">✓</span> 剧本</a>
        <a className="tab active" href="/app/demo/scenes"><span className="tab-mark done">✓</span> 场景 &amp; 分镜</a>
        <a className="tab active" href="/app/demo/storyboard"><span className="tab-mark">○</span> Storyboard</a>
      </div>
      <DemoAssetManagerFull assets={demoAssets} filterType={filterType} />
    </>
  );
}
