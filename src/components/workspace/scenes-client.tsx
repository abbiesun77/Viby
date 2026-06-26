"use client";

import { useState } from "react";
import {
  SceneWorkspace,
  type Scene,
  type Shot,
  type Asset,
} from "./scene-workspace";
import { AssetPanel } from "./asset-panel";

export function ScenesClient({
  projectId,
  scenes,
  shots,
  assets,
}: {
  projectId: string;
  scenes: Scene[];
  shots: Shot[];
  assets: Asset[];
}) {
  const [assetList, setAssetList] = useState(assets);
  const [openAssetId, setOpenAssetId] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<
    Record<string, "missing" | "done" | "skipped">
  >({});

  const openAsset = assetList.find((a) => a.id === openAssetId) ?? null;

  async function uploadAsset(assetId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(
      `/api/projects/${projectId}/assets/${assetId}/upload`,
      { method: "POST", body: form }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "上传失败");
    setStatusMap((m) => ({ ...m, [assetId]: "done" }));
    setAssetList((list) =>
      list.map((a) =>
        a.id === assetId
          ? { ...a, status: "uploaded" }
          : a
      )
    );
  }

  return (
    <>
      <SceneWorkspace
        projectId={projectId}
        initialScenes={scenes}
        initialShots={shots}
        initialAssets={assetList}
        assetStatus={statusMap}
        onOpenAsset={(id) => setOpenAssetId(id)}
        onUploadAsset={uploadAsset}
      />

      {openAsset && (
        <AssetPanel
          projectId={projectId}
          asset={{
            id: openAsset.id,
            name: openAsset.name,
            asset_type: openAsset.asset_type,
            description: openAsset.description,
            image_url: null,
            status: openAsset.status,
          }}
          onClose={() => setOpenAssetId(null)}
          onSaved={(assetId) => {
            setStatusMap((m) => ({ ...m, [assetId]: "done" }));
            setAssetList((list) =>
              list.map((a) =>
                a.id === assetId ? { ...a, status: "generated" } : a
              )
            );
          }}
        />
      )}
    </>
  );
}
