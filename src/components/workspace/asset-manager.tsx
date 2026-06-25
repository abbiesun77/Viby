"use client";

import { useState } from "react";
import { AssetPanel } from "./asset-panel";

export interface DashAsset {
  id: string;
  asset_type: "character" | "scene" | "prop" | "style";
  name: string;
  description: string | null;
  image_url: string | null;
  status: string;
}

const GROUPS: { type: DashAsset["asset_type"]; label: string }[] = [
  { type: "character", label: "角色" },
  { type: "scene", label: "场景" },
  { type: "prop", label: "道具" },
  { type: "style", label: "风格锚点" },
];

export function AssetManager({
  projectId,
  assets,
}: {
  projectId: string;
  assets: DashAsset[];
}) {
  const [list, setList] = useState(assets);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = list.find((a) => a.id === openId) ?? null;

  return (
    <div id="asset-col">
      <p className="kicker">资产管理</p>

      {GROUPS.map((g) => {
        const items = list.filter((a) => a.asset_type === g.type);
        if (items.length === 0) return null;
        return (
          <div className="asset-group" key={g.type}>
            <div className="asset-group-title">{g.label}</div>
            {items.map((a) => {
              const ready = a.status === "generated" || a.status === "uploaded";
              return (
                <div className="asset-card" key={a.id}>
                  <div className={`asset-thumb${ready ? "" : " missing"}`}>
                    {ready && a.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.image_url} alt={a.name} />
                    ) : (
                      <span className="qmark">?</span>
                    )}
                  </div>
                  <div className="asset-detail">
                    <div className="asset-name">{a.name}</div>
                    <div className={`asset-state ${ready ? "ok" : "warn"}`}>
                      {ready ? "已生成" : "⚠ 未生成"}
                    </div>
                    <div className="asset-btns">
                      <button className="asset-btn" onClick={() => setOpenId(a.id)}>
                        {ready ? "重新生成" : "生成"}
                      </button>
                      {ready && (
                        <button className="asset-btn" onClick={() => setOpenId(a.id)}>
                          与 AI 调整
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {list.length === 0 && (
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          确认场景后，Viby 会在这里列出需要的参考图。
        </p>
      )}

      {open && (
        <AssetPanel
          projectId={projectId}
          asset={{
            id: open.id,
            name: open.name,
            asset_type: open.asset_type,
            description: open.description,
            image_url: open.image_url,
            status: open.status,
          }}
          onClose={() => setOpenId(null)}
          onSaved={(assetId, imageUrl) =>
            setList((l) =>
              l.map((a) =>
                a.id === assetId
                  ? { ...a, status: "generated", image_url: imageUrl }
                  : a
              )
            )
          }
        />
      )}
    </div>
  );
}
