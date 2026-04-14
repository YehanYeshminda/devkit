import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/site/code-block";
import { SiteHeader } from "@/components/site/site-header";
import { getAllComponentSlugs, getComponentBySlug } from "@/lib/component-registry";

export function generateStaticParams() {
  return getAllComponentSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const component = getComponentBySlug(params.slug);
  if (!component) return {};
  return {
    title: `${component.name} — Component Library`,
    description: component.description,
  };
}

export default function ComponentPage({
  params,
}: {
  params: { slug: string };
}) {
  const component = getComponentBySlug(params.slug);
  if (!component) notFound();

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <div className="w-full px-5 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 gap-2 rounded-md border border-white/10 bg-white/[0.03]"
          >
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <p className="hidden rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground sm:block">
            /components/<span className="font-mono">{component.slug}</span>
          </p>
        </div>

        <header className="mb-8 border-b border-white/10 pb-6">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {component.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            {component.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge className="rounded-md border-white/10 bg-white/[0.05] font-mono text-xs capitalize text-muted-foreground">
              {component.framework}
            </Badge>
            {component.tags.map((tag) => (
              <Badge key={tag} className="rounded-md border-white/10 bg-white/[0.03] text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
          <div className="space-y-8">
            <div className="rounded-xl border border-white/10 bg-card/70 p-6">
              <h2 className="text-sm font-semibold text-foreground">Live preview</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This is the component rendered with example props.
              </p>
              <div className="mt-5 rounded-lg border border-white/10 bg-background/40 p-4">
                <component.Preview />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-card/70 p-6">
              <h2 className="text-sm font-semibold text-foreground">Usage</h2>
              <Separator className="my-4" />
              <div className="space-y-5 text-sm text-muted-foreground">
                {component.usage.install?.length ? (
                  <div>
                    <p className="font-medium text-foreground">Prereqs</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {component.usage.install.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {component.usage.notes?.length ? (
                  <div>
                    <p className="font-medium text-foreground">Notes</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {component.usage.notes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-foreground">Code</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Copy-paste into your project and adjust colors to fit your theme.
              </p>
            </div>
            <CodeBlock code={component.code} language="tsx" />
          </div>
        </section>
      </div>
    </div>
  );
}

