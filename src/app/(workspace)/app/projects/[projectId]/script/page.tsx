import { loadProject } from "../../../../../../lib/db/projects";
import { TabNav } from "../../../../../../components/workspace/tab-nav";
import { ScriptEditor } from "../../../../../../components/workspace/script-editor";

export default async function ScriptTabPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, supabase } = await loadProject(params.projectId);

  const { data: script } = await supabase
    .from("scripts")
    .select("content")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <>
      <TabNav
        projectId={project.id}
        workflowState={project.workflow_state}
        current="script"
      />
      <ScriptEditor projectId={project.id} initialContent={script?.content ?? ""} />
    </>
  );
}
