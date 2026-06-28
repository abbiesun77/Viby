"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Mode = "fixed" | "absolute" | "inline";

interface GsapLoaderProps {
  loading: boolean;
  label?: string;
  mode?: Mode;
  blur?: boolean;
}

/**
 * Loading indicator matching the light editorial theme.
 *
 * - fixed:     full-viewport overlay for major actions (confirm script, generate, export)
 * - absolute:  fills nearest positioned ancestor for panel/drawer waits
 * - inline:    small spinner inside buttons
 *
 * Visual: warm gray + accent color, no purple. Minimal, editorial.
 */
export function GsapLoader({
  loading,
  label = "处理中…",
  mode = "fixed",
  blur = true,
}: GsapLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Progress bar animation — indeterminate, editorial style
  useGSAP(
    () => {
      if (!loading) return;
      const tl = gsap.timeline({ repeat: -1 });
      // Bar slides from left to right, like a search/scan
      tl.fromTo(
        barRef.current,
        { xPercent: -100 },
        { xPercent: 100, duration: 1.2, ease: "power1.inOut" }
      );
      return () => tl.kill();
    },
    { scope: containerRef, dependencies: [loading] }
  );

  // Overlay enter animation
  useEffect(() => {
    if (mode === "inline") return;
    const el = containerRef.current;
    if (!el) return;
    if (loading) {
      gsap.fromTo(
        el,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [loading, mode]);

  if (!loading) return null;

  // ── Inline mode: minimal spinner ──
  if (mode === "inline") {
    return (
      <span
        ref={containerRef}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          verticalAlign: "middle",
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            border: "1.5px solid oklch(90% 0.006 95)",
            borderTopColor: "oklch(52% 0.10 28)",
            borderRadius: "50%",
            display: "inline-block",
            animation: "viby-spin 0.6s linear infinite",
          }}
        />
        {label && <span style={{ fontSize: 12 }}>{label}</span>}
        <style>{`@keyframes viby-spin{to{transform:rotate(360deg)}}`}</style>
      </span>
    );
  }

  // ── Overlay mode ──
  const positionStyle: React.CSSProperties =
    mode === "fixed"
      ? { position: "fixed", inset: 0, zIndex: 9999 }
      : { position: "absolute", inset: 0, zIndex: 50 };

  return (
    <div ref={containerRef} style={positionStyle}>
      {/* Scrim — light, not dark */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "oklch(98% 0.004 95 / 0.8)",
          backdropFilter: blur ? "blur(2px)" : undefined,
          WebkitBackdropFilter: blur ? "blur(2px)" : undefined,
        }}
      />
      {/* Center content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {/* Minimal loading bar — 120px wide, 2px tall, accent color */}
        <div
          style={{
            width: 120,
            height: 2,
            background: "oklch(90% 0.006 95)",
            borderRadius: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            ref={barRef}
            style={{
              position: "absolute",
              inset: 0,
              background: "oklch(52% 0.10 28)" /* --accent */,
              borderRadius: 1,
            }}
          />
        </div>
        {/* Label — muted, small, mono font */}
        {label && (
          <span
            style={{
              color: "oklch(48% 0.012 70)" /* --muted */,
              fontSize: 13,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
