import { loadProject } from "../../../../../../lib/db/projects";
import { TabNav } from "../../../../../../components/workspace/tab-nav";
import { ScenesClient } from "../../../../../../components/workspace/scenes-client";

export default async function ScenesTabPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, supabase } = await loadProject(params.projectId);

  const [{ data: scenes }, { data: shots }, { data: assets }] = await Promise.all([
    supabase
      .from("scenes")
      .select("id, scene_number, title")
      .eq("project_id", project.id)
      .order("scene_number", { ascending: true }),
    supabase
      .from("shots")
      .select("id, scene_id, shot_number, framing, subject, action, mood")
      .eq("project_id", project.id)
      .order("shot_number", { ascending: true }),
    supabase
      .from("assets")
      .select("id, asset_type, name, description, status, priority")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <>
      <TabNav
        projectId={project.id}
        workflowState={project.workflow_state}
        current="scenes"
      />
      <ScenesClient
        projectId={project.id}
        scenes={scenes ?? []}
        shots={shots ?? []}
        assets={(assets ?? []) as never}
      />
    </>
  );
}
