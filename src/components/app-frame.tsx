import { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";

type AppFrameProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AppFrame({ title, subtitle, children }: AppFrameProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8">
        <PageHeader title={title} subtitle={subtitle} />
        {children}
      </div>
    </div>
  );
}
