"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface Scene {
  id: string;
  scene_number: number;
  title: string;
}
export interface Shot {
  id: string;
  scene_id: string;
  shot_number: number;
  framing: string | null;
  subject: string | null;
  action: string | null;
  mood: string | null;
}
export interface Asset {
  id: string;
  asset_type: "character" | "scene" | "prop" | "style";
  name: string;
  description: string | null;
  status: string;
  priority: "required" | "suggested";
}

const FRAMING_OPTIONS = ["远景", "全景", "中景", "近景", "特写", "双人中景"];

export function SceneWorkspace({
  projectId,
  initialScenes,
  initialShots,
  initialAssets,
  onOpenAsset,
  onUploadAsset,
  assetStatus,
}: {
  projectId: string;
  initialScenes: Scene[];
  initialShots: Shot[];
  initialAssets: Asset[];
  onOpenAsset?: (assetId: string) => void;
  onUploadAsset?: (assetId: string, file: File) => Promise<void>;
  assetStatus?: Record<string, "missing" | "done" | "skipped">;
}) {
  const router = useRouter();
  const [shots, setShots] = useState(initialShots);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const status = assetStatus ?? {};
  // Capture the initial missing set once so补充后仍显示「✓ 已补充」而非消失。
  const [gapAssets] = useState(() =>
    initialAssets.filter((a) => a.status === "missing")
  );
  const visibleGaps = gapAssets;

  async function confirmScenes() {
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/scenes/confirm`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("确认失败");
      router.push(`/app/projects/${projectId}/storyboard`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "确认失败");
      setConfirming(false);
    }
  }

  return (
    <>
      <div className="scenes-main">
        {initialScenes.length === 0 && (
          <p style={{ color: "var(--muted)" }}>
            还没有场景数据。请先在剧本步骤确认剧本。
          </p>
        )}

        {initialScenes.map((scene, idx) => (
          <SceneBlock
            key={scene.id}
            scene={scene}
            defaultOpen={idx === 0}
            shots={shots.filter((s) => s.scene_id === scene.id)}
            projectId={projectId}
            onOpenAsset={onOpenAsset}
            onShotsChange={(next) =>
              setShots((all) => [
                ...all.filter((s) => s.scene_id !== scene.id),
                ...next,
              ])
            }
          />
        ))}

        {visibleGaps.length > 0 && (
          <div className="gap-panel">
            <div className="gap-title">
              以下参考图缺失，建议在生成 Storyboard 前补充：
            </div>
            <div className="gap-subtitle">
              有自己的实拍图、达人照片或空间参考？直接上传即可。也可以让 AI 生成。
            </div>
            {visibleGaps.map((a) => {
              const st = status[a.id] ?? (skipped.has(a.id) ? "skipped" : "missing");
              const done = st === "done";
              const skip = st === "skipped";
              const genLabel =
                a.asset_type === "character"
                  ? "AI 生成三视图"
                  : a.asset_type === "scene"
                    ? "AI 生成空间图"
                    : a.asset_type === "prop"
                      ? "AI 生成道具图"
                      : "AI 生成风格图";
              const isUploading = uploadingId === a.id;
              return (
                <div key={a.id} className={`gap-row${done || skip ? " done" : ""}`}>
                  <span
                    className={`gap-dot ${done ? "done" : skip ? "skip" : a.priority === "required" ? "red" : "yellow"}`}
                  />
                  <span className="gap-name">{a.name}</span>
                  {done ? (
                    <span className="gap-done-tag">✓ 已补充</span>
                  ) : skip ? (
                    <span className="gap-done-tag">已跳过</span>
                  ) : (
                    <span className="gap-actions">
                      <button
                        className="gap-btn solid"
                        disabled={isUploading}
                        onClick={() => onOpenAsset?.(a.id)}
                      >
                        {genLabel}
                      </button>
                      <label
                        className={`gap-btn${isUploading ? " disabled" : ""}`}
                        style={{ cursor: isUploading ? "wait" : "pointer" }}
                      >
                        {isUploading ? "上传中…" : "上传参考图"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          disabled={isUploading}
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f || !onUploadAsset) return;
                            setUploadingId(a.id);
                            try {
                              await onUploadAsset(a.id, f);
                            } finally {
                              setUploadingId(null);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                      <button
                        className="gap-btn skip"
                        onClick={() => setSkipped((s) => new Set(s).add(a.id))}
                      >
                        跳过
                      </button>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="action-bar">
        <div className="ab-left">
          <button
            className="btn-g"
            onClick={() => router.push(`/app/projects/${projectId}/script`)}
          >
            ← 返回剧本
          </button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {error && (
            <span style={{ color: "var(--err)", fontSize: 13, alignSelf: "center" }}>
              {error}
            </span>
          )}
          <button
            className="btn-p"
            onClick={confirmScenes}
            disabled={confirming || initialScenes.length === 0}
          >
            {confirming ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, border: "1.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "viby-spin 0.6s linear infinite" }} />
                处理中…
              </span>
            ) : "确认场景，生成 Storyboard →"}
          </button>
        </div>
      </div>
      <style>{`@keyframes viby-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

function SceneBlock({
  scene,
  shots,
  projectId,
  defaultOpen,
  onShotsChange,
  onOpenAsset,
}: {
  scene: Scene;
  shots: Shot[];
  projectId: string;
  defaultOpen: boolean;
  onShotsChange: (next: Shot[]) => void;
  onOpenAsset?: (assetId: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  async function addShot() {
    const res = await fetch(`/api/projects/${projectId}/shots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sceneId: scene.id }),
    });
    if (res.ok) {
      const { shot } = await res.json();
      onShotsChange([...shots, shot]);
    }
  }

  return (
    <div className={`scene-block${open ? " open" : ""}`}>
      <div className="scene-bar" onClick={() => setOpen((o) => !o)}>
        <span className="scene-caret">▶</span>
        <span className="scene-name">
          场景 {String(scene.scene_number).padStart(2, "0")} · {scene.title}
        </span>
        <span className="scene-count">{shots.length} 分镜</span>
      </div>
      {open && (
        <div className="scene-body">
          {shots.map((shot) => (
            <ShotRow
              key={shot.id}
              shot={shot}
              projectId={projectId}
              onChange={(next) =>
                onShotsChange(shots.map((s) => (s.id === next.id ? next : s)))
              }
              onDelete={() => onShotsChange(shots.filter((s) => s.id !== shot.id))}
            />
          ))}
          <button className="add-shot" onClick={addShot}>
            ＋ 添加分镜
          </button>
        </div>
      )}
    </div>
  );
}

function ShotRow({
  shot,
  projectId,
  onChange,
  onDelete,
}: {
  shot: Shot;
  projectId: string;
  onChange: (next: Shot) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(shot);
  const [savingShot, setSavingShot] = useState(false);

  async function save() {
    setSavingShot(true);
    await fetch(`/api/projects/${projectId}/shots/${shot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        framing: draft.framing,
        subject: draft.subject,
        action: draft.action,
        mood: draft.mood,
      }),
    });
    onChange(draft);
    setEditing(false);
    setSavingShot(false);
  }

  return (
    <div className="shot-row">
      <div className="shot-top">
        <span className="shot-no">镜 {String(shot.shot_number).padStart(2, "0")}</span>
        {!editing && (
          <button className="shot-edit-btn" onClick={() => { setDraft(shot); setEditing(true); }}>
            编辑
          </button>
        )}
      </div>

      {editing ? (
        <div className="shot-form">
          <label>景别/角度</label>
          <select
            value={draft.framing ?? ""}
            onChange={(e) => setDraft({ ...draft, framing: e.target.value })}
          >
            {[draft.framing, ...FRAMING_OPTIONS]
              .filter((v, i, a) => v && a.indexOf(v) === i)
              .map((f) => (
                <option key={f as string}>{f}</option>
              ))}
          </select>
          <label>画面主体</label>
          <input
            value={draft.subject ?? ""}
            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
          />
          <label>动作/内容</label>
          <input
            value={draft.action ?? ""}
            onChange={(e) => setDraft({ ...draft, action: e.target.value })}
          />
          <label>情绪/氛围</label>
          <input
            value={draft.mood ?? ""}
            onChange={(e) => setDraft({ ...draft, mood: e.target.value })}
          />
          <div className="shot-form-actions">
            <button className="btn-s" onClick={() => { setDraft(shot); setEditing(false); }}>
              取消
            </button>
            <button className="btn-s solid" onClick={save} disabled={savingShot}>
              {savingShot ? (
                <span style={{ width: 12, height: 12, border: "1.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "viby-spin 0.6s linear infinite" }} />
              ) : "保存"}
            </button>
          </div>
        </div>
      ) : (
        <div className="shot-fields">
          <span className="shot-k">景别</span>
          <span className="shot-v">{shot.framing || "-"}</span>
          <span className="shot-k">主体</span>
          <span className="shot-v">{shot.subject || "-"}</span>
          <span className="shot-k">动作</span>
          <span className="shot-v">{shot.action || "-"}</span>
          <span className="shot-k">氛围</span>
          <span className="shot-v">{shot.mood || "-"}</span>
        </div>
      )}
    </div>
  );
}
