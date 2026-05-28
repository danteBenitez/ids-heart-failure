import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GuidePanelProps = {
  enabled: boolean;
  role: string;
  step: string;
  actionLabel: string;
  href: string;
};

export function GuidePanel({
  enabled,
  role,
  step,
  actionLabel,
  href,
}: GuidePanelProps) {
  if (!enabled) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          Paso sugerido
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">{role}</p>
          <p className="text-sm leading-6 text-muted-foreground">{step}</p>
        </div>
        <Button asChild className="w-full justify-between md:w-fit">
          <a href={href}>
            {actionLabel}
            <ArrowRight data-icon="inline-end" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
