import { useEffect, useRef, useState } from "react";
import BallFieldWebGL from "../BallFieldWebGL/BallFieldWebGL";
import MembersList from "../MembersList/MembersList";
import HawkBadgeWebGL from "../HawkBadge/HawkBadgeWebGL";
import { sites } from "../../data/webring";
import styles from "./Scene.module.css";
import { useSmoothScrollProgress } from "../../hooks/useSmoothScrollProgress";

export default function Scene() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const p = useSmoothScrollProgress(sceneRef, { followSpeed: 12, maxStep: 0.03 });

  // Scatter happens early
  const scatterAmount = clamp01(remap(p, 0.0, 0.28));

  // List launches after scatter is basically done
  const listLaunch = clamp01(remap(p, 0.36, 0.46));
  const listVisible = listLaunch > 0.05;

  // Track whether the balls have fully dispersed at least once
  const [ballsFinished, setBallsFinished] = useState(false);
  const [hasVisitedList, setHasVisitedList] = useState(false);

  // "Gone" means scatter basically maxed, plus a little time for them to exit
  const ballsGone = clamp01(remap(scatterAmount, 0.92, 1.0));

  useEffect(() => {
    if (!ballsFinished && ballsGone >= 0.99) setBallsFinished(true);
  }, [ballsGone, ballsFinished]);

  useEffect(() => {
    if (listVisible) setHasVisitedList(true);
  }, [listVisible]);

  // Balls are visible only before they finish once
  const ballsOpacity = ballsFinished ? 0 : 1;

  // List motion
  const startYvh = 78;
  const endYvh = 0;
  const listY = lerp(startYvh, endYvh, easeOutCubic(listLaunch));

  // Show hovering hawk when user has been to the list and scrolls back up
  const showHawk = ballsFinished && hasVisitedList && !listVisible;

  const showArrow = p < 0.08 && !ballsFinished;

  const onArrowClick = () => {
    const el = sceneRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const sceneTop = window.scrollY + rect.top;

    const sceneHeight = el.offsetHeight;
    const vh = window.innerHeight;
    const scrollSpan = Math.max(1, sceneHeight - vh);

    const targetProgress = 0.42;
    slowScrollTo(sceneTop + scrollSpan * targetProgress, 1300);
  };

  return (
    <div ref={sceneRef} className={styles.scene}>
      <section className={styles.sticky}>
        {!ballsFinished && (
          <div className={styles.balls} style={{ opacity: ballsOpacity }}>
            <BallFieldWebGL scatterAmount={scatterAmount} />
          </div>
        )}

        <div
          className={styles.listLayer}
          style={{
            transform: `translate3d(0, ${listY}vh, 0)`,
            opacity: clamp01(remap(listLaunch, 0.1, 0.25)),
          }}
        >
          <MembersList sites={sites} />
        </div>

        {showHawk && <HawkBadgeWebGL />}

        {showArrow && (
          <button type="button" className={styles.downArrow} onClick={onArrowClick} aria-label="Scroll down">
            ↓
          </button>
        )}
      </section>
    </div>
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function remap(v: number, a: number, b: number) {
  return (v - a) / (b - a);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

function slowScrollTo(targetY: number, durationMs: number) {
  const startY = window.scrollY;
  const delta = targetY - startY;
  const start = performance.now();

  const ease = (t: number) => 1 - Math.pow(1 - t, 3);

  const tick = (now: number) => {
    const t = clamp01((now - start) / durationMs);
    window.scrollTo(0, startY + delta * ease(t));
    if (t < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}