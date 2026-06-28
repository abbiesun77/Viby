"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

/**
 * Compact asset overview shown on the project dashboard right column.
 * Shows counts per category + a "manage all" link to the full asset page.
 * Clicking a category jumps to the asset page filtered by that type.
 */
export function AssetOverview({
  projectId,
  assets,
}: {
  projectId: string;
  assets: DashAsset[];
}) {
  const router = useRouter();

  const total = assets.length;
  const ready = assets.filter(
    (a) => a.status === "generated" || a.status === "uploaded"
  ).length;
  const missing = assets.filter((a) => a.status === "missing").length;

  return (
    <div id="asset-col">
      <div className="ao-head">
        <p className="kicker" style={{ marginBottom: 0 }}>资产速览</p>
        <button
          className="ao-manage-btn"
          onClick={() => router.push(`/app/projects/${projectId}/assets`)}
        >
          管理全部 →
        </button>
      </div>

      <div className="ao-stats">
        <div className="ao-stat">
          <span className="ao-stat-n">{total}</span>
          <span className="ao-stat-l">总资产</span>
        </div>
        <div className="ao-stat">
          <span className="ao-stat-n ok">{ready}</span>
          <span className="ao-stat-l">已就绪</span>
        </div>
        <div className="ao-stat">
          <span className="ao-stat-n warn">{missing}</span>
          <span className="ao-stat-l">待补充</span>
        </div>
      </div>

      {GROUPS.map((g) => {
        const items = assets.filter((a) => a.asset_type === g.type);
        if (items.length === 0) return null;
        const groupReady = items.filter(
          (a) => a.status === "generated" || a.status === "uploaded"
        ).length;
        return (
          <button
            key={g.type}
            className="ao-cat"
            onClick={() => router.push(`/app/projects/${projectId}/assets?type=${g.type}`)}
          >
            <span className="ao-cat-icon" />
            <span className="ao-cat-info">
              <span className="ao-cat-name">{g.label}</span>
              <span className="ao-cat-meta">{groupReady}/{items.length} 就绪</span>
            </span>
            <span className="ao-cat-thumbs">
              {items.slice(0, 4).map((a) => {
                const r = a.status === "generated" || a.status === "uploaded";
                return (
                  <span
                    key={a.id}
                    className={`ao-thumb${r ? "" : " missing"}`}
                    style={r && a.image_url ? { backgroundImage: `url(${a.image_url})` } : undefined}
                  >
                    {!r && "?"}
                  </span>
                );
              })}
            </span>
            <span className="ao-cat-arrow">→</span>
          </button>
        );
      })}

      {total === 0 && (
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 16 }}>
          确认场景后，Viby 会在这里列出需要的参考图。
        </p>
      )}
    </div>
  );
}

/**
 * Full-page asset manager. Used on /app/projects/[id]/assets.
 * Shows all assets grouped by type with full edit/upload/generate actions.
 */
export function AssetManagerFull({
  projectId,
  assets,
  filterType,
}: {
  projectId: string;
  assets: DashAsset[];
  filterType?: string;
}) {
  const [list, setList] = useState(assets);
  const [openId, setOpenId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const open = list.find((a) => a.id === openId) ?? null;

  async function uploadAsset(assetId: string, file: File) {
    setUploadingId(assetId);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(
        `/api/projects/${projectId}/assets/${assetId}/upload`,
        { method: "POST", body: form }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "上传失败");
      setList((l) =>
        l.map((a) =>
          a.id === assetId
            ? { ...a, status: "uploaded", image_url: data.imageUrl }
            : a
        )
      );
    } finally {
      setUploadingId(null);
    }
  }

  const groups = GROUPS.filter(
    (g) => !filterType || g.type === filterType
  );

  return (
    <div className="amf-wrap">
      <div className="amf-head">
        <div>
          <h1 className="page-title">资产管理</h1>
          <p className="page-sub">
            管理本项目的所有参考图。可以 AI 生成，也可以上传自己的实拍图、达人照片或空间参考。
          </p>
        </div>
        <div className="amf-stats">
          <span className="amf-stat-item">
            共 <b>{list.length}</b> 项
          </span>
          <span className="amf-stat-item ok">
            <b>{list.filter((a) => a.status === "generated" || a.status === "uploaded").length}</b> 就绪
          </span>
          <span className="amf-stat-item warn">
            <b>{list.filter((a) => a.status === "missing").length}</b> 待补充
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="amf-filters">
        <a
          href={`/app/projects/${projectId}/assets`}
          className={`amf-filter${!filterType ? " active" : ""}`}
        >
          全部
        </a>
        {GROUPS.map((g) => {
          const count = list.filter((a) => a.asset_type === g.type).length;
          if (count === 0) return null;
          return (
            <a
              key={g.type}
              href={`/app/projects/${projectId}/assets?type=${g.type}`}
              className={`amf-filter${filterType === g.type ? " active" : ""}`}
            >
              {g.label} ({count})
            </a>
          );
        })}
      </div>

      {groups.map((g) => {
        const items = list.filter((a) => a.asset_type === g.type);
        if (items.length === 0) return null;
        return (
          <div className="amf-section" key={g.type}>
            <div className="amf-section-head">
              <span className="amf-section-title">{g.label}</span>
              <span className="amf-section-count">
                {items.filter((a) => a.status === "generated" || a.status === "uploaded").length}
                /{items.length} 就绪
              </span>
              {/* Character reference hint: first ready asset anchors the rest */}
              {g.type === "character" && items.some((a) => a.status === "generated" || a.status === "uploaded") && (
                <span style={{ fontSize: 11, color: "var(--ok)", fontFamily: "var(--font-mono)", marginLeft: "auto" }}>
                  ✓ 参考图已就绪，后续角色将自动参考
                </span>
              )}
              {g.type === "character" && !items.some((a) => a.status === "generated" || a.status === "uploaded") && (
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", marginLeft: "auto" }}>
                  建议先生成 {items[0]?.name ?? "C01"} 作为角色基准
                </span>
              )}
            </div>
            <div className="amf-grid">
              {items.map((a) => {
                const r = a.status === "generated" || a.status === "uploaded";
                const isUploading = uploadingId === a.id;
                return (
                  <div className={`amf-card${r ? "" : " missing"}`} key={a.id}>
                    <div className="amf-card-thumb">
                      {isUploading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                          <span style={{ width: 18, height: 18, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", display: "inline-block", animation: "viby-spin 0.6s linear infinite" }} />
                        </div>
                      ) : r && a.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.image_url} alt={a.name} />
                      ) : (
                        <span className="amf-card-placeholder">?</span>
                      )}
                      <span className={`amf-card-badge ${r ? "ok" : "warn"}`}>
                        {r ? (a.status === "uploaded" ? "已上传" : "已生成") : "未生成"}
                      </span>
                    </div>
                    <div className="amf-card-body">
                      <div className="amf-card-name">{a.name}</div>
                      <div className="amf-card-desc">
                        {a.description ?? "无描述"}
                      </div>
                      <div className="amf-card-actions">
                        <button
                          className="btn-s"
                          onClick={() => setOpenId(a.id)}
                        >
                          {r ? "查看 / 重新生成" : "AI 生成"}
                        </button>
                        <label
                          className={`btn-s${isUploading ? " disabled" : ""}`}
                          style={{ cursor: isUploading ? "wait" : "pointer" }}
                        >
                          {isUploading
                            ? "上传中…"
                            : r
                              ? "上传替换"
                              : "上传参考图"}
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            disabled={isUploading}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void uploadAsset(a.id, f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {list.length === 0 && (
        <div className="amf-empty">
          <p>还没有资产。确认场景后，Viby 会自动列出需要的参考图。</p>
        </div>
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
      <style>{`@keyframes viby-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
