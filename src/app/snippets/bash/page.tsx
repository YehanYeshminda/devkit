"use client";

import * as React from "react";
import { Check, Copy, Search } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SnippetPinButton } from "@/components/site/snippet-pin-button";
import { useDevkitWorkspace } from "@/components/site/devkit-workspace-provider";
import { cn } from "@/lib/utils";

interface Snippet { id: string; title: string; description: string; code: string; category: string; tags: string[]; }

const SNIPPETS: Snippet[] = [
  // Files & Directories
  { id:"find-name",      category:"Files",      tags:["find","search"],       title:"Find files by name",               description:"Recursively search for files matching a pattern.",               code:"find . -name '*.log' -type f" },
  { id:"find-size",      category:"Files",      tags:["find","disk"],         title:"Find files larger than 100MB",     description:"Locate large files taking up disk space.",                       code:"find . -type f -size +100M" },
  { id:"find-modified",  category:"Files",      tags:["find","time"],         title:"Files modified in last 7 days",    description:"Show recently modified files.",                                   code:"find . -type f -mtime -7" },
  { id:"du-top10",       category:"Files",      tags:["disk","size"],         title:"Top 10 largest items",             description:"List the 10 largest files/dirs sorted by size.",                 code:"du -ah . | sort -rh | head -10" },
  { id:"count-files",    category:"Files",      tags:["count","find"],        title:"Count files in a directory",       description:"Count all files (not directories) recursively.",                 code:"find . -type f | wc -l" },
  { id:"rename-ext",     category:"Files",      tags:["rename","batch"],      title:"Batch rename file extension",      description:"Rename all .txt files to .md in the current directory.",         code:"for f in *.txt; do mv \"$f\" \"${f%.txt}.md\"; done" },
  { id:"mkdir-parents",  category:"Files",      tags:["mkdir","directory"],   title:"Create nested directories",        description:"Create a deep path structure in one command.",                   code:"mkdir -p path/to/deep/directory" },
  { id:"copy-progress",  category:"Files",      tags:["copy","rsync"],        title:"Copy with progress bar",           description:"Copy a large directory showing transfer progress.",              code:"rsync -ah --progress source/ destination/" },
  { id:"symlink",        category:"Files",      tags:["symlink","link"],       title:"Create a symbolic link",           description:"Make a symlink to a file or directory.",                         code:"ln -s /path/to/target /path/to/link" },
  // Text Processing
  { id:"grep-recursive", category:"Text",       tags:["grep","search"],       title:"Recursive grep with line numbers", description:"Search for a pattern in all files under a directory.",           code:"grep -rn 'TODO' ./src" },
  { id:"grep-exclude",   category:"Text",       tags:["grep","search"],       title:"Grep excluding directories",       description:"Search but skip node_modules and .git.",                         code:"grep -rn 'pattern' . --exclude-dir={node_modules,.git,.next}" },
  { id:"sed-replace",    category:"Text",       tags:["sed","replace"],       title:"Find and replace in a file",       description:"Replace a string in-place across a file.",                      code:"sed -i '' 's/old_string/new_string/g' file.txt" },
  { id:"awk-col",        category:"Text",       tags:["awk","columns"],       title:"Print specific column",            description:"Extract the 2nd field from space-separated output.",             code:"awk '{print $2}' file.txt" },
  { id:"sort-unique",    category:"Text",       tags:["sort","unique"],        title:"Sort and deduplicate lines",       description:"Sort a file alphabetically and remove duplicate lines.",         code:"sort file.txt | uniq" },
  { id:"count-words",    category:"Text",       tags:["count","text"],         title:"Count lines / words / chars",      description:"Display line, word, and character counts for a file.",          code:"wc -lwc file.txt" },
  { id:"csv-column",     category:"Text",       tags:["csv","cut"],           title:"Extract CSV column",               description:"Print only the second column of a CSV file.",                    code:"cut -d',' -f2 data.csv" },
  { id:"json-pretty",    category:"Text",       tags:["json","jq","format"],  title:"Pretty-print JSON",                description:"Format a JSON file readably (requires jq).",                     code:"cat data.json | jq ." },
  // Processes
  { id:"find-pid",       category:"Processes",  tags:["process","find"],      title:"Find process by name",             description:"Get the PID of a running process.",                              code:"pgrep -f node" },
  { id:"kill-name",      category:"Processes",  tags:["process","kill"],      title:"Kill process by name",             description:"Terminate all processes matching a name.",                       code:"pkill -f 'node server.js'" },
  { id:"port-process",   category:"Processes",  tags:["process","port"],      title:"What is running on a port?",       description:"Find which process is listening on port 3000.",                  code:"lsof -i :3000" },
  { id:"bg-job",         category:"Processes",  tags:["background","job"],    title:"Run command in background",        description:"Start a process in the background and disown it.",               code:"nohup node server.js > app.log 2>&1 &" },
  { id:"watch-cmd",      category:"Processes",  tags:["watch","monitor"],     title:"Repeat a command every 2s",        description:"Re-run a command periodically to monitor output.",               code:"watch -n 2 'df -h'" },
  // Networking
  { id:"curl-get",       category:"Network",    tags:["curl","http","api"],   title:"Simple GET request",               description:"Fetch a URL and display the response.",                          code:"curl -s https://api.example.com/data | jq ." },
  { id:"curl-post",      category:"Network",    tags:["curl","http","post"],  title:"POST JSON with curl",              description:"Send a JSON payload via POST.",                                  code:"curl -X POST https://api.example.com/users \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\":\"Alice\",\"email\":\"alice@example.com\"}'" },
  { id:"curl-auth",      category:"Network",    tags:["curl","auth","jwt"],   title:"curl with Bearer token",           description:"Make an authenticated API request.",                             code:"curl -H 'Authorization: Bearer YOUR_TOKEN' https://api.example.com/me" },
  { id:"open-ports",     category:"Network",    tags:["network","ports"],     title:"List all open ports",              description:"Show every port currently being listened on.",                   code:"netstat -tulnp 2>/dev/null || ss -tulnp" },
  { id:"dns-lookup",     category:"Network",    tags:["dns","network"],       title:"DNS lookup",                       description:"Resolve a hostname to its IP address.",                          code:"dig +short google.com\n# or: nslookup google.com" },
  { id:"ping-count",     category:"Network",    tags:["ping","network"],      title:"Ping with a fixed count",          description:"Send exactly 4 ICMP pings to a host.",                          code:"ping -c 4 google.com" },
  { id:"download-file",  category:"Network",    tags:["wget","download"],     title:"Download a file",                  description:"Download a remote file to the current directory.",               code:"wget -O output.zip https://example.com/file.zip\n# or: curl -L -o output.zip https://example.com/file.zip" },
  // System
  { id:"disk-usage",     category:"System",     tags:["disk","df"],           title:"Disk usage overview",              description:"Show disk space used and available on all mounts.",              code:"df -h" },
  { id:"memory",         category:"System",     tags:["memory","ram"],        title:"Memory usage",                     description:"Display total, used, and free memory.",                          code:"free -h\n# macOS: vm_stat | perl -ne '/page size of (\\d+)/ and $pg=$1; /Pages\\s+([^:]+)[^\\d]+(\\d+)/ and printf(\"%-16s % 10.2f MB\\n\",$1,$2*$pg/1048576);'" },
  { id:"cpu-info",       category:"System",     tags:["cpu","system"],        title:"CPU info",                         description:"Show CPU model and core count.",                                 code:"# Linux\nnproc && cat /proc/cpuinfo | grep 'model name' | head -1\n# macOS\nsysctl -n hw.logicalcpu && sysctl -n machdep.cpu.brand_string" },
  { id:"uptime",         category:"System",     tags:["uptime","system"],     title:"System uptime",                    description:"How long the system has been running.",                          code:"uptime" },
  { id:"env-export",     category:"System",     tags:["env","variables"],     title:"Print all env variables",          description:"List every environment variable in the current shell.",          code:"printenv | sort" },
  // Archives
  { id:"tar-create",     category:"Archives",   tags:["tar","compress"],      title:"Create a .tar.gz archive",         description:"Compress a directory into a tar.gz file.",                      code:"tar -czf archive.tar.gz /path/to/folder" },
  { id:"tar-extract",    category:"Archives",   tags:["tar","extract"],       title:"Extract a .tar.gz archive",        description:"Decompress and extract a tar.gz file.",                         code:"tar -xzf archive.tar.gz -C /path/to/destination" },
  { id:"zip-folder",     category:"Archives",   tags:["zip","compress"],      title:"Zip a folder",                     description:"Create a zip archive of a directory.",                          code:"zip -r archive.zip /path/to/folder" },
  { id:"unzip",          category:"Archives",   tags:["zip","extract"],       title:"Unzip an archive",                 description:"Extract a .zip file to a target directory.",                    code:"unzip archive.zip -d /path/to/destination" },
];

const CATEGORIES = Array.from(new Set(SNIPPETS.map(s => s.category)));

function CopyBtn({ code }: { code: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(code); setOk(true); setTimeout(() => setOk(false), 1300); } catch {} }
  return (
    <button onClick={copy} className={cn("flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <><Check className="size-3" />Copied!</> : <><Copy className="size-3" />Copy</>}
    </button>
  );
}

export default function BashSnippetsPage() {
  const [search, setSearch] = React.useState("");
  const [cat, setCat] = React.useState("All");
  const { state } = useDevkitWorkspace();
  const spacious = Boolean(state.prefs.spaciousSnippetCards);

  React.useEffect(() => {
    const h = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (!h) return;
    const el = document.getElementById(decodeURIComponent(h));
    requestAnimationFrame(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const filtered = React.useMemo(() => {
    let list = SNIPPETS;
    if (cat !== "All") list = list.filter(s => s.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.tags.some(t => t.includes(q)));
    }
    return list;
  }, [search, cat]);

  const grouped = React.useMemo(() => {
    const g: Record<string, Snippet[]> = {};
    for (const s of filtered) { (g[s.category] ??= []).push(s); }
    return g;
  }, [filtered]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Code Snippets / Bash</p>
          <h1 className="text-2xl font-semibold tracking-tight">Bash &amp; Shell Snippets</h1>
          <p className="mt-1 text-sm text-muted-foreground">One-liners and recipes for files, text, processes, networking, and archives. {SNIPPETS.length} snippets.</p>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search snippets…" className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.02] pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["All", ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setCat(c)} className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors", cat === c ? "bg-[#6366f1]/20 text-[#6366f1]" : "border border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.06]")}>{c}</button>
            ))}
          </div>
        </div>

        <div className={cn("space-y-8", spacious && "space-y-10")}>
          {Object.entries(grouped).map(([category, snips]) => (
            <div key={category}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">{category}</h2>
              <div className={cn("grid lg:grid-cols-2", spacious ? "gap-4" : "gap-2")}>
                {snips.map(snip => (
                  <div
                    key={snip.id}
                    id={snip.id}
                    className="overflow-hidden rounded-xl border border-white/10 bg-card/60 hover:border-white/20 transition-colors scroll-mt-24"
                  >
                    <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{snip.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{snip.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <SnippetPinButton category="bash" id={snip.id} title={snip.title} />
                        <CopyBtn code={snip.code} />
                      </div>
                    </div>
                    <pre className="overflow-x-auto border-t border-white/[0.06] bg-black/20 px-4 py-3 font-mono text-xs text-amber-400/90 leading-relaxed"><code>{snip.code}</code></pre>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground/50">No snippets match &ldquo;{search}&rdquo;</div>}
        </div>
      </main>
    </div>
  );
}
