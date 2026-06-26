"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Route-level fade transition. Wraps children in a keyed container that
 * re-mounts on pathname change, triggering the CSS fade-in animation.
 * App Router's `template.tsx` does this natively, but we use a client
 * component so the effect also fires on client-side navigations.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayPath, setDisplayPath] = useState(pathname);

  // Update on pathname change; the key change on the inner div triggers
  // the CSS animation.
  useEffect(() => {
    setDisplayPath(pathname);
  }, [pathname]);

  return (
    <div key={displayPath} className="page-fade">
      {children}
    </div>
  );
}
