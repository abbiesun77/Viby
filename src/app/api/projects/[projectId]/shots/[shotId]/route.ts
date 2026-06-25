import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { shotUpdateSchema } from "../../../../../../lib/validators/shot";

// PATCH: update a single shot card's fields.
export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string; shotId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = shotUpdateSchema.parse(await request.json());

  const { error } = await supabase
    .from("shots")
    .update(body)
    .eq("id", params.shotId)
    .eq("project_id", params.projectId);

  if (error) return NextResponse.json({ error: "更新失败" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE: remove a shot.
export async function DELETE(
  _request: Request,
  { params }: { params: { projectId: string; shotId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  await supabase
    .from("shots")
    .delete()
    .eq("id", params.shotId)
    .eq("project_id", params.projectId);

  return NextResponse.json({ ok: true });
}
