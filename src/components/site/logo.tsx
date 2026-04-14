import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="grid size-8 place-items-center rounded-md border border-[#6366f1]/40 bg-[#6366f1]/10">
        <span className="text-xs font-bold tracking-tight text-[#6366f1]">DK</span>
      </div>
      <span className="text-sm font-semibold tracking-tight text-foreground">DevKit</span>
    </Link>
  );
}
