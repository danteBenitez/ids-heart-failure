import Link from "next/link";
import { ArrowUpRight, HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PatientCase, roleLabels } from "@/lib/demo-data";

type CaseCardProps = {
  patientCase: PatientCase;
  palette: string;
  guide: string;
};

export function CaseCard({ patientCase, palette, guide }: CaseCardProps) {
  return (
    <Card className="h-full border-border/70 bg-card/90">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{patientCase.patient}</CardTitle>
            <CardDescription>
              {patientCase.id} · {patientCase.age} años · {patientCase.location}
            </CardDescription>
          </div>
          <Badge variant={patientCase.risk === "Alto" ? "default" : "secondary"}>
            {patientCase.risk}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{patientCase.status}</Badge>
          <Badge variant="outline">{roleLabels[patientCase.nextRole]}</Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {patientCase.summary}
        </p>
        <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <HeartPulse className="size-4 text-primary" />
            Siguiente paso de la demo
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {patientCase.guideStep}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {patientCase.actionLabel}
        </span>
        <Button asChild size="sm">
          <Link href={`/cases/${patientCase.id}?palette=${palette}&guide=${guide}`}>
            Abrir caso
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
