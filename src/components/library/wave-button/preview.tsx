import * as React from "react";

import { WaveButton } from "./source";

export function Preview() {
  return (
    <div className="flex min-h-[120px] items-center justify-center gap-4 py-6">
      <WaveButton>Click me</WaveButton>
      <WaveButton variant="outline">Outline</WaveButton>
    </div>
  );
}
