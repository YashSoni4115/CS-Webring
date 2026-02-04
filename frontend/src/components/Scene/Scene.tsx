import { useEffect, useRef, useState } from "react";
import BallFieldWebGL from "../BallFieldWebGL/BallFieldWebGL";
import MembersList from "../MembersList/MembersList";
import HawkBadgeWebGL from "../HawkBadge/HawkBadgeWebGL";
import { sites } from "../../data/webring";
import styles from "./Scene.module.css";
import { useSmoothScrollProgress } from "../../hooks/useSmoothScrollProgress";

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
  return 1 - Math.pow(1 - t, 3);
}

function slowScrollTo(targetY: number, durationMs: number) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  const startTime = performance.now();

  const step = () => {
    const elapsed = performance.now() - startTime;
    const t = Math.min(1, elapsed / durationMs);
    const eased = easeOutCubic(t);
    window.scrollTo(0, startY + diff * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function Scene() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const p = useSmoothScrollProgress(sceneRef, { followSpeed: 12, maxStep: 0.03 });

  const scatterAmount = clamp01(remap(p, 0.0, 0.28));
  const listLaunch = clamp01(remap(p, 0.36, 0.46));
  const listVisible = listLaunch > 0.05;

  const [ballsFinished, setBallsFinished] = useState(false);
  const [hasVisitedList, setHasVisitedList] = useState(false);

  useEffect(() => {
    if (scatterAmount >= 0.98 && !ballsFinished) {
      const timer = setTimeout(() => setBallsFinished(true), 400);
      return () => clearTimeout(timer);
    }
  }, [scatterAmount, ballsFinished]);

  useEffect(() => {
    if (listVisible && !hasVisitedList) {
      setHasVisitedList(true);
    }
  }, [listVisible, hasVisitedList]);

  const ballsOpacity = ballsFinished ? 0 : 1;
  const startYvh = 78;
  const endYvh = 0;
  const listY = lerp(startYvh, endYvh, easeOutCubic(listLaunch));

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
        {scatterAmount === 0 && (
          <div className={styles.titleOverlay}>
            <h1>CS RING</h1>
          </div>
        )}
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7L10 13L16 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </section>
    </div>
  );
}
