"use client";
import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1 }
    );
    document
      .querySelectorAll(".viby-light [data-reveal]")
      .forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
