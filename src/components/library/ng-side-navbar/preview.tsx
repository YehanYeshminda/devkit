"use client";

import * as React from "react";
import {
  Home,
  BarChart2,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  FileText,
  Download,
  Shield,
  Send,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Preview() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [expanded, setExpanded] = React.useState<string | null>("Analytics");

  const sections = [
    { label: "Dashboard", icon: Home, single: true },
    {
      label: "Analytics",
      icon: BarChart2,
      children: [
        { label: "Overview", icon: LineChart },
        { label: "Reports", icon: FileText },
        { label: "Export", icon: Download },
      ],
    },
    {
      label: "Users",
      icon: Users,
      children: [
        { label: "All Users", icon: Users },
        { label: "Roles", icon: Shield },
        { label: "Invite", icon: Send },
      ],
    },
    { label: "Settings", icon: Settings, single: true },
  ];

  return (
    /* Outer: clips the scaled inner to a card-friendly height */
    <div className="relative h-[220px] w-full overflow-hidden rounded-lg border border-white/10 bg-[#1e1e2e]">
      {/* Inner: rendered at natural size, scaled to 68% */}
      <div
        className="absolute left-0 top-0 flex origin-top-left"
        style={{ transform: "scale(0.68)", width: `${100 / 0.68}%`, height: `${220 / 0.68}px` }}
      >
        {/* ── Sidebar ── */}
        <aside
          className={cn(
            "flex h-full shrink-0 flex-col border-r border-white/10 bg-[#27293d] transition-all duration-200",
            sidebarOpen ? "w-52" : "w-14"
          )}
        >
          {/* Header */}
          <div className={cn("flex items-center border-b border-white/10 px-3 py-3", sidebarOpen ? "justify-between" : "justify-center")}>
            {sidebarOpen && <span className="text-sm font-bold text-white">Acme</span>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-md p-1 text-[#ced4da]/60 hover:bg-white/[0.06] hover:text-white"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-hidden p-2 text-sm">
            {sections.map((s) => {
              const Icon = s.icon;
              const isExpanded = expanded === s.label;

              if (s.single || !sidebarOpen) {
                return (
                  <button
                    key={s.label}
                    className="mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[#ced4da]/80 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Icon className="size-4 shrink-0" />
                    {sidebarOpen && <span>{s.label}</span>}
                  </button>
                );
              }

              return (
                <div key={s.label}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : s.label)}
                    className="mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[#ced4da]/80 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1">{s.label}</span>
                    <ChevronDown className={cn("size-3.5 shrink-0 transition-transform", isExpanded && "rotate-180")} />
                  </button>
                  {isExpanded && s.children && (
                    <ul className="mb-1 ml-5 space-y-0.5 border-l border-white/10 pl-2.5">
                      {s.children.map((c) => {
                        const CIcon = c.icon;
                        return (
                          <li key={c.label}>
                            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[#ced4da]/60 hover:bg-white/[0.06] hover:text-white">
                              <CIcon className="size-3.5 shrink-0" />
                              <span>{c.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          {sidebarOpen && (
            <div className="flex items-center gap-2.5 border-t border-white/10 px-3 py-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#6366f1] text-xs font-bold text-white">
                JD
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">Jane Doe</p>
                <p className="text-[11px] text-[#ced4da]/50">Admin</p>
              </div>
              <button className="shrink-0 text-[#ced4da]/40 hover:text-white">
                <LogOut className="size-4" />
              </button>
            </div>
          )}
        </aside>

        {/* ── Main content placeholder ── */}
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <div className="w-full space-y-2">
            <div className="h-3 w-3/4 rounded bg-white/[0.05]" />
            <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
            <div className="h-3 w-2/3 rounded bg-white/[0.03]" />
          </div>
          <p className="text-xs text-white/20">Main content area</p>
        </main>
      </div>
    </div>
  );
}
