"use client";

import { useEffect } from "react";

export default function SalesCheckoutVisibilityGate() {
  useEffect(() => {
    const checkoutMarker = document.getElementById("sales-checkout-visible-marker");
    const contentStartMarker = document.getElementById("sales-content-start");
    if (!checkoutMarker) return;

    let raf: number | null = null;
    let hasEnteredSalesContent = false;
    let isCorrectingScroll = false;

    const getMarkerTop = (marker: HTMLElement) => marker.getBoundingClientRect().top + window.scrollY;

    const update = () => {
      raf = null;
      const checkoutMarkerTop = getMarkerTop(checkoutMarker);
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
      const shouldShow = window.scrollY + viewportHeight * 0.55 >= checkoutMarkerTop;
      document.body.classList.toggle("sales-checkout-visible", shouldShow);

      if (!contentStartMarker) return;
      const contentStartTop = getMarkerTop(contentStartMarker);

      if (!hasEnteredSalesContent && window.scrollY >= contentStartTop - 8) {
        hasEnteredSalesContent = true;
        document.body.classList.add("sales-scroll-forward-only");
      }

      if (hasEnteredSalesContent && !isCorrectingScroll && window.scrollY < contentStartTop - 6) {
        isCorrectingScroll = true;
        window.scrollTo({ top: contentStartTop, behavior: "auto" });
        window.setTimeout(() => {
          isCorrectingScroll = false;
        }, 80);
      }
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
      document.body.classList.remove("sales-checkout-visible", "sales-scroll-forward-only");
    };
  }, []);

  return null;
}
