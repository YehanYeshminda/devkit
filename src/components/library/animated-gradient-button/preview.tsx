import * as React from "react";

import { AnimatedGradientButton } from "./source";

export function Preview() {
  return (
    <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-border/60 bg-gradient-to-b from-background to-muted/30 p-6">
      <AnimatedGradientButton>Ship it</AnimatedGradientButton>
    </div>
  );
}

