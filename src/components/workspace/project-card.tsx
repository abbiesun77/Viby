"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const STATE_LABELS: Record<string, string> = {
  onboarding: "准备中", script: "剧本", scenes: "场景 & 分镜",
  storyboard: "Storyboard", done: "已完成",
};
const STATE_PROGRESS: Record<string, number> = {
  onboarding: 0, script: 25, scenes: 50, storyboard: 75, done: 100,
};

export interface ProjectCardData {
  id: string;
  title: string;
  workflow_state: string;
  style: string | null;
  duration: string | null;
  mood: string | null;
  updated_at: string;
}

export function ProjectCardActions({ project }: { project: ProjectCardData }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const state = project.workflow_state ?? "onboarding";
  const progress = STATE_PROGRESS[state] ?? 0;
  const meta = [project.style, project.duration, project.mood].filter(Boolean).join(" · ");

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  async function handleRename() {
    const t = title.trim();
    if (!t || t === project.title) { setRenaming(false); setTitle(project.title); return; }
    setBusy(true);
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t }),
    });
    setBusy(false);
    setRenaming(false);
    router.refresh();
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(true); // start exit animation immediately
    await new Promise((r) => setTimeout(r, 280)); // let transition finish
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div
      className="pcard"
      style={{
        position: "relative",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        opacity: deleting ? 0 : 1,
        transform: deleting ? "scale(0.96)" : "scale(1)",
        pointerEvents: deleting ? "none" : undefined,
      }}
    >
      {/* Action buttons — completely outside nav area */}
      <div className="pcard-actions" onClick={(e) => e.stopPropagation()}>
        {confirmDel ? (
          <>
            <button
              className="pcard-action-btn pcard-action-del"
              style={{ width: "auto", padding: "0 8px" }}
              onClick={handleDelete}
              disabled={busy}
            >确认删除</button>
            <button
              className="pcard-action-btn"
              style={{ width: "auto", padding: "0 8px" }}
              onClick={(e) => { e.stopPropagation(); setConfirmDel(false); }}
            >取消</button>
          </>
        ) : (
          <>
            <button
              className="pcard-action-btn"
              title="改名"
              onClick={(e) => { e.stopPropagation(); setRenaming(true); }}
              disabled={busy}
            >✎</button>
            <button
              className="pcard-action-btn pcard-action-del"
              title="删除"
              onClick={(e) => { e.stopPropagation(); setConfirmDel(true); }}
              disabled={busy}
            >×</button>
          </>
        )}
      </div>

      {/* Card body — use div + router.push, not Link, so action clicks never trigger nav */}
      <div
        style={{ cursor: "pointer" }}
        onClick={() => !renaming && !confirmDel && router.push(`/app/projects/${project.id}`)}
      >
        <div className="pcard-thumb-wrap">
          <div className="pcard-thumb" data-state={state} />
          <span className="pcard-state-pill">{STATE_LABELS[state] ?? state}</span>
        </div>
        <div className="pcard-body">
          {renaming ? (
            <input
              ref={inputRef}
              className="pcard-rename-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") { setRenaming(false); setTitle(project.title); }
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="pcard-t">{title}</div>
          )}
          {meta && <div className="pcard-meta">{meta}</div>}
          <div className="pcard-progress">
            <div className="pcard-progress-bar">
              <div className="pcard-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="pcard-progress-label">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
