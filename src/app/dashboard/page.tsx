"use client";

import {
  Activity,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePatientStore } from "@/stores/patient-store";

const statusMeta = {
  "Pendiente de triaje": {
    tone: "bg-amber-500",
    note: "Casos esperando validación de enfermería.",
  },
  "Listo para evaluación": {
    tone: "bg-sky-500",
    note: "Pacientes disponibles para score y decisión clínica.",
  },
  "Derivado a cardiología": {
    tone: "bg-rose-500",
    note: "Casos que ya requieren resolución especializada.",
  },
  Cerrado: {
    tone: "bg-emerald-500",
    note: "Casos con resolución clínica registrada.",
  },
} as const;

export default function DashboardPage() {
  const patients = usePatientStore((s) => s.patients);
  const isHydrated = usePatientStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-44 animate-pulse rounded-[2rem] bg-muted/50" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="h-72 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-72 animate-pulse rounded-2xl bg-muted/50" />
        </div>
      </div>
    );
  }

  const total = patients.length;
  const activeCases = patients.filter((p) => p.workflow.status !== "Cerrado").length;
  const highRisk = patients.filter((p) => p.assessment.riskLevel === "Alto").length;
  const referred = patients.filter(
    (p) => p.workflow.status === "Derivado a cardiología",
  ).length;
  const withCompleteVitals = patients.filter(
    (p) =>
      p.modelInput.restingBP > 0 &&
      p.modelInput.cholesterol > 0 &&
      p.modelInput.maxHR > 0,
  ).length;
  const dataQuality = total > 0 ? Math.round((withCompleteVitals / total) * 100) : 0;

  const statuses = [
    "Pendiente de triaje",
    "Listo para evaluación",
    "Derivado a cardiología",
    "Cerrado",
  ] as const;

  const statusRows = statuses.map((status) => {
    const count = patients.filter((patient) => patient.workflow.status === status).length;
    return {
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      ...statusMeta[status],
    };
  });

  const recentCases = [...patients]
    .sort(
      (a, b) =>
        new Date(b.metadata.updatedAt).getTime() -
        new Date(a.metadata.updatedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tablero"
        subtitle="Resumen administrativo del flujo clínico, estados de los casos y calidad de los datos cargados."
        right={
          <div className="space-y-2 text-left md:text-right">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Casos activos
            </p>
            <p className="font-heading text-6xl font-semibold tracking-tight">
              {activeCases}
            </p>
          </div>
        }
        bottom={
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <HeroStat label="Casos totales" value={String(total)} />
            <HeroStat label="Alto riesgo" value={String(highRisk)} />
            <HeroStat label="Derivados" value={String(referred)} />
            <HeroStat label="Calidad de datos" value={`${dataQuality}%`} />
          </div>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Casos activos"
          value={String(activeCases)}
          note="Aún requieren intervención clínica."
          icon={ClipboardList}
          tone="bg-amber-500"
        />
        <MetricCard
          title="Alto riesgo"
          value={String(highRisk)}
          note="Pacientes priorizados por el clasificador."
          icon={HeartPulse}
          tone="bg-rose-500"
        />
        <MetricCard
          title="Derivados"
          value={String(referred)}
          note="Casos ya enviados a cardiología."
          icon={Activity}
          tone="bg-sky-500"
        />
        <MetricCard
          title="Calidad de datos"
          value={`${dataQuality}%`}
          note="Registros con variables completas para score."
          icon={ShieldCheck}
          tone="bg-emerald-500"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Estados del flujo</CardTitle>
            <CardDescription>
              Distribución actual de casos dentro del circuito asistencial.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {statusRows.map((row) => (
              <div
                key={row.status}
                className="rounded-2xl border border-border/70 bg-background/80 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{row.status}</p>
                    <p className="text-sm text-muted-foreground">{row.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-3xl font-semibold">{row.count}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {row.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress
                    value={row.percentage}
                    className="h-3 bg-muted"
                    indicatorClassName={row.tone}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle>Casos recientes</CardTitle>
              <CardDescription>
                Últimos casos actualizados dentro del circuito asistencial.
              </CardDescription>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 p-2 text-muted-foreground">
              <TimerReset className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {recentCases.map((patientCase) => (
              <div
                key={patientCase.id}
                className="rounded-2xl border border-border/70 bg-background/80 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      {patientCase.patient.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {patientCase.patient.recordNumber} · {patientCase.patient.location}
                    </p>
                  </div>
                  <Badge
                    variant={
                      patientCase.assessment.riskLevel === "Alto" ? "default" : "secondary"
                    }
                  >
                    Riesgo {patientCase.assessment.riskLevel}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">{patientCase.workflow.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {patientCase.assessment.clinicalSummary}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Actualizado {formatRelativeTimestamp(patientCase.metadata.updatedAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  note,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: typeof ClipboardList;
  tone: string;
}) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription>{note}</CardDescription>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/80 p-2 text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-4xl font-semibold">{value}</p>
        <div className="mt-4">
          <div className={`h-1.5 rounded-full ${tone}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function formatRelativeTimestamp(timestamp: string) {
  const updatedAt = new Date(timestamp).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(0, Math.round((now - updatedAt) / 60000));

  if (diffMinutes < 60) {
    return `hace ${diffMinutes || 1} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `hace ${diffHours} h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `hace ${diffDays} d`;
}
