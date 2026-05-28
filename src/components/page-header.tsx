"use client";

import { Suspense } from "react";
import { ActivitySquare } from "lucide-react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return <Suspense><PageHeaderInner title={title} subtitle={subtitle} /></Suspense>;
}

function PageHeaderInner({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <ActivitySquare className="size-3.5" />
              CardioFlow
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
        </div>
      </div>
    </header>
  );
}
