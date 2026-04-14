import Link from "next/link";

import { SiteHeader } from "@/components/site/site-header";

export function ComingSoonPage({
  title,
  description,
  eta,
  backHref,
  backLabel,
}: {
  title: string;
  description: string;
  eta?: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-5 text-5xl">🚧</div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {eta && (
          <p className="mt-3 text-xs text-muted-foreground/60">
            Estimated: {eta}
          </p>
        )}
        <Link
          href={backHref}
          className="mt-8 text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← {backLabel}
        </Link>
      </main>
    </div>
  );
}
