import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FilePenLine,
} from "lucide-react";
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
import { getFieldLabel, getFieldValueLabel } from "@/lib/clinical-labels";
import { type CaseEvent, type PatientCase, type RoleKey, roleLabels } from "@/lib/demo-data";

const roleBasePath: Record<RoleKey, string> = {
  enfermeria: "/dashboard/nursing",
  medico: "/dashboard/clinical",
  cardiologia: "/dashboard/cardiology",
  coordinacion: "/dashboard",
};

const roleActionCopy: Record<
  RoleKey,
  {
    primaryAction: string;
    secondaryAction: string;
  }
> = {
  enfermeria: {
    primaryAction: "Confirmar triaje",
    secondaryAction: "Guardar borrador",
  },
  medico: {
    primaryAction: "Registrar evaluación",
    secondaryAction: "Ver explicación del score",
  },
  cardiologia: {
    primaryAction: "Registrar resolución",
    secondaryAction: "Cerrar caso",
  },
  coordinacion: {
    primaryAction: "Ver cierre",
    secondaryAction: "Volver al tablero",
  },
};

type CaseDetailViewProps = {
  patientCase: PatientCase;
  activeRole: RoleKey;
  guide: string;
};

export function CaseDetailView({
  patientCase,
  activeRole,
  guide,
}: CaseDetailViewProps) {
  const nextPendingEvent = patientCase.events.find((event) => !event.completed);
  const roleCopy = roleActionCopy[activeRole];
  const basePath = roleBasePath[activeRole];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`${basePath}?guide=${guide}`}>
            <ArrowLeft data-icon="inline-start" />
            Volver a la bandeja
          </Link>
        </Button>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card/90 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{roleLabels[activeRole]}</p>
            <p className="text-sm text-muted-foreground">{patientCase.guideStep}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button>{roleCopy.primaryAction}</Button>
            <Button variant="outline">{roleCopy.secondaryAction}</Button>
          </div>
        </div>
      </section>


      <section className="grid gap-6">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarFallback>
                    {patientCase.patient
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{patientCase.patient}</CardTitle>
                  <CardDescription>
                    {patientCase.id} · {patientCase.age} años · {patientCase.sex === "F" ? "Femenino" : "Masculino"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{patientCase.status}</Badge>
                <Badge variant={patientCase.risk === "Alto" ? "default" : "secondary"}>
                  Riesgo {patientCase.risk}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(patientCase.vitals).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-border/70 bg-background/80 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {getFieldLabel(key)}
                  </p>
                  <p className="mt-2 text-base font-semibold">
                    {getFieldValueLabel(key, value)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <FilePenLine data-icon="inline-start" />
                Corregir variables
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Línea de tiempo del caso</CardTitle>
            <CardDescription>
              Estado del paciente dentro del flujo clínico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 xl:hidden">
              {patientCase.events.map((event, index) => (
                <TimelineEvent
                  key={`${event.title}-${index}`}
                  event={event}
                  isCurrent={!event.completed && event === nextPendingEvent}
                  isLast={index === patientCase.events.length - 1}
                />
              ))}
            </div>

            <div className="hidden xl:grid xl:grid-cols-[repeat(3,minmax(0,1fr))] xl:gap-4">
              {patientCase.events.map((event, index) => (
                <HorizontalTimelineEvent
                  key={`${event.title}-${index}`}
                  event={event}
                  isCurrent={!event.completed && event === nextPendingEvent}
                  isFirst={index === 0}
                  isLast={index === patientCase.events.length - 1}
                />
              ))}
            </div>

            <div className="mt-4 hidden xl:flex xl:flex-wrap xl:gap-2">
              {patientCase.events.map((event, index) => (
                <Badge
                  key={`${event.by}-${index}`}
                  variant={!event.completed && event === nextPendingEvent ? "default" : "outline"}
                >
                  {event.by}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function TimelineEvent({
  event,
  isCurrent,
  isLast,
}: {
  event: CaseEvent;
  isCurrent: boolean;
  isLast: boolean;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex size-9 items-center justify-center rounded-full border ${event.completed
            ? "border-primary/30 bg-primary/10 text-primary"
            : isCurrent
              ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "border-border bg-background text-muted-foreground"
            }`}
        >
          {event.completed ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <div className="size-2 rounded-full bg-current" />
          )}
        </div>
        {!isLast ? <div className="my-2 h-full min-h-8 w-px bg-border" /> : null}
      </div>

      <div
        className={`rounded-2xl border p-4 ${isCurrent
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border/70 bg-background/80"
          }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{event.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.note}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={event.completed ? "secondary" : "outline"}>
              {event.by}
            </Badge>
            {isCurrent ? <Badge>Actual</Badge> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function HorizontalTimelineEvent({
  event,
  isCurrent,
  isFirst,
  isLast,
}: {
  event: CaseEvent;
  isCurrent: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="relative flex min-w-0 flex-col gap-3">
      <div className="relative flex items-center">
        {!isFirst ? (
          <div className="absolute left-0 right-1/2 top-1/2 h-px -translate-y-1/2 bg-border" />
        ) : null}
        {!isLast ? (
          <div className="absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        ) : null}
        <div
          className={`relative z-10 flex size-9 items-center justify-center rounded-full border bg-background ${event.completed
            ? "border-primary/30 bg-primary/10 text-primary"
            : isCurrent
              ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "border-border text-muted-foreground"
            }`}
        >
          {event.completed ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <div className="size-2 rounded-full bg-current" />
          )}
        </div>
      </div>

      <div
        className={`rounded-2xl border p-4 ${isCurrent
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border/70 bg-background/80"
          }`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{event.title}</p>
            {isCurrent ? <Badge>Actual</Badge> : null}
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{event.note}</p>
        </div>
      </div>
    </div>
  );
}
