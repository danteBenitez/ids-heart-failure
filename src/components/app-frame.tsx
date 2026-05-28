import { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { getPalette } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type AppFrameProps = {
  title: string;
  subtitle: string;
  paletteId?: string;
  children: ReactNode;
};

export function AppFrame({
  title,
  subtitle,
  paletteId,
  children,
}: AppFrameProps) {
  const palette = getPalette(paletteId);

  return (
    <div
      className={cn(
        palette.className,
        "min-h-screen bg-background text-foreground transition-colors flex",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8">
        <PageHeader title={title} subtitle={subtitle} />
        {children}
      </div>
    </div>
  );
}
