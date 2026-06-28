"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface SceneWithStoryboard {
  id: string;
  scene_number: number;
  title: string;
  image_url: string | null;
  prompt: string | null;
  grid_size: number;
}

const GRID_OPTIONS = [6, 9, 12, 16, 18];

export function StoryboardWorkspace({
  projectId,
  scenes,
}: {
  projectId: string;
  scenes: SceneWithStoryboard[];
}) {
  const router = useRouter();
  const [gridSize, setGridSize] = useState(16);
  const [ratio, setRatio] = useState<"16:9" | "9:16">("16:9");
  const [items, setItems] = useState(scenes);
  const [generatingAll, setGeneratingAll] = useState(false);

  function patch(id: string, p: Partial<SceneWithStoryboard>) {
    setItems((list) => list.map((s) => (s.id === id ? { ...s, ...p } : s)));
  }

  async function generateOne(sceneId: string, customPrompt?: string) {
    const res = await fetch(
      `/api/projects/${projectId}/storyboards/${sceneId}/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gridSize, aspectRatio: ratio, customPrompt }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok) patch(sceneId, { image_url: data.imageUrl, prompt: data.prompt });
    return res.ok;
  }

  async function genAll() {
    setGeneratingAll(true);
    for (const s of items) await generateOne(s.id);
    setGeneratingAll(false);
  }

  return (
    <>
      <div className="board-main">
        <div className="board-options" style={{ opacity: generatingAll ? 0.5 : 1 }}>
          <div className="bo-row">
            <span className="bo-label">生成格式</span>
            {GRID_OPTIONS.map((g) => (
              <button
                key={g}
                className={`bo-chip${gridSize === g ? " sel" : ""}`}
                onClick={() => setGridSize(g)}
              >
                {g}格
              </button>
            ))}
          </div>
          <div className="bo-row">
            <span className="bo-label">画面比例</span>
            <button
              className={`bo-chip${ratio === "16:9" ? " sel" : ""}`}
              onClick={() => setRatio("16:9")}
            >
              横版 16:9
            </button>
            <button
              className={`bo-chip${ratio === "9:16" ? " sel" : ""}`}
              onClick={() => setRatio("9:16")}
            >
              竖版 9:16
            </button>
          </div>
          <button className="btn-p" style={{ marginTop: 8 }} onClick={genAll} disabled={generatingAll || items.length === 0}>
            {generatingAll ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, border: "1.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "viby-spin 0.6s linear infinite" }} />
                生成中…
              </span>
            ) : "生成全部场景的 Storyboard"}
          </button>
        </div>

        {items.length === 0 && (
          <p style={{ color: "var(--muted)" }}>还没有场景，请先完成场景 & 分镜步骤。</p>
        )}

        {items.map((scene) => (
          <BoardScene
            key={scene.id}
            scene={scene}
            vertical={ratio === "9:16"}
            onRegenerate={(p) => generateOne(scene.id, p)}
          />
        ))}
      </div>

      <div className="action-bar">
        <div className="ab-left">
          <button className="btn-g" onClick={() => router.push(`/app/projects/${projectId}/scenes`)}>
            ← 返回场景
          </button>
        </div>
        <button className="btn-p" onClick={() => router.push(`/app/projects/${projectId}/export`)}>
          前往导出 →
        </button>
      </div>
      <style>{`@keyframes viby-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

function BoardScene({
  scene,
  vertical,
  onRegenerate,
}: {
  scene: SceneWithStoryboard;
  vertical: boolean;
  onRegenerate: (customPrompt?: string) => Promise<boolean>;
}) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [promptDraft, setPromptDraft] = useState(scene.prompt ?? "");

  async function run(customPrompt?: string) {
    setBusy(true);
    await onRegenerate(customPrompt);
    setBusy(false);
    setEditing(false);
  }

  return (
    <div className="board-scene">
      <div className="board-scene-head">
        场景 {String(scene.scene_number).padStart(2, "0")} · {scene.title}
      </div>
      <div className="board-rule" />
      <div className={`board-frame${vertical ? " vertical" : ""}`}>
        {busy ? (
          <div className="board-progress" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", display: "inline-block", animation: "viby-spin 0.6s linear infinite" }} />
            <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>生成中…</span>
          </div>
        ) : scene.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={scene.image_url} alt={`场景 ${scene.scene_number} storyboard`} />
        ) : (
          <span className="board-placeholder">未生成</span>
        )}
      </div>

      {scene.image_url && !busy && (
        <div className="board-actions">
          <button
            className="board-btn"
            onClick={() => {
              setPromptDraft(scene.prompt ?? "");
              setEditing((e) => !e);
            }}
          >
            查看/编辑提示词
          </button>
          <button className="board-btn" onClick={() => void run()}>
            重新生成
          </button>
          <a
            className="board-btn"
            href={scene.image_url}
            download={`storyboard-scene-${scene.scene_number}.png`}
            target="_blank"
            rel="noreferrer"
          >
            下载此图
          </a>
        </div>
      )}

      {editing && (
        <div className="prompt-edit">
          <textarea value={promptDraft} onChange={(e) => setPromptDraft(e.target.value)} />
          <div className="prompt-edit-actions">
            <button className="btn-s" onClick={() => setEditing(false)}>
              取消
            </button>
            <button className="btn-s solid" onClick={() => void run(promptDraft)}>
              用此提示词重新生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
