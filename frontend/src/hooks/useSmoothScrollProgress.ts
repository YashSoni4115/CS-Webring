import { useEffect, useRef, useState } from "react";

export function useSmoothScrollProgress(
  ref: React.RefObject<HTMLElement | null>,
  opts: { followSpeed?: number; maxStep?: number } = {}
) {
  const { followSpeed = 12, maxStep = 0.03 } = opts;
  const [progress, setProgress] = useState(0);
  const targetRef = useRef(0);
  const currentRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;

    const updateTarget = () => {
      const rect = el.getBoundingClientRect();
      const scrollTop = -rect.top;
      const scrollHeight = el.offsetHeight - window.innerHeight;
      targetRef.current = Math.max(0, Math.min(1, scrollTop / Math.max(1, scrollHeight)));
    };

    const tick = () => {
      const diff = targetRef.current - currentRef.current;
      const step = Math.sign(diff) * Math.min(Math.abs(diff) * followSpeed * 0.016, maxStep);
      currentRef.current += step;
      if (Math.abs(diff) < 0.0001) currentRef.current = targetRef.current;
      setProgress(currentRef.current);
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => updateTarget();
    window.addEventListener("scroll", onScroll, { passive: true });
    updateTarget();
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, followSpeed, maxStep]);

  return progress;
}
