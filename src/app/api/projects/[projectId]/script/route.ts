import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";

async function authedProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "未登录" as const, status: 401 as const };

  const { data: project } = await supabase
    .from("projects")
    .select("id, style, duration, mood, raw_input")
    .eq("id", projectId)
    .single();
  if (!project) return { error: "项目不存在" as const, status: 404 as const };

  return { supabase, user, project };
}

// GET: latest script content
export async function GET(
  _request: Request,
  { params }: { params: { projectId: string } }
) {
  const ctx = await authedProject(params.projectId);
  if ("error" in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { data: script } = await ctx.supabase
    .from("scripts")
    .select("id, content, confirmed_at")
    .eq("project_id", params.projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ script: script ?? null });
}

// PUT: save edited content (autosave)
export async function PUT(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const ctx = await authedProject(params.projectId);
  if ("error" in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { content } = await request.json();
  if (typeof content !== "string") {
    return NextResponse.json({ error: "内容无效" }, { status: 400 });
  }

  const { data: existing } = await ctx.supabase
    .from("scripts")
    .select("id")
    .eq("project_id", params.projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    await ctx.supabase
      .from("scripts")
      .update({ content })
      .eq("id", existing.id);
  } else {
    await ctx.supabase
      .from("scripts")
      .insert({ project_id: params.projectId, content });
  }

  return NextResponse.json({ ok: true });
}
