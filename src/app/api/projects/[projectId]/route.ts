import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { projectRouteParamsSchema } from "../../../../lib/validators/project";
import { z } from "zod";

const patchSchema = z.object({ title: z.string().trim().min(1) });

export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = projectRouteParamsSchema.parse(params);
  const body = patchSchema.parse(await request.json());

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { error } = await supabase
    .from("projects")
    .update({ title: body.title, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = projectRouteParamsSchema.parse(params);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
