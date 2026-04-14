export const code = `import * as React from "react";

import { cn } from "@/lib/utils";

type AnimatedGradientButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  glow?: boolean;
};

export function AnimatedGradientButton({
  className,
  glow = true,
  children,
  ...props
}: AnimatedGradientButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl px-5 text-sm font-semibold text-white shadow-sm",
        "bg-neutral-950",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* animated border */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl opacity-70 blur-sm",
          "bg-[conic-gradient(from_180deg_at_50%_50%,#22c55e,#06b6d4,#a78bfa,#fb7185,#22c55e)]",
          "animate-[spin_5s_linear_infinite]"
        )}
      />

      {/* optional glow */}
      {glow ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-4 rounded-[20px] opacity-20 blur-2xl",
            "bg-[conic-gradient(from_180deg_at_50%_50%,#22c55e,#06b6d4,#a78bfa,#fb7185,#22c55e)]",
            "animate-[spin_7s_linear_infinite]"
          )}
        />
      ) : null}

      {/* inner */}
      <span className="relative z-10 rounded-[11px] bg-neutral-950 px-5 py-2.5">
        <span className="relative z-10">{children}</span>
      </span>
    </button>
  );
}
`;

