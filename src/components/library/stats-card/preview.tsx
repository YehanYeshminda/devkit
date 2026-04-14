import * as React from "react";
import { Users, DollarSign, Activity } from "lucide-react";

import { StatsCard } from "./source";

export function Preview() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatsCard
        label="Total Revenue"
        value="$48,295"
        change={12.4}
        icon={<DollarSign className="size-4" />}
      />
      <StatsCard
        label="Active Users"
        value="3,842"
        change={-3.1}
        icon={<Users className="size-4" />}
      />
      <StatsCard
        label="Uptime"
        value="99.9%"
        change={0.2}
        icon={<Activity className="size-4" />}
      />
    </div>
  );
}
