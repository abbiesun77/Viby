"use client";

import { useState } from "react";
import { AssetPanel, type AssetPanelData } from "./asset-panel";

export interface DemoAsset {
  id: string;
  asset_type: "character" | "scene" | "prop" | "style";
  name: string;
  description: string | null;
  image_url: string | null;
  status: string;
}

const GROUPS: { type: DemoAsset["asset_type"]; label: string }[] = [
  { type: "character", label: "角色" },
  { type: "scene", label: "场景" },
  { type: "prop", label: "道具" },
  { type: "style", label: "风格锚点" },
];

/**
 * Demo-mode asset OVERVIEW for the dashboard right column.
 * Shows stats + category shortcuts that jump to the full asset page.
 * Mirrors the real AssetOverview component.
 */
export function DemoAssetOverview({ assets }: { assets: DemoAsset[] }) {
  const total = assets.length;
  const ready = assets.filter(
    (a) => a.status === "generated" || a.status === "uploaded"
  ).length;
  const missing = assets.filter((a) => a.status === "missing").length;

  return (
    <div id="asset-col">
      <div className="ao-head">
        <p className="kicker" style={{ marginBottom: 0 }}>资产速览</p>
        <a className="ao-manage-btn" href="/app/demo/assets">管理全部 →</a>
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
          <a
            key={g.type}
            className="ao-cat"
            href={`/app/demo/assets?type=${g.type}`}
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
                  >
                    {!r && "?"}
                  </span>
                );
              })}
            </span>
            <span className="ao-cat-arrow">→</span>
          </a>
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
 * Legacy demo asset manager (kept for backward compat, unused now).
 * Dashboard now uses DemoAssetOverview; full page uses DemoAssetManagerFull.
 */
export function DemoAssetManager({ assets }: { assets: DemoAsset[] }) {
  const [list, setList] = useState(assets);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = list.find((a) => a.id === openId) ?? null;

  return (
    <div id="asset-col">
      <p className="kicker">资产管理</p>
      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: -8, marginBottom: 18 }}>
        演示模式下可点击查看交互，但生成与上传不会真正执行。
      </p>

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
                      {ready ? (a.status === "uploaded" ? "已上传" : "已生成") : "⚠ 未生成"}
                    </div>
                    <div className="asset-btns">
                      <button className="asset-btn" onClick={() => setOpenId(a.id)}>
                        {ready ? "查看 / 重新生成" : "生成"}
                      </button>
                      <button className="asset-btn" onClick={() => setOpenId(a.id)}>
                        {ready ? "上传替换" : "上传参考图"}
                      </button>
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
        <DemoAssetPanel
          asset={open}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

/**
 * Wraps the real AssetPanel but intercepts generate/upload to show a
 * demo-mode notice. Keeps the UI identical to production.
 */
function DemoAssetPanel({
  asset,
  onClose,
}: {
  asset: DemoAsset;
  onClose: () => void;
}) {
  const [notice] = useState("演示模式下此操作不可用。配置 Supabase 和 AI 接口后即可正常生成与上传。");

  // Build AssetPanelData; we pass a no-op onSaved so the "使用这张" button
  // just closes in demo mode.
  const panelData: AssetPanelData = {
    id: asset.id,
    name: asset.name,
    asset_type: asset.asset_type,
    description: asset.description,
    image_url: asset.image_url,
    status: asset.status,
  };

  return (
    <>
      <div className="vbyws-drawer-scrim open" onClick={onClose} />
      <aside className="vbyws-drawer open" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <span className="drawer-title">资产：{asset.name}</span>
          <button className="drawer-close" onClick={onClose} aria-label="关闭">×</button>
        </div>
        <div className="drawer-body">
          <div className="drawer-status">
            当前状态：{asset.image_url ? "已生成" : "未生成"}
          </div>
          <div className="drawer-bubble">
            查看这个资产的描述。配置后可在此用 AI 生成或上传参考图。
          </div>

          <div className="drawer-input-row">
            <textarea
              value={asset.description ?? ""}
              readOnly
              placeholder="资产描述"
            />
          </div>

          <div className="dp-label">预览</div>
          <div className={`dp-frame${asset.image_url ? " done" : ""}`}>
            {asset.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.image_url} alt={asset.name} />
            ) : (
              <span className="dp-hint">演示模式 · 无预览图</span>
            )}
          </div>

          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 14, lineHeight: 1.5, padding: "10px 12px", border: "1px solid var(--border)", background: "color-mix(in oklch, var(--accent) 4%, transparent)" }}>
            {notice}
          </p>

          <div className="dp-actions">
            <button className="btn-s" disabled>生成（演示不可用）</button>
            <label className="btn-s" style={{ cursor: "not-allowed", opacity: 0.5 }}>
              上传参考图（演示不可用）
            </label>
            <button className="btn-s" onClick={onClose}>关闭</button>
          </div>
        </div>
      </aside>
    </>
  );
}

const FULL_GROUPS: { type: DemoAsset["asset_type"]; label: string }[] = [
  { type: "character", label: "角色" },
  { type: "scene", label: "场景" },
  { type: "prop", label: "道具" },
  { type: "style", label: "风格锚点" },
];

/**
 * Demo-mode full-page asset manager. Mirrors the real AssetManagerFull
 * layout: header + stats + filter tabs + grouped grid of asset cards.
 * All generate/upload buttons are disabled with a demo notice.
 */
export function DemoAssetManagerFull({
  assets,
  filterType,
}: {
  assets: DemoAsset[];
  filterType?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = assets.find((a) => a.id === openId) ?? null;

  const total = assets.length;
  const ready = assets.filter(
    (a) => a.status === "generated" || a.status === "uploaded"
  ).length;
  const missing = assets.filter((a) => a.status === "missing").length;

  const groups = FULL_GROUPS.filter(
    (g) => !filterType || g.type === filterType
  );

  return (
    <div className="amf-wrap">
      <div className="amf-head">
        <div>
          <h1 className="page-title">资产管理</h1>
          <p className="page-sub">
            管理本项目的所有参考图。演示模式下可浏览，生成与上传不可用。
          </p>
        </div>
        <div className="amf-stats">
          <span className="amf-stat-item">共 <b>{total}</b> 项</span>
          <span className="amf-stat-item ok"><b>{ready}</b> 就绪</span>
          <span className="amf-stat-item warn"><b>{missing}</b> 待补充</span>
        </div>
      </div>

      <div className="amf-filters">
        <a href="/app/demo/assets" className={`amf-filter${!filterType ? " active" : ""}`}>全部</a>
        {FULL_GROUPS.map((g) => {
          const count = assets.filter((a) => a.asset_type === g.type).length;
          if (count === 0) return null;
          return (
            <a
              key={g.type}
              href={`/app/demo/assets?type=${g.type}`}
              className={`amf-filter${filterType === g.type ? " active" : ""}`}
            >
              {g.label} ({count})
            </a>
          );
        })}
      </div>

      {groups.map((g) => {
        const items = assets.filter((a) => a.asset_type === g.type);
        if (items.length === 0) return null;
        const groupReady = items.filter(
          (a) => a.status === "generated" || a.status === "uploaded"
        ).length;
        return (
          <div className="amf-section" key={g.type}>
            <div className="amf-section-head">
              <span className="amf-section-title">{g.label}</span>
              <span className="amf-section-count">{groupReady}/{items.length} 就绪</span>
            </div>
            <div className="amf-grid">
              {items.map((a) => {
                const r = a.status === "generated" || a.status === "uploaded";
                return (
                  <div className={`amf-card${r ? "" : " missing"}`} key={a.id}>
                    <div className="amf-card-thumb">
                      {r && a.image_url ? (
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
                      <div className="amf-card-desc">{a.description ?? "无描述"}</div>
                      <div className="amf-card-actions">
                        <button className="btn-s" onClick={() => setOpenId(a.id)}>
                          {r ? "查看 / 重新生成" : "AI 生成"}
                        </button>
                        <label className="btn-s" style={{ cursor: "not-allowed", opacity: 0.5 }}>
                          {r ? "上传替换" : "上传参考图"}
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

      {open && (
        <DemoAssetPanel
          asset={open}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
