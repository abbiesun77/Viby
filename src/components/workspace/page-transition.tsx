"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

/**
 * Global route-transition affordance: a thin top progress bar plus a
 * gentle fade-in of freshly committed content.
 *
 * Design decision: this component does NOT render its own skeleton.
 * Skeletons are owned by Next.js `loading.tsx` (Suspense boundaries),
 * which know the exact route being entered and render the matching
 * `PageSkeleton` variant. Doing both led to a mismatched client-side
 * skeleton flashing on top of the real one. Here we only own:
 *   1. the top progress bar (navigation feedback), and
 *   2. a subtle fade/rise of the new content once the path settles.
 *
 * Visual: 2px bar in --accent (warm orange-red), no purple.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const prevPath = useRef(pathname);
  const mounted = useRef(false);

  // Drive the progress bar: start a creep on path change, finish + fade
  // when the new path commits (i.e. the new tree has rendered).
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const samePath = prevPath.current === pathname;
    prevPath.current = pathname;

    // First mount: no transition, just reveal content.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    // Path committed → finish whatever creep was running, then fade out.
    if (samePath) return;

    tlRef.current?.kill();
    const tl = gsap.timeline();
    tlRef.current = tl;

    // 1) creep: only runs visibly while the next route is suspended.
    gsap.set(bar, { scaleX: 0, transformOrigin: "left center", autoAlpha: 1 });
    tl.to(bar, { scaleX: 0.9, duration: 1.4, ease: "power2.out" });
    // 2) commit: snap to full, then dissolve.
    tl.to(bar, { scaleX: 1, duration: 0.18, ease: "power2.inOut" });
    tl.to(bar, { autoAlpha: 0, duration: 0.25, ease: "power1.out" }, "+=0.04");

    // Fade the newly committed content in.
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" }
      );
    }

    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 10000,
          pointerEvents: "none",
        }}
      >
        <div
          ref={barRef}
          style={{
            width: "100%",
            height: "100%",
            background: "oklch(52% 0.10 28)" /* --accent */,
            transform: "scaleX(0)",
            transformOrigin: "left center",
            opacity: 0,
          }}
        />
      </div>

      <div ref={contentRef} style={{ minHeight: "100vh" }}>
        {children}
      </div>
    </>
  );
}
