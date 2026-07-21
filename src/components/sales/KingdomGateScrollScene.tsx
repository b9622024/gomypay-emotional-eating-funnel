"use client";

import { useEffect, useRef, useState } from "react";

type ScrollFrameSegment = {
  frameBasePath: string;
  frameCount: number;
  frameExtension?: string;
};

type KingdomGateScrollSceneProps = {
  startImage: string;
  endImage: string;
  posterImage: string;
  videoSrc: string;
  segments?: ScrollFrameSegment[];
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function pulseOpacity(progress: number, start: number, peak: number, end: number) {
  if (progress < start || progress > end) return 0;
  if (progress <= peak) return clamp((progress - start) / Math.max(0.001, peak - start));
  return clamp((end - progress) / Math.max(0.001, end - peak));
}

function softSegmentOpacity(progress: number, start: number, end: number) {
  const fade = 0.05;
  return clamp(Math.min((progress - start) / fade, (end - progress) / fade));
}

function segment(progress: number, start: number, end: number) {
  return clamp((progress - start) / Math.max(0.001, end - start));
}

function smooth(value: number) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

export default function KingdomGateScrollScene({
  startImage,
  endImage,
  posterImage,
  videoSrc,
  segments = [],
}: KingdomGateScrollSceneProps) {
  const sceneRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const durationRef = useRef(0);
  const lastProgressRef = useRef(-1);
  const manualProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const releasedRef = useRef(false);
  const lastTouchYRef = useRef<number | null>(null);
  const stepIndexRef = useRef(-1);
  const lastStepAtRef = useRef(0);
  const preloadedFramesRef = useRef<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [frameSrc, setFrameSrc] = useState(startImage);
  const [sequenceFailed, setSequenceFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const hasImageSequence = segments.length > 0 && !sequenceFailed;

  const getFrameSrc = (segment: ScrollFrameSegment, frameNumber: number) =>
    `${segment.frameBasePath}/frame-${String(frameNumber).padStart(3, "0")}.${segment.frameExtension ?? "jpg"}`;

  const getSegmentFrame = (sceneProgress: number) => {
    if (!segments.length) return startImage;
    const segmentProgress = sceneProgress * segments.length;
    const segmentIndex = Math.min(segments.length - 1, Math.floor(segmentProgress));
    const localProgress = clamp(segmentProgress - segmentIndex);
    const segment = segments[segmentIndex];
    const frameNumber = Math.min(
      segment.frameCount,
      Math.max(1, Math.round(localProgress * (segment.frameCount - 1)) + 1),
    );
    return getFrameSrc(segment, frameNumber);
  };

  const preloadImage = (src: string) => {
    if (typeof window === "undefined" || preloadedFramesRef.current.has(src)) return;
    preloadedFramesRef.current.add(src);
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  };

  const preloadAroundProgress = (sceneProgress: number) => {
    if (!segments.length) return;
    const segmentProgress = sceneProgress * segments.length;
    const segmentIndex = Math.min(segments.length - 1, Math.floor(segmentProgress));
    const localProgress = clamp(segmentProgress - segmentIndex);
    const segment = segments[segmentIndex];
    const frameNumber = Math.min(
      segment.frameCount,
      Math.max(1, Math.round(localProgress * (segment.frameCount - 1)) + 1),
    );
    for (let i = -4; i <= 10; i += 1) {
      const next = frameNumber + i;
      if (next >= 1 && next <= segment.frameCount) preloadImage(getFrameSrc(segment, next));
    }
    if (segmentIndex + 1 < segments.length && localProgress > 0.82) {
      for (let i = 1; i <= 12; i += 1) preloadImage(getFrameSrc(segments[segmentIndex + 1], i));
    }
  };

  const applyProgress = (nextProgress: number) => {
    const sceneProgress = clamp(nextProgress);
    if (Math.abs(sceneProgress - lastProgressRef.current) < 0.001) return;
    lastProgressRef.current = sceneProgress;
    setProgress(sceneProgress);
    document.documentElement.style.setProperty("--kingdom-gate-progress", sceneProgress.toFixed(4));

    if (hasImageSequence && !reducedMotion) {
      const nextFrameSrc = getSegmentFrame(sceneProgress);
      setFrameSrc((current) => (current === nextFrameSrc ? current : nextFrameSrc));
      preloadAroundProgress(sceneProgress);
      return;
    }

    const video = videoRef.current;
    const duration = durationRef.current;
    if (video && duration && !videoFailed && !reducedMotion) {
      const targetTime = Math.min(duration - 0.04, Math.max(0, sceneProgress * duration));
      try {
        video.currentTime = targetTime;
        setVideoReady(true);
      } catch {
        setVideoFailed(true);
      }
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!hasImageSequence || reducedMotion) return;
    let cancelled = false;
    let segmentIndex = 0;
    let frame = 1;
    const preloadBatch = () => {
      if (cancelled || !segments[segmentIndex]) return;
      for (let i = 0; i < 8; i += 1) {
        preloadImage(getFrameSrc(segments[segmentIndex], frame));
        frame += 4;
        if (frame > segments[segmentIndex].frameCount) {
          segmentIndex += 1;
          frame = 1;
          if (!segments[segmentIndex]) break;
        }
      }
      if (segments[segmentIndex]) window.setTimeout(preloadBatch, 140);
    };
    preloadBatch();
    return () => {
      cancelled = true;
    };
  }, [hasImageSequence, reducedMotion, segments]);

  useEffect(() => {
    if (reducedMotion) return;
    const scene = sceneRef.current;
    if (!scene) return;
    const stepTargets = [0.16, 0.68, 0.91, 1];

    const stopAnimation = () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const tickTowardTarget = () => {
      animationRef.current = null;
      if (!lockedRef.current) return;
      const current = manualProgressRef.current;
      const target = targetProgressRef.current;
      const next = current + (target - current) * 0.13;
      const settled = Math.abs(target - next) < 0.0014;
      manualProgressRef.current = settled ? target : next;
      applyProgress(manualProgressRef.current);
      if (manualProgressRef.current >= 0.998 && target >= 0.998) {
        unlockScene();
        return;
      }
      if (!settled) animationRef.current = window.requestAnimationFrame(tickTowardTarget);
    };

    const animateToTarget = () => {
      if (animationRef.current !== null) return;
      animationRef.current = window.requestAnimationFrame(tickTowardTarget);
    };

    const lockScene = () => {
      if (releasedRef.current) return;
      lockedRef.current = true;
      document.body.classList.add("scroll-world-active", "scroll-world-locked");
      window.scrollTo(0, 0);
      applyProgress(manualProgressRef.current);
    };

    const unlockScene = () => {
      if (!lockedRef.current) return;
      stopAnimation();
      lockedRef.current = false;
      releasedRef.current = true;
      manualProgressRef.current = 1;
      targetProgressRef.current = 1;
      document.body.classList.add("scroll-world-white-transition");
      document.body.classList.remove("scroll-world-locked", "scroll-world-active");
      applyProgress(1);
      requestAnimationFrame(() => {
        window.scrollTo({ top: scene.offsetHeight, behavior: "auto" });
      });
      window.setTimeout(() => {
        document.body.classList.remove("scroll-world-white-transition");
      }, 500);
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

    lockScene();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      stopAnimation();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("scroll-world-locked", "scroll-world-active");
      document.body.classList.remove("scroll-world-white-transition");
    };
  }, [reducedMotion, hasImageSequence, segments, videoFailed]);

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    durationRef.current = video.duration;
    video.muted = true;
    video.playsInline = true;
    setVideoReady(true);
  };

  const transitionGlowOpacity = pulseOpacity(progress, 0.46, 0.51, 0.58) + pulseOpacity(progress, 0.9, 0.96, 1);
  const entryCopyOpacity = softSegmentOpacity(progress, 0.01, 0.24);
  const gateCopyOpacity = softSegmentOpacity(progress, 0.58, 0.82);
  const finalCopyOpacity = softSegmentOpacity(progress, 0.86, 1);
  const exitWhiteOpacity = smooth(segment(progress, 0.9, 1));
  const fallbackEndOpacity = reducedMotion ? clamp((progress - 0.36) / 0.52) : videoFailed ? 1 : 0;

  return (
    <section ref={sceneRef} className="kingdom-gate-scroll is-lock-scene" aria-label="歡迎進入嘴饞迷霧王國">
      <div className="kingdom-gate-stage">
        <div className="kingdom-gate-media" aria-hidden="true">
          <img className="kingdom-gate-static is-start" src={startImage} alt="" loading="eager" />
          {hasImageSequence && !reducedMotion && (
            <img
              className="kingdom-gate-frame-sequence"
              src={frameSrc}
              alt=""
              loading="eager"
              decoding="async"
              onError={() => setSequenceFailed(true)}
            />
          )}
          {!hasImageSequence && !reducedMotion && !videoFailed && (
            <video
              ref={videoRef}
              className={`kingdom-gate-video ${videoReady ? "is-ready" : ""}`}
              src={videoSrc}
              poster={posterImage}
              preload="auto"
              muted
              playsInline
              controls={false}
              disablePictureInPicture
              onLoadedMetadata={onLoadedMetadata}
              onLoadedData={() => setVideoReady(true)}
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
            />
          )}
          <img
            className="kingdom-gate-static is-end"
            src={endImage}
            alt=""
            loading="eager"
            style={{ opacity: fallbackEndOpacity }}
          />
          <div className="kingdom-gate-mist" />
          <div className="kingdom-gate-portal-glow" style={{ opacity: clamp(transitionGlowOpacity) }} />
        </div>

        <div className="kingdom-gate-copy opening minimal" style={{ opacity: entryCopyOpacity }}>
          <p>THE MIST KINGDOM</p>
          <h1>迷霧王國的門已為你開啟</h1>
        </div>

        <div className="kingdom-gate-copy minimal" style={{ opacity: gateCopyOpacity }}>
          <h2>
            往前走，
            <br />
            冒險即將開始。
          </h2>
        </div>

        <div className="kingdom-gate-copy final minimal" style={{ opacity: finalCopyOpacity }}>
          <h2>你已穿越門檻。</h2>
          <p>下一幕，角色即將集結。</p>
        </div>

        <div className="kingdom-gate-hint" style={{ opacity: clamp(1 - progress * 1.9) }}>
          <span>
            <i className="kingdom-gate-arrow" aria-hidden="true" />
            <i className="kingdom-gate-hand" aria-hidden="true" />
            <b>向上滑動</b>
          </span>
        </div>

        <div className="kingdom-gate-progress" aria-hidden="true">
          <i style={{ transform: `scaleX(${progress})` }} />
        </div>
        <div className="kingdom-gate-whiteout" style={{ opacity: exitWhiteOpacity }} aria-hidden="true" />
      </div>
    </section>
  );
}
