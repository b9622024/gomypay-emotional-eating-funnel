"use client";

import { useEffect } from "react";

export default function SalesCheckoutVisibilityGate() {
  useEffect(() => {
    const marker = document.getElementById("sales-checkout-visible-marker");
    if (!marker) return;

    let raf: number | null = null;

    const update = () => {
      raf = null;
      const markerTop = marker.getBoundingClientRect().top + window.scrollY;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
      const shouldShow = window.scrollY + viewportHeight * 0.55 >= markerTop;
      document.body.classList.toggle("sales-checkout-visible", shouldShow);
    };

    const requestUpdate = () => {
      if (raf !== null) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("orientationchange", requestUpdate, { passive: true });

    return () => {
      if (raf !== null) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("orientationchange", requestUpdate);
      document.body.classList.remove("sales-checkout-visible");
    };
  }, []);

  return null;
}
