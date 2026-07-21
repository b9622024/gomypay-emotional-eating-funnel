"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { scene02CharacterByKey, type Scene02Character } from "@/content/scene02Characters";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function segment(progress: number, start: number, end: number) {
  return clamp((progress - start) / Math.max(0.001, end - start));
}

function pulse(progress: number, start: number, peak: number, end: number) {
  if (progress < start || progress > end) return 0;
  if (progress <= peak) return segment(progress, start, peak);
  return 1 - segment(progress, peak, end);
}

function smooth(value: number) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

type CharacterKey =
  | "stress-mage"
  | "healing-priest"
  | "energy-knight"
  | "supply-guardian"
  | "habit-ranger"
  | "drink-alchemist";

type CharacterStagePreset = {
  key: CharacterKey;
  side: "left" | "right" | "center";
  group: "emotion" | "energy" | "habit";
  x: number;
  y: number;
  scale: number;
  z: number;
  focusStart: number;
  focusEnd: number;
  appearStart: number;
  appearEnd: number;
  color: string;
};

const characterPresets: CharacterStagePreset[] = [
  {
    key: "stress-mage",
    side: "left",
    group: "emotion",
    x: -28,
    y: 8,
    scale: 1.02,
    z: 4,
    appearStart: 0.18,
    appearEnd: 0.24,
    focusStart: 0.2,
    focusEnd: 0.39,
    color: "148, 87, 214",
  },
  {
    key: "healing-priest",
    side: "right",
    group: "emotion",
    x: 28,
    y: 8,
    scale: 1,
    z: 6,
    appearStart: 0.3,
    appearEnd: 0.36,
    focusStart: 0.34,
    focusEnd: 0.47,
    color: "226, 150, 201",
  },
  {
    key: "energy-knight",
    side: "left",
    group: "energy",
    x: -28,
    y: 7,
    scale: 1.02,
    z: 4,
    appearStart: 0.45,
    appearEnd: 0.51,
    focusStart: 0.47,
    focusEnd: 0.64,
    color: "234, 187, 84",
  },
  {
    key: "supply-guardian",
    side: "right",
    group: "energy",
    x: 28,
    y: 8,
    scale: 1,
    z: 6,
    appearStart: 0.57,
    appearEnd: 0.63,
    focusStart: 0.61,
    focusEnd: 0.74,
    color: "142, 190, 118",
  },
  {
    key: "habit-ranger",
    side: "left",
    group: "habit",
    x: -28,
    y: 8,
    scale: 1.01,
    z: 4,
    appearStart: 0.72,
    appearEnd: 0.78,
    focusStart: 0.74,
    focusEnd: 0.86,
    color: "99, 176, 128",
  },
  {
    key: "drink-alchemist",
    side: "right",
    group: "habit",
    x: 28,
    y: 8,
    scale: 1,
    z: 6,
    appearStart: 0.81,
    appearEnd: 0.87,
    focusStart: 0.84,
    focusEnd: 0.93,
    color: "214, 135, 75",
  },
];

const groupWindows = {
  emotion: [0.18, 0.45],
  energy: [0.45, 0.72],
  habit: [0.72, 0.9],
} as const;

const copySegments = [
  {
    start: 0,
    peak: 0.045,
    end: 0.16,
    eyebrow: "HALL OF DESTINY",
    title: "你已抵達命運大廳",
    body: "你的每一次選擇，都會留下嘴饞線索。",
    hint: "滑動或點擊，啟動召喚儀式",
    align: "center",
  },
  {
    start: 0.9,
    peak: 0.945,
    end: 0.972,
    title: "六種職業，代表六種不同的嘴饞模式。",
    body: "你會是哪一種角色？",
    align: "center",
  },
] as const;

const groupCopySegments = [
  {
    key: "emotion",
    start: 0.18,
    secondStart: 0.3,
    peak: 0.37,
    end: 0.45,
    eyebrow: "EMOTION PATH",
    title: "情緒迷霧系",
    items: [
      {
        name: "壓力法師",
        description: "壓力越高，越容易用食物或飲料快速放鬆。",
      },
      {
        name: "療癒牧師",
        description: "委屈、疲憊或心情低落時，容易用吃來安慰自己。",
      },
    ],
  },
  {
    key: "energy",
    start: 0.45,
    secondStart: 0.57,
    peak: 0.65,
    end: 0.72,
    eyebrow: "ENERGY PATH",
    title: "能量補給系",
    items: [
      {
        name: "能量騎士",
        description: "白天消耗太多，到了下午或下班後容易爆餓。",
      },
      {
        name: "補給守衛",
        description: "早餐、午餐或蛋白質不足，容易讓晚上的嘴饞反撲。",
      },
    ],
  },
  {
    key: "habit",
    start: 0.72,
    secondStart: 0.81,
    peak: 0.86,
    end: 0.9,
    eyebrow: "LOOP PATH",
    title: "習慣迴路系",
    items: [
      {
        name: "習慣遊俠",
        description: "固定時間、沙發、追劇與外送場景，容易自動啟動嘴饞。",
      },
      {
        name: "飲料鍊金師",
        description: "奶茶、甜咖啡與手搖飲，是最難中斷的日常迴路。",
      },
    ],
  },
] as const;

function getCharacter(key: CharacterKey): Scene02Character {
  return scene02CharacterByKey[key];
}

function getActiveGroup(progress: number) {
  if (progress >= 0.72) return "habit";
  if (progress >= 0.45) return "energy";
  if (progress >= 0.18) return "emotion";
  return "core";
}

function CharacterLayer({ preset, progress }: { preset: CharacterStagePreset; progress: number }) {
  const character = getCharacter(preset.key);
  const appear = smooth(segment(progress, preset.appearStart, preset.appearEnd));
  const gather = smooth(segment(progress, 0.9, 0.982));
  const portal = smooth(segment(progress, 0.988, 1));
  const [groupStart, groupEnd] = groupWindows[preset.group];
  const groupPresence = Math.max(pulse(progress, groupStart - 0.02, (groupStart + groupEnd) / 2, groupEnd + 0.055), gather);
  const groupHold = progress >= preset.appearEnd && progress <= groupEnd + 0.04 ? 1 : groupPresence;
  const focus = pulse(progress, preset.focusStart, (preset.focusStart + preset.focusEnd) / 2, preset.focusEnd);
  const finalText = smooth(segment(progress, 0.9, 0.945));
  const opacity = clamp(Math.max(appear * groupHold, gather) * (1 - finalText));
  const gatherIndex = characterPresets.findIndex((item) => item.key === preset.key);
  const gatherX = [-31, -18, -5, 7, 19, 31][gatherIndex] ?? 0;
  const gatherScale = [0.7, 0.74, 0.82, 0.76, 0.72, 0.7][gatherIndex] ?? 0.74;
  const gatherY = [2, -2, -5, -2, 1, -1][gatherIndex] ?? 0;
  const currentX = preset.x * (1 - gather) + gatherX * gather;
  const currentY = (preset.y + (1 - appear) * 5) * (1 - gather) + gatherY * gather + portal * 3;
  const currentScale = preset.scale * (1 - gather) + gatherScale * gather;
  const blur = progress >= preset.appearEnd ? 0 : (1 - appear) * 8;
  const desaturate = portal * 0.04;

  return (
    <div
      className={`hall-character hall-character-${preset.key} ${focus > 0.2 ? "is-focused" : ""}`}
      style={
        {
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: "min(56vw,310px)",
          height: "72svh",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          "--character-x": `${currentX}vw`,
          "--character-y": `${currentY}svh`,
          "--character-scale": currentScale,
          "--character-opacity": opacity,
          "--character-blur": `${blur}px`,
          "--character-z": preset.z + Math.round(gather * (8 - gatherIndex * 0.25)),
          "--character-glow": `${clamp(opacity * (0.22 + focus * 0.55))}`,
          "--character-color": preset.color,
          "--character-saturate": 1 - desaturate,
        } as CSSProperties
      }
    >
      <div className="hall-character-aura" />
      <img
        alt=""
        src={character.image}
        loading={progress > preset.appearStart - 0.12 ? "eager" : "lazy"}
        style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }}
      />
    </div>
  );
}

export default function HallOfDestinyScene() {
  const sceneRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const viewportRef = useRef({ width: 0, height: 0 });
  const manualProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const releasedRef = useRef(false);
  const lastTouchYRef = useRef<number | null>(null);
  const stepIndexRef = useRef(-1);
  const lastStepAtRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [stageMode, setStageMode] = useState<"before" | "fixed" | "after">("before");
  const [reducedMotion, setReducedMotion] = useState(false);

  const applyProgress = (nextProgress: number) => {
    const sceneProgress = clamp(nextProgress);
    manualProgressRef.current = sceneProgress;
    setProgress(sceneProgress);
    document.documentElement.style.setProperty("--hall-destiny-progress", sceneProgress.toFixed(4));
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
    const stepTargets = [0.045, 0.24, 0.36, 0.51, 0.63, 0.78, 0.87, 0.945, 1];

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
      document.body.classList.add("scroll-world-white-transition");
      document.body.classList.remove("scroll-world-locked", "scroll-world-active");
      setStageMode("after");
      requestAnimationFrame(() => {
        const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: sceneTop + scene.offsetHeight, behavior: "auto" });
      });
      window.setTimeout(() => {
        document.body.classList.remove("scroll-world-white-transition");
      }, 500);
    };

    const tickTowardTarget = () => {
      animationRef.current = null;
      if (!lockedRef.current) return;
      const current = manualProgressRef.current;
      const target = targetProgressRef.current;
      const next = current + (target - current) * 0.12;
      const settled = Math.abs(target - next) < 0.0012;
      applyProgress(settled ? target : next);
      if (target >= 0.998 && manualProgressRef.current >= 0.996) {
        unlockScene();
        return;
      }
      if (!settled) animationRef.current = window.requestAnimationFrame(tickTowardTarget);
    };

    const animateToTarget = () => {
      if (animationRef.current !== null) return;
      animationRef.current = window.requestAnimationFrame(tickTowardTarget);
    };

    const moveStep = (direction: 1 | -1) => {
      if (!lockedRef.current) return;
      const now = performance.now();
      if (now - lastStepAtRef.current < 560) return;
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
      applyProgress(manualProgressRef.current);
      if (manualProgressRef.current < 0.01 && stepIndexRef.current < 0) {
        stepIndexRef.current = 0;
        targetProgressRef.current = stepTargets[0];
        window.setTimeout(() => {
          if (lockedRef.current) animateToTarget();
        }, 80);
      }
    };

    const updateProgress = () => {
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
        const nextProgress = clamp(-rect.top / scrollableDistance);
        applyProgress(nextProgress);
        const nextMode = rect.top <= 0 && rect.bottom > viewportHeight ? "fixed" : rect.top > 0 ? "before" : "after";
        setStageMode((current) => (current === nextMode ? current : nextMode));
      } else if (!releasedRef.current && rect.top <= 2 && rect.bottom > viewportHeight) {
        lockScene();
      } else if (!lockedRef.current && !releasedRef.current && rect.top > 2) {
        setStageMode("before");
      }

      if ((lockedRef.current || rect.top < viewportHeight * 0.7) && rect.bottom > viewportHeight * 0.18) {
        document.body.classList.add("scroll-world-active");
      } else {
        document.body.classList.remove("scroll-world-active");
      }
    };

    const requestUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(updateProgress);
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
      if (Math.abs(deltaY) < 22) return;
      moveStep(deltaY > 0 ? 1 : -1);
    };

    const onClick = () => {
      moveStep(1);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!lockedRef.current) return;
      const downKeys = ["ArrowDown", "PageDown", " "];
      const upKeys = ["ArrowUp", "PageUp"];
      if (![...downKeys, ...upKeys].includes(event.key)) return;
      event.preventDefault();
      moveStep(downKeys.includes(event.key) ? 1 : -1);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      stopAnimation();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      document.body.classList.remove("scroll-world-active", "scroll-world-locked", "scroll-world-white-transition");
    };
  }, [reducedMotion]);

  const activeGroup = getActiveGroup(progress);
  const activeCopy = useMemo(() => {
    return copySegments
      .map((copy) => ({ ...copy, opacity: pulse(progress, copy.start, copy.peak, copy.end) }))
      .sort((a, b) => b.opacity - a.opacity)[0];
  }, [progress]);

  const activeGroupCopy = useMemo(() => {
    return groupCopySegments
      .map((copy) => ({ ...copy, opacity: pulse(progress, copy.start, copy.peak, copy.end) }))
      .sort((a, b) => b.opacity - a.opacity)[0];
  }, [progress]);

  const activeGroupCopyOpacity =
    activeGroupCopy && progress >= activeGroupCopy.start && progress <= activeGroupCopy.end
      ? 1
      : activeGroupCopy.opacity;

  const introLight = 1 - smooth(segment(progress, 0, 0.1));
  const coreActivation = smooth(segment(progress, 0.1, 0.22));
  const gatherLight = smooth(segment(progress, 0.9, 0.982));
  const portalLight = smooth(segment(progress, 0.988, 1));
  const entryWhiteOpacity = clamp(1 - progress / 0.025);
  const exitWhiteOpacity = smooth(segment(progress, 0.955, 1));
  const cameraShift = 0;
  const stagePosition = stageMode === "fixed" ? "fixed" : "absolute";

  return (
    <section
      ref={sceneRef}
      className={`hall-destiny-scroll ${reducedMotion ? "is-reduced-motion" : ""}`}
      aria-label="第二幕：命運大廳，六種角色集結"
      style={{
        position: "relative",
        height: reducedMotion ? "360svh" : "1320svh",
        minHeight: reducedMotion ? "340vh" : "1240vh",
        background: "#111021",
        color: "#fffaf3",
        isolation: "isolate",
        overflowX: "clip",
        overflowY: "visible",
      }}
    >
      <div
        className={`hall-destiny-stage is-${stageMode}`}
        style={
          {
            position: stagePosition,
            top: stageMode === "after" ? "auto" : 0,
            bottom: stageMode === "after" ? 0 : "auto",
            width: "100%",
            height: "100svh",
            minHeight: "100svh",
            overflow: "hidden",
            isolation: "isolate",
            background: "#111021",
            "--hall-progress": progress,
            "--hall-camera-x": `${cameraShift}vw`,
            "--hall-core": coreActivation,
            "--hall-gather": gatherLight,
            "--hall-portal": portalLight,
          } as CSSProperties
        }
      >
        <div className="hall-entry-fade" style={{ opacity: entryWhiteOpacity }} aria-hidden="true" />
        <div className="hall-background" aria-hidden="true">
          <img
            src="/scroll-world/scene-02/start.webp"
            alt=""
            loading="eager"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
          />
          <div className="hall-background-tint" />
          <div className="hall-rune-circle" />
          <div className="hall-rune-circle secondary" />
          <div className="hall-energy-lines" />
        </div>

        <div className="hall-summon-slots" aria-hidden="true">
          {characterPresets.map((preset) => (
            <i
              key={preset.key}
              className={`hall-summon-slot is-${preset.group}`}
              style={
                {
                  "--slot-x": `${preset.x * 0.88}vw`,
                  "--slot-y": `${preset.y + 55}svh`,
                  "--slot-color": preset.color,
                  "--slot-opacity": clamp(
                    0.22 +
                      pulse(progress, preset.appearStart - 0.1, preset.appearStart, preset.appearEnd + 0.05) * 0.72 +
                      gatherLight * 0.35,
                  ),
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="hall-characters" aria-hidden="true">
          {characterPresets.map((preset) => (
            <CharacterLayer key={preset.key} preset={preset} progress={reducedMotion ? 0.88 : progress} />
          ))}
        </div>

        <div className="hall-foreground-mist" aria-hidden="true" />
        <div className="hall-particles" aria-hidden="true">
          {Array.from({ length: 22 }).map((_, index) => (
            <i
              key={index}
              style={
                {
                  "--particle-left": `${(index * 37) % 100}%`,
                  "--particle-top": `${20 + ((index * 11) % 64)}%`,
                  "--particle-delay": `${(index % 9) * -0.34}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div
          className="hall-copy hall-copy-center"
          style={{
            position: "absolute",
            zIndex: 8,
            top: "calc(env(safe-area-inset-top) + 10svh)",
            left: "50%",
            right: "auto",
            width: "min(calc(100% - 44px),24rem)",
            maxWidth: "24rem",
            transform: "translateX(-50%)",
            textAlign: "center",
            pointerEvents: "none",
            opacity: reducedMotion ? 1 : activeCopy.opacity,
          }}
        >
          {"eyebrow" in activeCopy && activeCopy.eyebrow && <span>{activeCopy.eyebrow}</span>}
          <h2>{activeCopy.title}</h2>
          {"body" in activeCopy && activeCopy.body && <p>{activeCopy.body}</p>}
          {"hint" in activeCopy && activeCopy.hint && <small>{activeCopy.hint}</small>}
        </div>

        {activeGroupCopyOpacity > 0.02 && progress < 0.9 && (
          <div
            className="hall-group-copy"
            style={{
              opacity: reducedMotion ? 1 : activeGroupCopyOpacity,
            }}
          >
            <span>{activeGroupCopy.eyebrow}</span>
            <h2>{activeGroupCopy.title}</h2>
            <div className="hall-group-copy-grid">
              {activeGroupCopy.items.map((item, index) => (
                <article
                  key={item.name}
                  style={{
                    opacity:
                      index === 0
                        ? progress >= activeGroupCopy.start + 0.045
                          ? 1
                          : smooth(segment(progress, activeGroupCopy.start, activeGroupCopy.start + 0.045))
                        : progress >= activeGroupCopy.secondStart + 0.045
                          ? 1
                          : smooth(segment(progress, activeGroupCopy.secondStart, activeGroupCopy.secondStart + 0.045)),
                  }}
                >
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="hall-group-progress" aria-hidden="true">
          <i className={activeGroup === "emotion" ? "is-active" : ""}>情緒</i>
          <i className={activeGroup === "energy" ? "is-active" : ""}>能量</i>
          <i className={activeGroup === "habit" ? "is-active" : ""}>習慣</i>
        </div>

        <div className="hall-intro-light" style={{ opacity: introLight }} aria-hidden="true" />
        <div className="hall-portal-light" style={{ opacity: portalLight }} aria-hidden="true" />
        <div className="hall-exit-whiteout" style={{ opacity: exitWhiteOpacity }} aria-hidden="true" />
      </div>
    </section>
  );
}
