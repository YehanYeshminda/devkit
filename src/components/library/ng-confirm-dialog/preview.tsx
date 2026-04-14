"use client";

import * as React from "react";

export function Preview() {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState<"deleted" | "cancelled" | null>(null);

  function handleAccept() {
    setOpen(false);
    setResult("deleted");
  }
  function handleReject() {
    setOpen(false);
    setResult("cancelled");
  }

  return (
    <div className="relative flex min-h-[180px] flex-col items-center justify-center gap-4 rounded-lg bg-[#1e1e2e] p-6">
      {/* Trigger */}
      <button
        onClick={() => { setOpen(true); setResult(null); }}
        className="flex items-center gap-2 rounded-md bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 ring-1 ring-red-500/30 transition hover:bg-red-500/20"
      >
        🗑 Delete account
      </button>

      {result && (
        <p className={`text-xs font-medium ${result === "deleted" ? "text-red-400" : "text-[#ced4da]/60"}`}>
          {result === "deleted" ? "✓ Account deleted" : "✕ Action cancelled"}
        </p>
      )}

      {/* Dialog overlay */}
      {open && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-xs rounded-xl border border-white/10 bg-[#27293d] p-5 shadow-2xl">
            {/* Icon */}
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-red-500/15 text-2xl">
              ⚠️
            </div>
            <h3 className="mb-1 text-center text-base font-semibold text-white">
              Are you sure?
            </h3>
            <p className="mb-5 text-center text-xs leading-5 text-[#ced4da]/60">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 rounded-md bg-red-500 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={handleReject}
                className="flex-1 rounded-md border border-white/10 py-2 text-sm font-medium text-[#ced4da] transition hover:bg-white/[0.06]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
