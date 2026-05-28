"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowRight, Stethoscope, Waypoints } from "lucide-react";
import { palettes } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return <Suspense><PageHeaderInner title={title} subtitle={subtitle} /></Suspense>;
}

function PageHeaderInner({ title, subtitle }: PageHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activePalette = searchParams.get("palette") ?? palettes[0].id;
  const guide = searchParams.get("guide") ?? "on";

  function withParams(nextPalette?: string, nextGuide?: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPalette) {
      params.set("palette", nextPalette);
    }

    if (nextGuide) {
      params.set("guide", nextGuide);
    }

    return `${pathname}?${params.toString()}`;
  }

  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm backdrop-blur md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_35%),linear-gradient(135deg,transparent_15%,rgba(255,255,255,0.24)_100%)]" />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Waypoints className="size-3.5" />
              Flujo clínico con guía opcional
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-3xl leading-tight font-semibold md:text-5xl">
                {title}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Paletas
            </span>
            <div className="flex flex-wrap gap-2">
              {palettes.map((palette) => (
                <Link key={palette.id} href={withParams(palette.id)}>
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                      activePalette === palette.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    <span className="size-2 rounded-full bg-current/70" />
                    {palette.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant={guide === "on" ? "default" : "outline"}
                size="sm"
              >
                <Link href={withParams(undefined, guide === "on" ? "off" : "on")}>
                  <Stethoscope data-icon="inline-start" />
                  Guía {guide === "on" ? "activada" : "desactivada"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={withParams(activePalette, "on")}>
                  Reiniciar guía
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/?palette=${activePalette}&guide=${guide}`}>Inicio</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/cases?palette=${activePalette}&guide=${guide}`}>Casos</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/dashboard?palette=${activePalette}&guide=${guide}`}>Tablero</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
