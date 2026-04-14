import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LibraryComponent } from "@/lib/component-registry";

export function ComponentCard({ component }: { component: LibraryComponent }) {
  return (
    <Card className="group flex flex-col overflow-hidden rounded-xl border-white/10 bg-card/70 shadow-none transition-colors duration-200 hover:border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-3 text-base">
          <span className="truncate">{component.name}</span>
          <Badge className="shrink-0 rounded-md border-white/10 bg-white/[0.05] font-mono text-xs capitalize text-muted-foreground">
            {component.framework}
          </Badge>
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm leading-6">
          {component.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <div className="flex-1 rounded-lg border border-white/10 bg-background/40 p-3">
          <component.Preview />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {component.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} className="rounded-md border-white/10 bg-white/[0.03] text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t border-white/10 pt-5">
        <p className="text-xs text-muted-foreground/90">
          <span className="font-mono">{component.slug}</span>
        </p>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
        >
          <Link href={`/components/${component.slug}`}>View component</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

