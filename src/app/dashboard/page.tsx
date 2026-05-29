"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePatientStore } from "@/stores/patient-store";

export default function DashboardPage() {
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

  const pending = patients.filter((p) => p.workflow.status !== "Cerrado").length;
  const highRisk = patients.filter((p) => p.assessment.riskLevel === "Alto").length;
  const referred = patients.filter(
    (p) => p.workflow.status === "Derivado a cardiología",
  ).length;
  const total = patients.length;
  const withCompleteVitals = patients.filter(
    (p) =>
      p.modelInput.restingBP > 0 &&
      p.modelInput.cholesterol > 0 &&
      p.modelInput.maxHR > 0,
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
            <CardTitle>Estados del flujo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <StatusRow label="Pendiente de triaje" value={patients.filter((p) => p.workflow.status === "Pendiente de triaje").length} />
            <StatusRow label="Listo para evaluación" value={patients.filter((p) => p.workflow.status === "Listo para evaluación").length} />
            <StatusRow label="Derivado a cardiología" value={referred} />
            <StatusRow label="Cerrado" value={patients.filter((p) => p.workflow.status === "Cerrado").length} />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Casos recientes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {patients.map((patientCase) => (
              <div
                key={patientCase.id}
                className="rounded-2xl border border-border/70 bg-background/80 p-4"
              >
                <p className="text-sm font-semibold">
                  {patientCase.patient.fullName} · {patientCase.patient.recordNumber}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">{patientCase.workflow.status}</Badge>
                  <Badge
                    variant={
                      patientCase.assessment.riskLevel === "Alto" ? "default" : "secondary"
                    }
                  >
                    Riesgo {patientCase.assessment.riskLevel}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {patientCase.assessment.clinicalSummary}
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

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 p-4">
      <p className="text-sm font-medium">{label}</p>
      <p className="font-heading text-2xl font-semibold">{value}</p>
    </div>
  );
}
