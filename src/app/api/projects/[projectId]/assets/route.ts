import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";

// GET: all assets for a project, grouped client-side by type.
export async function GET(
  _request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { data: assets } = await supabase
    .from("assets")
    .select("id, asset_type, name, description, image_url, status, priority")
    .eq("project_id", params.projectId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ assets: assets ?? [] });
}
