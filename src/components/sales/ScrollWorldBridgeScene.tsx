"use client";

import { useEffect, useRef, useState } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};
const segment = (progress: number, start: number, end: number) => {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp((progress - start) / (end - start));
};

const bridgeTexts = [
  {
    start: 0.08,
    peak: 0.18,
    end: 0.32,
    title: "六種職業，\n代表六種不同的嘴饞模式。",
  },
  {
    start: 0.32,
    peak: 0.43,
    end: 0.58,
    title: "但你的角色，\n仍等待被揭曉。",
  },
  {
    start: 0.58,
    peak: 0.7,
    end: 0.84,
    title: "進入《7 天嘴饞破關計畫》後，\n你將先完成角色測驗，\n找出自己的嘴饞原型與專屬攻略路線。",
  },
  {
    start: 0.84,
    peak: 0.91,
    end: 1,
    title: "接下來，\n看看這場 7 天冒險會帶你經歷什麼。",
    hint: "繼續滑動，查看冒險內容",
  },
];

function textOpacity(progress: number, start: number, peak: number, end: number) {
  const fadeIn = smooth(segment(progress, start, peak));
  const fadeOut = 1 - smooth(segment(progress, peak, end));
  return clamp(Math.min(fadeIn, fadeOut) * 1.08);
}

export default function ScrollWorldBridgeScene() {
  const sceneRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTouchYRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const releasedRef = useRef(false);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const stepIndexRef = useRef(-1);
  const lastStepAtRef = useRef(0);
  const viewportRef = useRef({ width: 0, height: 0 });
  const [progress, setProgress] = useState(0);
  const [stageMode, setStageMode] = useState<"before" | "fixed" | "after">("before");
  const [reducedMotion, setReducedMotion] = useState(false);

  const applyProgress = (next: number) => {
    const safe = clamp(next);
    progressRef.current = safe;
    setProgress(safe);
    document.documentElement.style.setProperty("--scroll-world-bridge-progress", safe.toFixed(4));
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const stepTargets = [0.18, 0.43, 0.7, 0.91, 1];

    const stopAnimation = () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const unlockScene = () => {
      if (!lockedRef.current) return;
      stopAnimation();
      lockedRef.current = false;
      releasedRef.current = true;
      stepIndexRef.current = stepTargets.length - 1;
      targetProgressRef.current = 1;
      applyProgress(1);
      document.body.classList.remove("scroll-world-locked", "scroll-world-active");
      setStageMode("after");
      window.requestAnimationFrame(() => {
        const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: sceneTop + scene.offsetHeight, behavior: "auto" });
      });
    };

    const tick = () => {
      animationRef.current = null;
      if (!lockedRef.current) return;
      const current = progressRef.current;
      const target = targetProgressRef.current;
      const next = current + (target - current) * 0.1;
      const settled = Math.abs(target - next) < 0.001;
      applyProgress(settled ? target : next);
      if (target >= 0.998 && progressRef.current >= 0.996) {
        unlockScene();
        return;
      }
      if (!settled) animationRef.current = window.requestAnimationFrame(tick);
    };

    const animateToTarget = () => {
      if (animationRef.current !== null) return;
      animationRef.current = window.requestAnimationFrame(tick);
    };

    const moveStep = (direction: 1 | -1) => {
      if (!lockedRef.current) return;
      const now = performance.now();
      if (now - lastStepAtRef.current < 520) return;
      lastStepAtRef.current = now;
      const nextIndex = Math.min(stepTargets.length - 1, Math.max(0, stepIndexRef.current + direction));
      stepIndexRef.current = nextIndex;
      targetProgressRef.current = stepTargets[nextIndex];
      animateToTarget();
    };

    const lockScene = () => {
      if (releasedRef.current || lockedRef.current || reducedMotion) return;
      const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
      lockedRef.current = true;
      setStageMode("fixed");
      document.body.classList.add("scroll-world-active", "scroll-world-locked");
      window.scrollTo({ top: sceneTop, behavior: "auto" });
      if (stepIndexRef.current < 0) {
        stepIndexRef.current = 0;
        targetProgressRef.current = stepTargets[0];
      }
      applyProgress(progressRef.current);
      window.setTimeout(() => {
        if (lockedRef.current) animateToTarget();
      }, 80);
    };

    const update = () => {
      rafRef.current = null;
      const width = window.innerWidth || document.documentElement.clientWidth || 390;
      const height = window.innerHeight || document.documentElement.clientHeight || 800;
      if (
        viewportRef.current.height === 0 ||
        Math.abs(width - viewportRef.current.width) > 24 ||
        Math.abs(height - viewportRef.current.height) > 140
      ) {
        viewportRef.current = { width, height };
      }
      const viewportHeight = viewportRef.current.height;
      const rect = scene.getBoundingClientRect();

      if (reducedMotion) {
        const scrollableDistance = Math.max(1, rect.height - viewportHeight);
        applyProgress(clamp(-rect.top / scrollableDistance));
        setStageMode(rect.top <= 0 && rect.bottom > viewportHeight ? "fixed" : rect.top > 0 ? "before" : "after");
      } else if (!releasedRef.current && rect.top <= 2 && rect.bottom > viewportHeight) {
        lockScene();
      } else if (!lockedRef.current && !releasedRef.current && rect.top > 2) {
        setStageMode("before");
      }

      if ((lockedRef.current || rect.top < viewportHeight * 0.75) && rect.bottom > viewportHeight * 0.16) {
        document.body.classList.add("scroll-world-active");
      } else if (!lockedRef.current) {
        document.body.classList.remove("scroll-world-active");
      }
    };

    const requestUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(update);
    };

    const onWheel = (event: WheelEvent) => {
      if (!lockedRef.current) return;
      event.preventDefault();
      if (Math.abs(event.deltaY) < 12) return;
      moveStep(event.deltaY > 0 ? 1 : -1);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!lockedRef.current) return;
      lastTouchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!lockedRef.current) return;
      event.preventDefault();
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!lockedRef.current || lastTouchYRef.current === null) return;
      const endY = event.changedTouches[0]?.clientY;
      if (typeof endY !== "number") return;
      const deltaY = lastTouchYRef.current - endY;
      lastTouchYRef.current = null;
      if (Math.abs(deltaY) < 20) return;
      moveStep(deltaY > 0 ? 1 : -1);
    };

    const onClick = () => {
      if (lockedRef.current) moveStep(1);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("orientationchange", requestUpdate, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    scene.addEventListener("click", onClick);

    return () => {
      stopAnimation();
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("orientationchange", requestUpdate);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      scene.removeEventListener("click", onClick);
      document.body.classList.remove("scroll-world-active", "scroll-world-locked");
    };
  }, [reducedMotion]);

  const mirrorGlow = 0.55 + smooth(segment(progress, 0.06, 0.92)) * 0.45;
  const mirrorScale = 0.92 + smooth(segment(progress, 0.12, 0.96)) * 0.24;
  const exitGlow = smooth(segment(progress, 0.9, 1));

  return (
    <section ref={sceneRef} className="scroll-world-bridge-scene" aria-label="嘴饞角色揭曉前的命運核心">
      <div className={`scroll-world-bridge-stage ${stageMode === "fixed" ? "is-fixed" : ""}`}>
        <div className="bridge-ambient" />
        <div className="bridge-stars" />
        <div className="bridge-mirror-wrap" style={{ opacity: mirrorGlow, transform: `translate(-50%, -50%) scale(${mirrorScale})` }}>
          <div className="bridge-mirror" />
          <div className="bridge-mirror-core" />
        </div>
        <div className="bridge-vignette" />
        {bridgeTexts.map((item) => (
          <div
            className="bridge-copy"
            key={item.title}
            style={{
              opacity: textOpacity(progress, item.start, item.peak, item.end),
              transform: `translate(-50%, calc(-50% + ${(1 - textOpacity(progress, item.start, item.peak, item.end)) * 14}px))`,
            }}
          >
            <h2>{item.title}</h2>
            {item.hint && <p>{item.hint}</p>}
          </div>
        ))}
        <div className="bridge-exit-glow" style={{ opacity: exitGlow }} />
      </div>
    </section>
  );
}
