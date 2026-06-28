import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createClient } from "../../../lib/supabase/server";
import { createProjectSchema } from "../../../lib/validators/project";
import { resolveAiConfig, debitForAction } from "../../../lib/ai/config";
import { generateText } from "../../../lib/ai/client";
import { buildScriptPrompt, buildTitlePrompt } from "../../../lib/ai/prompts";

export async function POST(request: Request) {
  let body;
  try {
    body = createProjectSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    throw error;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // Idea path generates a script up-front and lands on the script tab.
  // Script path stores the pasted script and jumps straight to scenes.
  const isIdea = body.entryMode === "idea";
  const workflowState = isIdea ? "script" : "scenes";

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: body.title,
      raw_input: body.rawInput,
      entry_mode: body.entryMode,
      workflow_state: workflowState,
      style: body.style ?? null,
      duration: body.duration ?? null,
      mood: body.mood ?? null,
      content_type: body.contentType ?? null,
      visual_feel: body.visualFeel ?? null,
    })
    .select("id, entry_mode, title, workflow_state")
    .single();

  if (projectError || !project) {
    console.error("[projects] insert failed:", projectError);
    return NextResponse.json(
      { error: "创建项目失败", detail: projectError?.message },
      { status: 500 }
    );
  }

  let scriptContent = body.rawInput;
  let newBalance: number | undefined;
  let aiTitle: string | undefined;

  if (isIdea) {
    try {
      const aiConfig = await resolveAiConfig(supabase, user.id);
      newBalance = await debitForAction(supabase, user.id, "script_generation", aiConfig.mode);

      // Generate title + script in parallel
      [aiTitle, scriptContent] = await Promise.all([
        generateText(
          buildTitlePrompt(body.rawInput, body.contentType, body.mood),
          aiConfig
        ).then((t) => t.trim().replace(/["""''《》【】]/g, "").slice(0, 20)),
        generateText(
          buildScriptPrompt(
            body.rawInput,
            body.style ?? "电影感",
            body.duration ?? "30秒",
            body.mood ?? "克制",
            body.contentType,
            body.visualFeel
          ),
          aiConfig
        ),
      ]);
      // Update project title with AI-generated one if we got one
      if (aiTitle) {
        await supabase.from("projects").update({ title: aiTitle }).eq("id", project.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "剧本生成失败";
      if (message === "INSUFFICIENT_CREDITS") {
        return NextResponse.json(
          {
            error: "Credit 不足，请在设置中切换到自己的 API Key。",
            projectId: project.id,
          },
          { status: 402 }
        );
      }
      // Project exists; surface a soft error so the user can retry generation.
      return NextResponse.json(
        { projectId: project.id, workflowState, scriptError: message },
        { status: 201 }
      );
    }
  }

  await supabase.from("scripts").insert({
    project_id: project.id,
    content: scriptContent,
    confirmed_at: isIdea ? null : new Date().toISOString(),
  });

  return NextResponse.json(
    {
      project: {
        id: project.id,
        entryMode: project.entry_mode,
        title: project.title,
        workflowState: project.workflow_state,
      },
      projectId: project.id,
      workflowState,
      creditBalance: newBalance,
    },
    { status: 201 }
  );
}
