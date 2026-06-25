import { loadProject } from "../../../../../../lib/db/projects";
import { TabNav } from "../../../../../../components/workspace/tab-nav";
import {
  StoryboardWorkspace,
  type SceneWithStoryboard,
} from "../../../../../../components/workspace/storyboard-workspace";

export default async function StoryboardTabPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, supabase } = await loadProject(params.projectId);

  const { data: scenes } = await supabase
    .from("scenes")
    .select("id, scene_number, title")
    .eq("project_id", project.id)
    .order("scene_number", { ascending: true });

  const { data: storyboards } = await supabase
    .from("storyboards")
    .select("scene_id, image_url, prompt, grid_size")
    .eq("project_id", project.id);

  const sbByScene = new Map((storyboards ?? []).map((s) => [s.scene_id, s]));

  const merged: SceneWithStoryboard[] = (scenes ?? []).map((s) => {
    const sb = sbByScene.get(s.id);
    return {
      id: s.id,
      scene_number: s.scene_number,
      title: s.title,
      image_url: sb?.image_url ?? null,
      prompt: sb?.prompt ?? null,
      grid_size: sb?.grid_size ?? 16,
    };
  });

  return (
    <>
      <TabNav
        projectId={project.id}
        workflowState={project.workflow_state}
        current="storyboard"
      />
      <StoryboardWorkspace projectId={project.id} scenes={merged} />
    </>
  );
}
