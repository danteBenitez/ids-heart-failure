import Link from "next/link";
import { ArrowRight, ArrowUpRight, HeartPulse } from "lucide-react";
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
import type { PatientCase } from "@/lib/types";
import {
  getCaseActionLabel,
  getCaseSummary,
  roleLabels,
} from "@/lib/case-helpers";

type CaseCardProps = {
  patientCase: PatientCase;
  guide: string;
};

export function CaseCard({ patientCase, guide }: CaseCardProps) {
  const summary = getCaseSummary(patientCase.status);
  const actionLabel = getCaseActionLabel(patientCase.nextRole);

  return (
    <Card className="h-full border-border/70 bg-card/90">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{patientCase.patient}</CardTitle>
            <CardDescription>
              {patientCase.id.slice(0, 8)} · {patientCase.age} años · {patientCase.location}
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
          {summary}
        </p>
        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <HeartPulse className="size-4 text-primary" />
            {actionLabel}
          </div>
          {guide !== "off" ? <Badge>Siguiente</Badge> : null}
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {actionLabel}
        </span>
        <Button asChild size="sm">
          <Link
            href={`/dashboard/cases/${patientCase.id}?guide=${guide}&role=${patientCase.nextRole}`}
          >
            Abrir caso
            {guide !== "off" ? <ArrowRight data-icon="inline-end" /> : <ArrowUpRight data-icon="inline-end" />}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
