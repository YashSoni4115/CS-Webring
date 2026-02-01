import { useEffect, useRef, useState } from "react";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function useSmoothScrollProgress(
  containerRef: React.RefObject<HTMLElement | null>,
  opts?: {
    followSpeed?: number;
    maxStep?: number;
  }
) {
  const followSpeed = opts?.followSpeed ?? 12;
  const maxStep = opts?.maxStep ?? 0.03;

  const targetRef = useRef(0);
  const valueRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [, forceRender] = useState(0);

  useEffect(() => {
    const computeTarget = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;

      const total = rect.height - viewportH;
      const scrolled = -rect.top;

      const p = total <= 0 ? 0 : scrolled / total;
      targetRef.current = clamp01(p);
    };

    const tick = () => {
      const target = targetRef.current;
      const current = valueRef.current;

      const dt = 1 / 60;
      const alpha = 1 - Math.exp(-followSpeed * dt);

      let next = current + (target - current) * alpha;

      const delta = next - current;
      if (delta > maxStep) next = current + maxStep;
      if (delta < -maxStep) next = current - maxStep;

      valueRef.current = clamp01(next);

      forceRender((x) => (x + 1) % 1000000);
      rafRef.current = requestAnimationFrame(tick);
    };

    computeTarget();
    rafRef.current = requestAnimationFrame(tick);

    const onScroll = () => computeTarget();
    const onResize = () => computeTarget();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, followSpeed, maxStep]);

  return valueRef.current;
}