"use client";

import { useEffect, useRef, useState } from "react";

/* ──────────────────────────────────────────────
   AnimatedNumber — counts from 0 → value
   ────────────────────────────────────────────── */
export function AnimatedNumber({
  value,
  duration = 1000,
  className = "",
}: {
  value: number | null;
  duration?: number;
  className?: string;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (value == null) return;
    setN(0);
    let startTs: number | null = null;
    const target = value;

    function tick(ts: number) {
      if (!startTs) startTs = ts;
      const t = Math.min((ts - startTs) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setN(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(tick);
    }

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value, duration]);

  if (value == null) return <span className={`text-mist-500 ${className}`}>—</span>;
  return <span className={className}>{n}</span>;
}

/* ──────────────────────────────────────────────
   ProgressRing — SVG radial arc that animates
   ────────────────────────────────────────────── */
export function ProgressRing({
  score,
  size = 152,
  sw = 12,
  children,
}: {
  score: number | null;
  size?: number;
  sw?: number;
  children?: React.ReactNode;
}) {
  const circleRef = useRef<SVGCircleElement>(null);
  const R = (size - sw * 2) / 2;
  const CIRC = 2 * Math.PI * R;

  const color =
    score == null
      ? "#8b9bb0"
      : score >= 76
      ? "#3ddc97"
      : score >= 61
      ? "#2ec4b6"
      : score >= 41
      ? "#f5c542"
      : "#ff6b4a";

  const glowFilter =
    score == null
      ? "none"
      : score >= 76
      ? "drop-shadow(0 0 8px rgba(61,220,151,0.65))"
      : score >= 61
      ? "drop-shadow(0 0 8px rgba(46,196,182,0.65))"
      : score >= 41
      ? "drop-shadow(0 0 8px rgba(245,197,66,0.55))"
      : "drop-shadow(0 0 8px rgba(255,107,74,0.55))";

  useEffect(() => {
    const el = circleRef.current;
    if (!el || score == null) return;
    // Reset to empty
    el.style.transition = "none";
    el.style.strokeDashoffset = String(CIRC);
    el.getBoundingClientRect(); // force reflow
    // Animate to target
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.33, 1, 0.68, 1)";
      el.style.strokeDashoffset = String(CIRC * (1 - score / 100));
    });
  }, [score, CIRC]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* SVG ring */}
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        className="absolute inset-0"
        aria-hidden
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={sw}
        />
        {/* Soft glow halo */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={sw + 8}
          opacity={0.06}
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - (score ?? 0) / 100)}
          strokeLinecap="round"
        />
        {/* Main arc */}
        <circle
          ref={circleRef}
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
          style={{ filter: glowFilter }}
        />
      </svg>
      {/* Centered content slot */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   AnimatedBar — horizontal bar grows left → right
   ────────────────────────────────────────────── */
export function AnimatedBar({
  pct,
  color,
  delay = 0,
  height = 5,
}: {
  pct: number;
  color: string;
  delay?: number;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = "0%";
    const id = setTimeout(() => {
      el.style.transition = `width 0.85s cubic-bezier(0.33, 1, 0.68, 1) ${delay}ms`;
      el.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    }, 60);
    return () => clearTimeout(id);
  }, [pct, delay]);

  return (
    <div
      className="mt-2 w-full overflow-hidden rounded-full bg-white/10"
      style={{ height: `${height}px` }}
    >
      <div
        ref={ref}
        className="h-full rounded-full"
        style={{
          backgroundColor: color,
          width: "0%",
          boxShadow: `0 0 5px ${color}88`,
        }}
      />
    </div>
  );
}
