import * as React from "react";

import { GradientText } from "./source";

export function Preview() {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-background/40 p-6">
      <p className="text-3xl font-bold tracking-tight">
        <GradientText>Ship faster.</GradientText>
      </p>
      <p className="text-base font-medium">
        Build with{" "}
        <GradientText gradient="from-emerald-400 via-teal-400 to-sky-400">
          beautiful components.
        </GradientText>
      </p>
    </div>
  );
}
