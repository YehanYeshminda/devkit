"use client";

import * as React from "react";
import { Check, Copy, Search } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SnippetPinButton } from "@/components/site/snippet-pin-button";
import { useDevkitWorkspace } from "@/components/site/devkit-workspace-provider";
import { cn } from "@/lib/utils";

interface Cmd { id: string; title: string; description: string; code: string; category: string; tags: string[]; }

const COMMANDS: Cmd[] = [
  // Setup
  { id:"init",          category:"Setup",      title:"Initialize a repository",           tags:["setup","init"],          code:"git init",                                                      description:"Create a new Git repository in the current directory." },
  { id:"clone",         category:"Setup",      title:"Clone a repository",                tags:["setup","clone"],         code:"git clone https://github.com/user/repo.git",                    description:"Download a remote repository to your machine." },
  { id:"clone-depth",   category:"Setup",      title:"Shallow clone (last N commits)",    tags:["setup","clone"],         code:"git clone --depth=1 https://github.com/user/repo.git",         description:"Clone only the most recent commit — much faster for large repos." },
  { id:"config-name",   category:"Setup",      title:"Set username & email",              tags:["setup","config"],        code:"git config --global user.name \"Your Name\"\ngit config --global user.email \"you@example.com\"", description:"Configure your identity for all repositories." },
  // Basics
  { id:"status",        category:"Basics",     title:"Check status",                      tags:["basics","status"],       code:"git status",                                                    description:"Show staged, unstaged, and untracked changes." },
  { id:"add-all",       category:"Basics",     title:"Stage all changes",                 tags:["basics","stage","add"],  code:"git add .",                                                     description:"Stage every modified and new file." },
  { id:"add-file",      category:"Basics",     title:"Stage a specific file",             tags:["basics","stage"],        code:"git add src/index.ts",                                          description:"Stage only one file." },
  { id:"commit",        category:"Basics",     title:"Commit staged changes",             tags:["basics","commit"],       code:"git commit -m \"feat: add login page\"",                        description:"Save staged changes with a message." },
  { id:"amend",         category:"Basics",     title:"Amend last commit message",         tags:["basics","commit","fix"], code:"git commit --amend -m \"fix: correct typo\"",                  description:"Rewrite the most recent commit (only if not yet pushed)." },
  { id:"diff",          category:"Basics",     title:"Show unstaged diff",                tags:["basics","diff"],         code:"git diff",                                                      description:"See changes not yet staged." },
  { id:"diff-staged",   category:"Basics",     title:"Show staged diff",                  tags:["basics","diff"],         code:"git diff --staged",                                             description:"See changes that are staged and about to be committed." },
  // Branching
  { id:"branch-list",   category:"Branching",  title:"List all branches",                 tags:["branch"],                code:"git branch -a",                                                 description:"Show local and remote branches." },
  { id:"branch-new",    category:"Branching",  title:"Create & switch to a new branch",   tags:["branch","checkout"],     code:"git switch -c feature/my-feature",                              description:"The modern equivalent of checkout -b." },
  { id:"branch-del",    category:"Branching",  title:"Delete a branch",                   tags:["branch","delete"],       code:"git branch -d feature/my-feature",                              description:"Delete a merged local branch (-D to force)." },
  { id:"merge",         category:"Branching",  title:"Merge a branch",                    tags:["branch","merge"],        code:"git merge feature/my-feature",                                  description:"Merge a branch into the current branch." },
  { id:"rebase",        category:"Branching",  title:"Rebase onto main",                  tags:["branch","rebase"],       code:"git rebase main",                                               description:"Replay your commits on top of main for a clean history." },
  { id:"merge-squash",  category:"Branching",  title:"Squash-merge a branch",             tags:["branch","merge","squash"],code:"git merge --squash feature/my-feature && git commit",         description:"Combine all branch commits into one before merging." },
  // Remote
  { id:"remote-add",    category:"Remote",     title:"Add a remote",                      tags:["remote"],                code:"git remote add origin https://github.com/user/repo.git",       description:"Link your local repo to a remote." },
  { id:"push",          category:"Remote",     title:"Push to remote",                    tags:["remote","push"],         code:"git push origin main",                                          description:"Upload local commits to the remote branch." },
  { id:"push-set",      category:"Remote",     title:"Push and set upstream",             tags:["remote","push"],         code:"git push -u origin HEAD",                                       description:"Push the current branch and set it as the default upstream." },
  { id:"pull",          category:"Remote",     title:"Pull latest changes",               tags:["remote","pull"],         code:"git pull --rebase origin main",                                 description:"Fetch and rebase on top of the remote branch (cleaner history)." },
  { id:"fetch",         category:"Remote",     title:"Fetch without merging",             tags:["remote","fetch"],        code:"git fetch origin",                                              description:"Download remote changes without applying them." },
  // Undo
  { id:"reset-soft",    category:"Undo",       title:"Undo last commit (keep changes)",   tags:["undo","reset"],          code:"git reset --soft HEAD~1",                                       description:"Uncommit but keep the changes staged." },
  { id:"reset-hard",    category:"Undo",       title:"Discard last commit entirely",      tags:["undo","reset"],          code:"git reset --hard HEAD~1",                                       description:"Remove last commit and discard all changes — permanent." },
  { id:"restore-file",  category:"Undo",       title:"Discard file changes",              tags:["undo","restore"],        code:"git restore src/index.ts",                                      description:"Revert a file to its last committed state." },
  { id:"revert",        category:"Undo",       title:"Revert a commit (safe)",            tags:["undo","revert"],         code:"git revert abc1234",                                            description:"Create a new commit that reverses a previous one — safe for shared branches." },
  // History
  { id:"log",           category:"History",    title:"Pretty one-line log",               tags:["log","history"],         code:"git log --oneline --graph --decorate --all",                    description:"Compact visual log of all branches." },
  { id:"log-author",    category:"History",    title:"Filter log by author",              tags:["log","filter"],          code:"git log --author=\"Alice\" --oneline",                          description:"Show commits by a specific author." },
  { id:"show",          category:"History",    title:"Show a commit",                     tags:["log","show"],            code:"git show abc1234",                                              description:"Display the diff and metadata for a specific commit." },
  { id:"blame",         category:"History",    title:"Show who changed each line",        tags:["log","blame"],           code:"git blame src/index.ts",                                        description:"Annotate each line with the commit and author that changed it." },
  { id:"diff-branch",   category:"History",    title:"Diff between two branches",         tags:["diff","branch"],         code:"git diff main..feature/my-feature",                             description:"See all changes between two branches." },
  // Stashing
  { id:"stash",         category:"Stashing",   title:"Stash current changes",             tags:["stash"],                 code:"git stash push -m \"wip: my description\"",                    description:"Save dirty working directory without committing." },
  { id:"stash-pop",     category:"Stashing",   title:"Apply and remove latest stash",     tags:["stash"],                 code:"git stash pop",                                                 description:"Restore the most recently stashed changes." },
  { id:"stash-list",    category:"Stashing",   title:"List all stashes",                  tags:["stash"],                 code:"git stash list",                                                description:"View all saved stashes." },
  // Tags
  { id:"tag",           category:"Tags",       title:"Create an annotated tag",           tags:["tag","release"],         code:"git tag -a v1.0.0 -m \"Release 1.0.0\"",                        description:"Mark a release with a version tag." },
  { id:"tag-push",      category:"Tags",       title:"Push tags to remote",               tags:["tag","remote"],          code:"git push origin --tags",                                        description:"Upload all local tags to the remote." },
  { id:"tag-delete",    category:"Tags",       title:"Delete a tag",                      tags:["tag"],                   code:"git tag -d v1.0.0\ngit push origin :refs/tags/v1.0.0",         description:"Delete a tag locally and remotely." },
  // Advanced
  { id:"cherry-pick",   category:"Advanced",   title:"Cherry-pick a commit",              tags:["advanced","cherry-pick"],code:"git cherry-pick abc1234",                                       description:"Apply a specific commit from another branch onto the current one." },
  { id:"reflog",        category:"Advanced",   title:"Show reflog",                       tags:["advanced","reflog"],     code:"git reflog",                                                    description:"See the history of HEAD — recover lost commits." },
  { id:"clean",         category:"Advanced",   title:"Remove untracked files",            tags:["advanced","clean"],      code:"git clean -fd",                                                 description:"Delete all untracked files and directories (-n to preview)." },
  { id:"bisect",        category:"Advanced",   title:"Binary search for a bug",           tags:["advanced","bisect"],     code:"git bisect start\ngit bisect bad\ngit bisect good v1.0.0",      description:"Find which commit introduced a bug by binary search." },
  { id:"worktree",      category:"Advanced",   title:"Add a worktree",                    tags:["advanced"],              code:"git worktree add ../hotfix hotfix/branch",                      description:"Check out another branch in a separate directory without switching." },
];

const CATEGORIES = Array.from(new Set(COMMANDS.map(c => c.category)));

function CopyBtn({ code }: { code: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(code); setOk(true); setTimeout(() => setOk(false), 1300); } catch {} }
  return (
    <button onClick={copy} className={cn("flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <><Check className="size-3" />Copied!</> : <><Copy className="size-3" />Copy</>}
    </button>
  );
}

export default function GitCommandsPage() {
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
    let list = COMMANDS;
    if (cat !== "All") list = list.filter(c => c.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.tags.some(t => t.includes(q)));
    }
    return list;
  }, [search, cat]);

  const grouped = React.useMemo(() => {
    const g: Record<string, Cmd[]> = {};
    for (const cmd of filtered) { (g[cmd.category] ??= []).push(cmd); }
    return g;
  }, [filtered]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Code Snippets / Git Commands</p>
          <h1 className="text-2xl font-semibold tracking-tight">Git Commands</h1>
          <p className="mt-1 text-sm text-muted-foreground">Searchable cheat sheet for {COMMANDS.length} Git commands — from basics to advanced workflows.</p>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search commands…" className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.02] pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["All", ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setCat(c)} className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors", cat === c ? "bg-[#6366f1]/20 text-[#6366f1]" : "border border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.06]")}>{c}</button>
            ))}
          </div>
        </div>

        <div className={cn("space-y-8", spacious && "space-y-10")}>
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">{category}</h2>
              <div className={cn("grid lg:grid-cols-2", spacious ? "gap-4" : "gap-2")}>
                {cmds.map(cmd => (
                  <div
                    key={cmd.id}
                    id={cmd.id}
                    className="overflow-hidden rounded-xl border border-white/10 bg-card/60 hover:border-white/20 transition-colors scroll-mt-24"
                  >
                    <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{cmd.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{cmd.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <SnippetPinButton category="git" id={cmd.id} title={cmd.title} />
                        <CopyBtn code={cmd.code} />
                      </div>
                    </div>
                    <pre className="overflow-x-auto border-t border-white/[0.06] bg-black/20 px-4 py-3 font-mono text-xs text-emerald-400/90 leading-relaxed"><code>{cmd.code}</code></pre>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground/50">No commands match &ldquo;{search}&rdquo;</div>}
        </div>
      </main>
    </div>
  );
}
