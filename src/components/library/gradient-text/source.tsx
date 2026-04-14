import * as React from "react";

import { cn } from "@/lib/utils";

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
  /** Tailwind gradient classes — override to customise colours */
  gradient?: string;
  animate?: boolean;
} & React.HTMLAttributes<HTMLSpanElement>;

export function GradientText({
  children,
  className,
  gradient = "from-violet-400 via-fuchsia-400 to-cyan-400",
  animate = true,
  ...props
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r bg-clip-text text-transparent",
        gradient,
        animate && "animate-[gradient-shift_4s_ease_infinite] bg-[length:200%_auto]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
