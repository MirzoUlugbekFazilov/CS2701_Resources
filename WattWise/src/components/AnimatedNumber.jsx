import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Counts from the previous value to the new one so a figure changing after an
 * edit is noticed rather than silently swapping. Respects
 * `prefers-reduced-motion`, where it simply snaps to the new value.
 */
export default function AnimatedNumber({ value, decimals = 0, duration = 450 }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;

    if (from === to) return undefined;

    if (prefersReducedMotion()) {
      // Snap on the next frame rather than synchronously inside the effect.
      frameRef.current = requestAnimationFrame(() => {
        fromRef.current = to;
        setDisplay(to);
      });
      return () => cancelAnimationFrame(frameRef.current);
    }

    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutCubic — fast at first, settles gently on the final figure.
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <>{display.toFixed(decimals)}</>;
}
