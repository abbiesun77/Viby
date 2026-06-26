import { loadProject } from "../../../../../../lib/db/projects";
import { TabNav } from "../../../../../../components/workspace/tab-nav";
import { AssetManagerFull, type DashAsset } from "../../../../../../components/workspace/asset-pages";

export default async function AssetsPage({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams: { type?: string };
}) {
  const { project, supabase } = await loadProject(params.projectId);

  const { data: assets } = await supabase
    .from("assets")
    .select("id, asset_type, name, description, image_url, status")
    .eq("project_id", project.id)
    .order("created_at", { ascending: true });

  // Validate filterType against known types; ignore invalid values.
  const validTypes = ["character", "scene", "prop", "style"];
  const filterType = searchParams.type && validTypes.includes(searchParams.type)
    ? searchParams.type
    : undefined;

  return (
    <>
      <TabNav
        projectId={project.id}
        workflowState={project.workflow_state}
        current="scenes"
      />
      <AssetManagerFull
        projectId={project.id}
        assets={(assets ?? []) as DashAsset[]}
        filterType={filterType}
      />
    </>
  );
}
