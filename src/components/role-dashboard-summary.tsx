import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SummaryMetric = {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
};

type RoleDashboardSummaryProps = {
  title: string;
  description: string;
  metrics: SummaryMetric[];
};

export function RoleDashboardSummary({
  title,
  description,
  metrics,
}: RoleDashboardSummaryProps) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle className="text-3xl">{title}</CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-6">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <SummaryMetricCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            note={metric.note}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function SummaryMetricCard({
  icon: Icon,
  label,
  value,
  note,
}: SummaryMetric) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <Icon className="size-4 text-primary" />
      <p className="mt-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  );
}
