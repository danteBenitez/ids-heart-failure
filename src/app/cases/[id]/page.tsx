import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardList, HeartPulse, UserRound } from "lucide-react";
import { AppFrame } from "@/components/app-frame";
import { GuidePanel } from "@/components/guide-panel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCaseById, patientCases, roleLabels } from "@/lib/demo-data";

type CaseDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CaseDetailPage({
  params,
  searchParams,
}: CaseDetailPageProps) {
  const route = await params;
  const query = (await searchParams) ?? {};
  const palette = typeof query.palette === "string" ? query.palette : undefined;
  const guide = typeof query.guide === "string" ? query.guide : "on";
  const enabledGuide = guide !== "off";
  const patientCase = getCaseById(route.id);

  if (!patientCase) {
    notFound();
  }

  const nextCase =
    patientCases.find((candidate) => candidate.id !== patientCase.id) ?? patientCase;

  return (
    <AppFrame
      title={`${patientCase.patient} · ${patientCase.id}`}
      subtitle="Detalle único del caso clínico: resumen, rol activo, variables cargadas y continuidad del flujo sin saltar entre aplicaciones."
      paletteId={palette}
    >
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/cases?palette=${palette ?? "sand"}&guide=${guide}`}>
            <ArrowLeft data-icon="inline-start" />
            Volver a casos
          </Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/cases/${nextCase.id}?palette=${palette ?? "sand"}&guide=${guide}`}>
            Ver otro caso
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>

      <GuidePanel
        enabled={enabledGuide}
        role={roleLabels[patientCase.nextRole]}
        step={patientCase.guideStep}
        actionLabel={patientCase.actionLabel}
        href={`#rol-activo`}
      />

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback>
                    {patientCase.patient
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{patientCase.patient}</CardTitle>
                  <CardDescription>
                    {patientCase.age} años · Sexo {patientCase.sex} · {patientCase.location}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{patientCase.status}</Badge>
                <Badge
                  variant={patientCase.risk === "Alto" ? "default" : "secondary"}
                >
                  Riesgo {patientCase.risk}
                </Badge>
                <Badge variant="outline">{roleLabels[patientCase.nextRole]}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Próximo rol" value={roleLabels[patientCase.nextRole]} />
            <MetricCard label="Acción principal" value={patientCase.actionLabel} />
            <MetricCard label="Síntesis del caso" value={patientCase.summary} />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Lectura rápida</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {patientCase.insights.map((insight) => (
              <div
                key={insight}
                className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm leading-6 text-muted-foreground"
              >
                {insight}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="rol" className="gap-6">
        <TabsList variant="line">
          <TabsTrigger value="rol">Vista del rol activo</TabsTrigger>
          <TabsTrigger value="variables">Variables clínicas</TabsTrigger>
          <TabsTrigger value="timeline">Timeline del caso</TabsTrigger>
        </TabsList>

        <TabsContent value="rol" id="rol-activo">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>{roleLabels[patientCase.nextRole]}</CardTitle>
              <CardDescription>
                La demo no cambia de sistema: solo muestra la acción que le toca a este rol.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
              <div className="grid gap-4">
                <RoleAction
                  icon={UserRound}
                  title="Contexto del rol"
                  text={patientCase.guideStep}
                />
                <RoleAction
                  icon={ClipboardList}
                  title="Qué debería registrar"
                  text="La interfaz debería guardar la decisión tomada, no solo mostrar el score."
                />
                <RoleAction
                  icon={HeartPulse}
                  title="Cómo sigue el flujo"
                  text="Tras confirmar la acción principal, el estado del caso cambia y se actualiza el próximo rol esperado."
                />
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-background/85 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Acción destacada
                </p>
                <p className="mt-3 text-lg font-semibold">{patientCase.actionLabel}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  En modo guiado, esta acción se resalta. En modo libre, sigue estando
                  disponible sin cambiar la vista.
                </p>
                <Separator className="my-5" />
                <div className="flex flex-wrap gap-3">
                  <Button>{patientCase.actionLabel}</Button>
                  <Button variant="outline">Ver explicación del score</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Variables del dataset esperado</CardTitle>
              <CardDescription>
                Esta maqueta ya usa la estructura de datos del notebook aunque el modelo
                final todavía no esté implementado.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(patientCase.vitals).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-border/70 bg-background/80 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {key}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{String(value)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Timeline del caso</CardTitle>
              <CardDescription>
                Sirve para mostrar quién intervino, qué hizo y qué falta.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {patientCase.events.map((event, index) => (
                <div
                  key={`${event.title}-${index}`}
                  className="grid gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 md:grid-cols-[auto_1fr_auto]"
                >
                  <div
                    className={`mt-1 size-3 rounded-full ${
                      event.completed ? "bg-primary" : "bg-muted-foreground/40"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold">{event.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {event.note}
                    </p>
                  </div>
                  <Badge variant={event.completed ? "secondary" : "outline"}>
                    {event.by}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppFrame>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 font-medium text-foreground">{value}</p>
    </div>
  );
}

function RoleAction({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof UserRound;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
