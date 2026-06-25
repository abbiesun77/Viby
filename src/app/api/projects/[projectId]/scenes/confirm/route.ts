import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";

// POST: confirm scenes, advance workflow_state to storyboard.
export async function POST(
  _request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  await supabase
    .from("projects")
    .update({ workflow_state: "storyboard", updated_at: new Date().toISOString() })
    .eq("id", params.projectId);

  return NextResponse.json({ ok: true, workflowState: "storyboard" });
}
