import { AppFrame } from "@/components/app-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { patientCases } from "@/lib/demo-data";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  await searchParams;

  const highRisk = patientCases.filter(
    (patientCase) => patientCase.assessment.riskLevel === "Alto",
  ).length;
  const pending = patientCases.filter(
    (patientCase) => patientCase.workflow.status !== "Cerrado",
  ).length;

  return (
    <AppFrame
      title="Tablero general"
      subtitle="Vista operativa liviana para mostrar el valor de coordinación sin salir del relato clínico principal."
    >
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Casos activos" value={String(pending)} note="Aún requieren intervención clínica." />
        <Metric title="Alto riesgo" value={String(highRisk)} note="Ya priorizados o listos para derivación." />
        <Metric title="Derivados" value="1" note="Casos ya enviados a cardiología." />
        <Metric title="Calidad de datos" value="92%" note="Registros con variables completas para score." />
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
            {patientCases.map((patientCase) => (
              <div
                key={patientCase.id}
                className="rounded-2xl border border-border/70 bg-background/80 p-4"
              >
                <p className="text-sm font-semibold">
                  {patientCase.patient.fullName} · {patientCase.patient.recordNumber}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {patientCase.workflow.status} · Riesgo {patientCase.assessment.riskLevel}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppFrame>
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
