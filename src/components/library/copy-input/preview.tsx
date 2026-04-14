import * as React from "react";

import { CopyInput } from "./source";

export function Preview() {
  return (
    <div className="flex flex-col gap-4 p-2">
      <CopyInput label="API Key" value="sk-live-5f3e8a2c9b1d4e7f0a6b3c8d" />
      <CopyInput label="Invite link" value="https://acme.app/invite/abc123xyz" />
    </div>
  );
}
