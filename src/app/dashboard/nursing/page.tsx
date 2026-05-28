import Link from "next/link";
import { ClipboardPlus, Clock3, HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { patientCases } from "@/lib/demo-data";

type NursingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NursingPage({ searchParams }: NursingPageProps) {
  const params = (await searchParams) ?? {};
  const palette = typeof params.palette === "string" ? params.palette : "sand";
  const guide = typeof params.guide === "string" ? params.guide : "on";

  const pendingCases = patientCases.filter(
    (patientCase) =>
      patientCase.nextRole === "enfermeria" ||
      patientCase.status === "Pendiente de triaje",
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Ruta: `/dashboard/nursing`</Badge>
              <Badge variant="outline">Bandeja de rol</Badge>
            </div>
            <CardTitle className="text-3xl">Enfermería</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Esta vista reúne la bandeja operativa del rol. Desde acá enfermería ve
              los casos pendientes de carga inicial y puede abrir el formulario para
              registrar un paciente nuevo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Metric
              icon={Clock3}
              label="Pendientes de triaje"
              value={String(pendingCases.length)}
              note="Casos que todavía necesitan carga o validación inicial."
            />
            <Metric
              icon={ClipboardPlus}
              label="Acción principal"
              value="Nuevo paciente"
              note="Alta clínica inicial para alimentar el modelo más adelante."
            />
            <Metric
              icon={HeartPulse}
              label="Próximo rol"
              value="Médico clínico"
              note="Una vez completo el formulario, el caso pasa a evaluación."
            />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Siguiente paso de implementación</CardTitle>
            <CardDescription>
              El detalle unificado del caso vendrá después. Por ahora, esta pantalla
              fija la lógica de entrada y de filtro del rol.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm leading-6 text-muted-foreground">
              Enfermería no debería ver la misma lista que cardiología. Su bandeja se
              limita a casos pendientes de carga o corrección.
            </div>
            <Button asChild className="w-full justify-between">
              <Link href={`/dashboard/nursing/new?palette=${palette}&guide=${guide}`}>
                Cargar paciente nuevo
                <ClipboardPlus data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Casos visibles para enfermería</CardTitle>
          <CardDescription>
            Bandeja filtrada por estado y responsabilidad actual.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {pendingCases.map((patientCase) => (
            <div
              key={patientCase.id}
              className="grid gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 md:grid-cols-[1.2fr_0.7fr_auto]"
            >
              <div>
                <p className="text-sm font-semibold">
                  {patientCase.patient} · {patientCase.id}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {patientCase.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 md:content-start">
                <Badge variant="outline">{patientCase.status}</Badge>
                <Badge variant="secondary">Riesgo {patientCase.risk}</Badge>
              </div>
              <div className="flex items-start justify-start md:justify-end">
                <Button variant="outline" size="sm" disabled>
                  Abrir caso
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Rutas y pantallas acordadas</CardTitle>
          <CardDescription>
            Base mínima para que cada rol entre por su propia bandeja.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RouteCard
            route="/dashboard/nursing"
            title="Bandeja de enfermería"
            text="Casos pendientes de triaje y acceso a alta de paciente."
          />
          <RouteCard
            route="/dashboard/nursing/new"
            title="Nuevo paciente"
            text="Formulario inicial con variables del dataset clínico."
          />
          <RouteCard
            route="/dashboard/clinical"
            title="Bandeja médica"
            text="Casos con datos completos, listos para score y decisión."
          />
          <RouteCard
            route="/dashboard/cardiology"
            title="Bandeja de cardiología"
            text="Casos derivados con score y contexto clínico previo."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  note: string;
}) {
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

function RouteCard({
  route,
  title,
  text,
}: {
  route: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {route}
      </p>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
