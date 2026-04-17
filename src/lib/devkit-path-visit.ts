import { getComponentBySlug } from "@/lib/component-registry";
import { ALL_TOOLS, TOOL_CATEGORIES } from "@/lib/tools-registry";

const SKIP_PREFIXES = ["/sign-in", "/sign-up", "/api/", "/share"];

/** Map current pathname to a single “visit” row for recent tools (best-effort). */
export function pathToVisit(pathname: string): { href: string; name: string } | null {
  const path = (pathname.split("?")[0] ?? "").replace(/\/$/, "") || "/";

  if (path === "/" || path === "") return null;
  for (const p of SKIP_PREFIXES) {
    if (path === p || path.startsWith(p + "/")) return null;
  }

  for (const t of ALL_TOOLS) {
    if (path === t.href) return { href: t.href, name: t.name };
  }

  for (const c of TOOL_CATEGORIES) {
    if (path === c.href) return { href: c.href, name: c.name };
  }

  if (path === "/components") return { href: "/components", name: "Component Library" };

  if (path === "/account") return { href: "/account", name: "Workspace" };

  const comp = path.match(/^\/components\/([^/]+)$/);
  if (comp?.[1]) {
    const slug = comp[1];
    const meta = getComponentBySlug(slug);
    return { href: path, name: meta?.name ?? slug };
  }

  return null;
}
