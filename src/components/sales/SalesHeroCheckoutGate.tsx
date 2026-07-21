"use client";

import { useEffect } from "react";

export default function SalesHeroCheckoutGate() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-sales-hero]");
    if (!hero) return;

    const setHeroActive = (active: boolean) => {
      document.body.classList.toggle("sales-hero-active", active);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroActive(Boolean(entry?.isIntersecting && entry.intersectionRatio > 0.12));
      },
      { threshold: [0, 0.12, 0.24, 0.5, 0.75] }
    );

    observer.observe(hero);
    setHeroActive(true);

    return () => {
      observer.disconnect();
      document.body.classList.remove("sales-hero-active");
    };
  }, []);

  return null;
}
