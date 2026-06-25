import { redirect, notFound } from "next/navigation";
import { createClient } from "../supabase/server";

export interface ProjectRecord {
  id: string;
  title: string;
  entry_mode: "idea" | "script";
  workflow_state: string;
  style: string | null;
  duration: string | null;
  mood: string | null;
}

/**
 * Load a project owned by the current user, or redirect/404.
 * Also returns the user's current credit balance for the top bar.
 */
export async function loadProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, entry_mode, workflow_state, style, duration, mood")
    .eq("id", projectId)
    .single();

  if (!project) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("viby_credit_balance, active_ai_mode")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    user,
    project: project as ProjectRecord,
    creditBalance: profile?.viby_credit_balance ?? 0,
    aiMode: profile?.active_ai_mode ?? "viby_ai",
  };
}
