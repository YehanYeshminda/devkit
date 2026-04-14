import * as React from "react";

const rows = [
  { name: "Alice Johnson", email: "alice@acme.com",  role: "Admin",     status: "active",   joined: "2023-01-12" },
  { name: "Bob Smith",     email: "bob@acme.com",    role: "Developer", status: "active",   joined: "2023-03-08" },
  { name: "Carol White",   email: "carol@acme.com",  role: "Designer",  status: "inactive", joined: "2022-11-20" },
  { name: "Dan Brown",     email: "dan@acme.com",    role: "Manager",   status: "pending",  joined: "2024-02-01" },
];

const statusStyles: Record<string, string> = {
  active:   "bg-emerald-500/15 text-emerald-400",
  inactive: "bg-red-500/15 text-red-400",
  pending:  "bg-amber-500/15 text-amber-400",
};

export function Preview() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#1e1e2e] text-[#ced4da]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#27293d] px-4 py-2.5">
        <span className="text-sm font-semibold text-white">Users</span>
        <div className="flex h-7 items-center gap-2 rounded-md border border-white/10 bg-[#1e1e2e] px-2.5 text-xs text-[#ced4da]/40">
          <span>🔍</span>
          <span>Search…</span>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-[#1e1e2e]/60 text-[#ced4da]/50">
            {["Name", "Role", "Status", "Joined", ""].map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.email}
              className="border-b border-white/[0.06] transition hover:bg-white/[0.03]"
            >
              <td className="px-3 py-2">
                <p className="font-medium text-white">{r.name}</p>
                <p className="text-[10px] text-[#ced4da]/40">{r.email}</p>
              </td>
              <td className="px-3 py-2 text-[#ced4da]/70">{r.role}</td>
              <td className="px-3 py-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyles[r.status]}`}>
                  {r.status}
                </span>
              </td>
              <td className="px-3 py-2 text-[#ced4da]/50">{r.joined}</td>
              <td className="px-3 py-2">
                <div className="flex gap-1.5">
                  <button className="rounded p-1 text-[#6366f1]/80 hover:bg-[#6366f1]/10">✏️</button>
                  <button className="rounded p-1 text-red-400/70 hover:bg-red-500/10">🗑</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginator hint */}
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] text-[#ced4da]/40">
        <span>Showing 1–4 of 6</span>
        <div className="flex gap-1">
          <span className="rounded border border-white/10 px-2 py-0.5">‹</span>
          <span className="rounded border border-[#6366f1]/60 bg-[#6366f1]/10 px-2 py-0.5 text-[#6366f1]">1</span>
          <span className="rounded border border-white/10 px-2 py-0.5">2</span>
          <span className="rounded border border-white/10 px-2 py-0.5">›</span>
        </div>
      </div>
    </div>
  );
}
