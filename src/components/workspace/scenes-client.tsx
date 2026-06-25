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

  return (
    <>
      <SceneWorkspace
        projectId={projectId}
        initialScenes={scenes}
        initialShots={shots}
        initialAssets={assetList}
        assetStatus={statusMap}
        onOpenAsset={(id) => setOpenAssetId(id)}
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
