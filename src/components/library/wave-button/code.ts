export const code = `"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Ripple = { id: number; x: number; y: number };

type WaveButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

export function WaveButton({
  children,
  className,
  variant = "primary",
  onClick,
  ...props
}: WaveButtonProps) {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const ref = React.useRef<HTMLButtonElement>(null);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    onClick?.(e);
  }

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={cn(
        "relative inline-flex h-10 select-none items-center justify-center overflow-hidden rounded-lg px-5 text-sm font-medium transition-colors",
        variant === "primary" &&
          "bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800",
        variant === "outline" &&
          "border border-white/20 bg-transparent text-foreground hover:bg-white/[0.06]",
        className
      )}
      {...props}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute animate-[ripple_0.6s_linear] rounded-full bg-white/30"
          style={{ left: r.x, top: r.y, transform: "translate(-50%, -50%)" }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// Add this keyframe to your tailwind.config.ts → theme.extend.keyframes:
// ripple: {
//   "0%":   { width: "0px",   height: "0px",   opacity: "1" },
//   "100%": { width: "500px", height: "500px",  opacity: "0" },
// },
// And to theme.extend.animation:
// ripple: "ripple 0.6s linear",
`;
