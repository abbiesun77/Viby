"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Page skeletons for Next.js loading.tsx — light editorial style.
 *
 * Each variant mirrors the REAL layout of its page (same containers,
 * spacing, column counts, element sizes) so the skeleton "snaps" into
 * the loaded content instead of jumping. Warm-gray blocks, no purple.
 *
 * Animation split to avoid property fights:
 *  - entrance: GSAP stagger, drives only `y` + a one-shot `autoAlpha`
 *  - shimmer:  pure CSS keyframe on `background-position` (never touches
 *    opacity / transform), so it can't collide with the entrance tween.
 */

export type SkeletonVariant =
  | "list"
  | "dashboard"
  | "editor"
  | "board"
  | "assets"
  | "export"
  | "settings"
  | "new";

const SHIMMER_CSS = `
@keyframes vbySkShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.vby-sk {
  background: linear-gradient(
    90deg,
    oklch(92% 0.005 95) 25%,
    oklch(95% 0.004 95) 50%,
    oklch(92% 0.005 95) 75%
  );
  background-size: 200% 100%;
  animation: vbySkShimmer 1.6s ease-in-out infinite;
  border-radius: 6px;
}
@media (prefers-reduced-motion: reduce) {
  .vby-sk { animation: none; }
}
`;

function useSkeletonEntrance() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.from(".vby-sk", {
        autoAlpha: 0,
        y: 8,
        duration: 0.3,
        ease: "power2.out",
        stagger: 0.04,
        clearProps: "opacity,visibility,transform",
      });
    },
    { scope: ref }
  );
  return ref;
}

const SK = "vby-sk";

/** 56px top navigation bar — only for pages that render their own topnav. */
function TopnavSkeleton() {
  return (
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid oklch(90% 0.006 95)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className={SK} style={{ height: 18, width: 54 }} />
        <div className={SK} style={{ height: 12, width: 80, opacity: 0.6 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className={SK} style={{ height: 24, width: 76 }} />
        <div className={SK} style={{ height: 28, width: 64 }} />
      </div>
    </div>
  );
}

/** 52px three-tab progress bar (script / scenes / storyboard). */
function TabbarSkeleton() {
  return (
    <div
      style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "0 24px",
        borderBottom: "1px solid oklch(90% 0.006 95)",
      }}
    >
      {[64, 96, 88].map((w, i) => (
        <div key={i} className={SK} style={{ height: 16, width: w }} />
      ))}
    </div>
  );
}

export function PageSkeleton({
  variant = "dashboard",
  topnav = false,
}: {
  variant?: SkeletonVariant;
  /** Prepend a topnav skeleton — for pages that render their own nav
   *  (e.g. /app/demo, whose layout doesn't supply one). */
  topnav?: boolean;
}) {
  const ref = useSkeletonEntrance();

  return (
    <div ref={ref}>
      <style>{SHIMMER_CSS}</style>
      {topnav && <TopnavSkeleton />}
      {renderVariant(variant)}
    </div>
  );
}

function renderVariant(variant: SkeletonVariant) {
  switch (variant) {
    case "list":
      return <ListSkeleton />;
    case "dashboard":
      return <DashboardSkeleton />;
    case "editor":
      return <EditorSkeleton />;
    case "board":
      return <BoardSkeleton />;
    case "assets":
      return <AssetsSkeleton />;
    case "export":
      return <ExportSkeleton />;
    case "settings":
      return <SettingsSkeleton />;
    case "new":
      return <NewSkeleton />;
  }
}

/* ── /app — project list ────────────────────────────────────────── */
function ListSkeleton() {
  return (
    <>
      <TopnavSkeleton />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 36px 0" }}>
        <div className={SK} style={{ height: 12, width: 72 }} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "24px 36px 64px",
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{ border: "1px solid oklch(90% 0.006 95)", overflow: "hidden" }}
          >
            <div
              className={SK}
              style={{ aspectRatio: "16 / 10", borderRadius: 0 }}
            />
            <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div className={SK} style={{ height: 18, width: "70%" }} />
              <div className={SK} style={{ height: 12, width: "90%" }} />
              <div className={SK} style={{ height: 3, width: "100%", marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── /app/projects/[id] — dashboard (topnav from layout) ────────── */
function DashboardSkeleton() {
  return (
    <div style={{ minHeight: "calc(100vh - 56px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 36px 0" }}>
        <div className={SK} style={{ height: 34, width: 280, marginBottom: 10 }} />
        <div className={SK} style={{ height: 14, width: 360, marginBottom: 28 }} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 32,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 36px 48px",
        }}
      >
        <div>
          <div className={SK} style={{ height: 12, width: 72, marginBottom: 14 }} />
          <div style={{ border: "1px solid oklch(90% 0.006 95)", marginBottom: 28 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 18px",
                  borderBottom: i < 3 ? "1px solid oklch(90% 0.006 95)" : "none",
                }}
              >
                <div className={SK} style={{ height: 22, width: 22, borderRadius: "50%" }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className={SK} style={{ height: 15, width: "40%" }} />
                  <div className={SK} style={{ height: 12, width: "60%" }} />
                </div>
                <div className={SK} style={{ height: 28, width: 76 }} />
              </div>
            ))}
          </div>
          <div className={SK} style={{ height: 46, width: "100%" }} />
        </div>
        <div>
          <div className={SK} style={{ height: 12, width: 72, marginBottom: 14 }} />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                border: "1px solid oklch(90% 0.006 95)",
                padding: "12px 14px",
                marginBottom: 8,
              }}
            >
              <div className={SK} style={{ height: 48, width: 48 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div className={SK} style={{ height: 14, width: "50%" }} />
                <div className={SK} style={{ height: 11, width: "75%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── script / scenes — tabbar + two-column editor ───────────────── */
function EditorSkeleton() {
  return (
    <>
      <TabbarSkeleton />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          minHeight: "calc(100vh - 109px)",
        }}
      >
        <div style={{ padding: "32px clamp(24px, 4vw, 56px)", borderRight: "1px solid oklch(90% 0.006 95)" }}>
          <div style={{ maxWidth: 680 }}>
            <div className={SK} style={{ height: 12, width: 120, marginBottom: 16 }} />
            {[92, 100, 100, 78].map((w, i) => (
              <div key={i} className={SK} style={{ height: 16, width: `${w}%`, marginBottom: 12 }} />
            ))}
            <div className={SK} style={{ height: 12, width: 120, margin: "28px 0 16px" }} />
            {[100, 88, 95, 70].map((w, i) => (
              <div key={i} className={SK} style={{ height: 16, width: `${w}%`, marginBottom: 12 }} />
            ))}
          </div>
        </div>
        <div style={{ padding: "24px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div className={SK} style={{ height: 16, width: 100 }} />
          <div className={SK} style={{ height: 12, width: "80%", marginBottom: 8 }} />
          <div className={SK} style={{ height: 56, width: "85%", alignSelf: "flex-start" }} />
          <div className={SK} style={{ height: 44, width: "70%", alignSelf: "flex-end" }} />
          <div className={SK} style={{ height: 56, width: "85%", alignSelf: "flex-start" }} />
          <div style={{ marginTop: "auto", display: "flex", gap: 6 }}>
            <div className={SK} style={{ height: 38, flex: 1 }} />
            <div className={SK} style={{ height: 38, width: 56 }} />
          </div>
        </div>
      </div>
    </>
  );
}

/* ── storyboard — tabbar + board layout ─────────────────────────── */
function BoardSkeleton() {
  return (
    <>
      <TabbarSkeleton />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          minHeight: "calc(100vh - 109px)",
        }}
      >
        <div style={{ padding: "32px clamp(24px, 4vw, 56px)" }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{ border: "1px solid oklch(90% 0.006 95)", marginBottom: 16 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px" }}>
                <div className={SK} style={{ height: 16, width: 160 }} />
                <div className={SK} style={{ height: 12, width: 48, marginLeft: "auto" }} />
              </div>
              <div className={SK} style={{ margin: "0 18px 16px", aspectRatio: "16 / 9", borderRadius: 0 }} />
            </div>
          ))}
        </div>
        <div style={{ padding: "24px 22px", borderLeft: "1px solid oklch(90% 0.006 95)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className={SK} style={{ height: 16, width: 120, marginBottom: 8 }} />
          <div className={SK} style={{ height: 40, width: "100%" }} />
          <div className={SK} style={{ height: 40, width: "100%" }} />
          <div className={SK} style={{ height: 64, width: "100%", marginTop: 8 }} />
        </div>
      </div>
    </>
  );
}

/* ── assets — tabbar + filters + card grid ──────────────────────── */
function AssetsSkeleton() {
  return (
    <>
      <TabbarSkeleton />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px clamp(24px, 4vw, 48px) 64px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className={SK} style={{ height: 30, width: 160 }} />
            <div className={SK} style={{ height: 13, width: 280 }} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={SK} style={{ height: 13, width: 56 }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid oklch(90% 0.006 95)" }}>
          {[48, 64, 56, 64, 56].map((w, i) => (
            <div key={i} className={SK} style={{ height: 16, width: w, margin: "10px 20px 12px 0" }} />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ border: "1px solid oklch(90% 0.006 95)", overflow: "hidden" }}>
              <div className={SK} style={{ aspectRatio: "4 / 3", borderRadius: 0 }} />
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div className={SK} style={{ height: 14, width: "60%" }} />
                <div className={SK} style={{ height: 11, width: "90%" }} />
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <div className={SK} style={{ height: 24, width: 52 }} />
                  <div className={SK} style={{ height: 24, width: 52 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── export — main-scroll + centered checklist ──────────────────── */
function ExportSkeleton() {
  return (
    <div style={{ minHeight: "calc(100vh - 56px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 36px 64px" }}>
        <div className={SK} style={{ height: 32, width: 220, marginBottom: 12 }} />
        <div className={SK} style={{ height: 14, width: 420, marginBottom: 32 }} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 0",
              borderTop: "1px solid oklch(90% 0.006 95)",
            }}
          >
            <div className={SK} style={{ height: 18, width: 18 }} />
            <div className={SK} style={{ height: 14, width: "30%" }} />
            <div className={SK} style={{ height: 12, width: 120, marginLeft: "auto" }} />
          </div>
        ))}
        <div className={SK} style={{ height: 46, width: "100%", marginTop: 28 }} />
      </div>
    </div>
  );
}

/* ── settings — topnav + centered form ──────────────────────────── */
function SettingsSkeleton() {
  return (
    <>
      <TopnavSkeleton />
      <div style={{ minHeight: "calc(100vh - 56px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 36px 64px" }}>
          <div className={SK} style={{ height: 32, width: 120, marginBottom: 14 }} />
          <div className={SK} style={{ height: 14, width: 340, marginBottom: 32 }} />
          <div className={SK} style={{ height: 80, width: "100%", marginBottom: 20 }} />
          <div className={SK} style={{ height: 44, width: "100%", marginBottom: 16 }} />
          <div className={SK} style={{ height: 44, width: "100%", marginBottom: 24 }} />
          <div className={SK} style={{ height: 40, width: 120 }} />
        </div>
      </div>
    </>
  );
}

/* ── new — topnav + centered onboarding card ────────────────────── */
function NewSkeleton() {
  return (
    <>
      <TopnavSkeleton />
      <div
        style={{
          minHeight: "calc(100svh - 60px)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "clamp(40px, 7vw, 80px) 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className={SK} style={{ height: 28, width: 240, margin: "0 auto 8px" }} />
          <div className={SK} style={{ height: 14, width: 320, margin: "0 auto 24px" }} />
          <div className={SK} style={{ height: 120, width: "100%" }} />
          <div className={SK} style={{ height: 120, width: "100%" }} />
        </div>
      </div>
    </>
  );
}
