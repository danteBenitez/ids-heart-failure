"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePatientStore } from "@/stores/patient-store";
import { getCaseSummary } from "@/lib/case-helpers";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const guide = searchParams.get("guide") ?? "on";
  void guide; // disponible para los links de navegación

  const patients = usePatientStore((s) => s.patients);
  const isHydrated = usePatientStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    );
  }

  const pending = patients.filter((p) => p.status !== "Cerrado").length;
  const highRisk = patients.filter((p) => p.risk === "Alto").length;
  const referred = patients.filter((p) => p.status === "Derivado a cardiología").length;
  const total = patients.length;
  const withCompleteVitals = patients.filter(
    (p) => p.vitals.restingBP > 0 && p.vitals.cholesterol > 0 && p.vitals.maxHR > 0,
  ).length;
  const dataQuality = total > 0 ? Math.round((withCompleteVitals / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Casos activos" value={String(pending)} note="Aún requieren intervención clínica." />
        <Metric title="Alto riesgo" value={String(highRisk)} note="Ya priorizados o listos para derivación." />
        <Metric title="Derivados" value={String(referred)} note="Casos ya enviados a cardiología." />
        <Metric title="Calidad de datos" value={`${dataQuality}%`} note="Registros con variables completas para score." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Lectura organizacional</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Panel
              title="Lo que aporta esta vista"
              text="No reemplaza la toma de decisiones clínica, pero ayuda a mostrar capacidad de planificación, cuellos de botella y priorización."
            />
            <Panel
              title="Qué conviene destacar"
              text="El sistema no solo predice: también ordena trabajo, resume casos y deja evidencia de las decisiones tomadas."
            />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Estados de los casos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {patients.map((patientCase) => (
              <div
                key={patientCase.id}
                className="rounded-2xl border border-border/70 bg-background/80 p-4"
              >
                <p className="text-sm font-semibold">
                  {patientCase.patient} · {patientCase.id.slice(0, 8)}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {patientCase.status} · Riesgo {patientCase.risk}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getCaseSummary(patientCase.status)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-4xl font-semibold">{value}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function Panel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
