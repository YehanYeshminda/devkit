import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <div className="grid size-9 place-items-center rounded-lg border border-primary/35 bg-primary/15 shadow-[0_10px_30px_rgba(99,102,241,0.14),inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors group-hover:border-primary/55 group-hover:bg-primary/20">
        <span className="text-[0.7rem] font-black tracking-tight text-primary">DK</span>
      </div>
      <span className="text-sm font-semibold tracking-tight text-foreground">DevKit</span>
    </Link>
  );
}
