"use client";

import type { ReactNode } from "react";
import { CheckCircle2, FilePenLine, HeartPulse, TrendingUp } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  fieldValueLabels,
  getFieldLabel,
  getFieldValueLabel,
} from "@/lib/clinical-labels";
import { roleLabels } from "@/lib/case-helpers";
import type { CaseEvent, ModelFeaturePayload, PatientCase, RoleKey } from "@/lib/types";

export function CaseActionBar({
  role,
  task,
  action,
}: {
  role: RoleKey;
  task: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/90 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{roleLabels[role]}</p>
          <p className="text-sm text-muted-foreground">{task}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

export function ClinicalVariablesCard({
  patientCase,
  canEdit,
  onEdit,
}: {
  patientCase: PatientCase;
  canEdit: boolean;
  onEdit?: () => void;
}) {

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              <AvatarFallback>
                {patientCase.patient.fullName
                  .split(" ")
                  .map((chunk) => chunk[0].toUpperCase())
                  .join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-xl">{patientCase.patient.fullName}</CardTitle>
              <CardDescription>
                {patientCase.patient.recordNumber} · {patientCase.modelInput.age} años ·{" "}
                {patientCase.modelInput.sex === "F" ? "Femenino" : "Masculino"} ·{" "}
                {patientCase.patient.location}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{patientCase.workflow.status}</Badge>
            <Badge
              variant={patientCase.assessment.riskLevel === "Alto" ? "default" : "secondary"}
            >
              Riesgo {patientCase.assessment.riskLevel}
            </Badge>
            {canEdit && onEdit ? (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <FilePenLine data-icon="inline-start" />
                Editar variables
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(patientCase.modelInput).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {getFieldLabel(key)}
              </p>
              <p className="mt-2 text-base font-semibold">{getFieldValueLabel(key, value)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MedicalRiskCard({ patientCase }: { patientCase: PatientCase }) {
  const riskPercentage = Math.round(patientCase.assessment.riskProbability * 100);
  const riskTone =
    patientCase.assessment.riskLevel === "Alto"
      ? "border-red-500/20 bg-red-500/5"
      : patientCase.assessment.riskLevel === "Medio"
        ? "border-amber-500/20 bg-amber-500/5"
        : "border-emerald-500/20 bg-emerald-500/5";
  const probabilityTone =
    patientCase.assessment.riskLevel === "Alto"
      ? "text-red-600 dark:text-red-400"
      : patientCase.assessment.riskLevel === "Medio"
        ? "text-amber-700 dark:text-amber-300"
        : "text-emerald-700 dark:text-emerald-300";

  return (
    <section className={`rounded-2xl border p-5 ${riskTone}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Probabilidad estimada de enfermedad cardíaca
          </p>
          <div className="flex items-end gap-3">
            <div className="flex items-center gap-3">
              <HeartPulse className={`size-8 ${probabilityTone}`} />
              <span className={`font-heading text-5xl font-semibold tracking-tight ${probabilityTone}`}>
                {riskPercentage}%
              </span>
            </div>
            <Badge
              variant={patientCase.assessment.riskLevel === "Alto" ? "default" : "secondary"}
            >
              Riesgo {patientCase.assessment.riskLevel}
            </Badge>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {patientCase.assessment.clinicalSummary}
          </p>
        </div>
        <TrendingUp className={`mt-1 hidden size-5 shrink-0 md:block ${probabilityTone}`} />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>Escala de riesgo</span>
          <span>{riskPercentage}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-background/80">
          <div
            className={`h-full rounded-full ${patientCase.assessment.riskLevel === "Alto"
              ? "bg-red-500"
              : patientCase.assessment.riskLevel === "Medio"
                ? "bg-amber-500"
                : "bg-emerald-500"
              }`}
            style={{ width: `${riskPercentage}%` }}
          />
        </div>
      </div>

      {patientCase.assessment.topFactors.length > 0 ? (
        <div className="mt-5 rounded-xl border border-border/70 bg-background/80 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Factores principales
          </p>
          <ul className="mt-3 grid gap-2">
            {patientCase.assessment.topFactors.map((factor) => (
              <li key={factor} className="text-sm leading-6">
                {factor}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export function EditableField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</span>
      <div className="mt-3">{children}</div>
    </label>
  );
}

export function ModelInputFields({
  modelInput,
  onChange,
}: {
  modelInput: ModelFeaturePayload;
  onChange: <K extends keyof ModelFeaturePayload>(key: K, value: ModelFeaturePayload[K]) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <EditableField label={getFieldLabel("age")}>
        <Input type="number" value={modelInput.age} onChange={(e) => onChange("age", Number(e.target.value))} />
      </EditableField>
      <EditableField label={getFieldLabel("sex")}>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={modelInput.sex}
          onChange={(e) => onChange("sex", e.target.value as "F" | "M")}
        >
          <option value="F">{fieldValueLabels.sex.F}</option>
          <option value="M">{fieldValueLabels.sex.M}</option>
        </select>
      </EditableField>
      <EditableField label={getFieldLabel("chestPainType")}>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={modelInput.chestPainType}
          onChange={(e) => onChange("chestPainType", e.target.value as "TA" | "ATA" | "NAP" | "ASY")}
        >
          <option value="TA">{fieldValueLabels.chestPainType.TA}</option>
          <option value="ATA">{fieldValueLabels.chestPainType.ATA}</option>
          <option value="NAP">{fieldValueLabels.chestPainType.NAP}</option>
          <option value="ASY">{fieldValueLabels.chestPainType.ASY}</option>
        </select>
      </EditableField>
      <EditableField label={getFieldLabel("restingBP")}>
        <Input type="number" value={modelInput.restingBP} onChange={(e) => onChange("restingBP", Number(e.target.value))} />
      </EditableField>
      <EditableField label={getFieldLabel("cholesterol")}>
        <Input type="number" value={modelInput.cholesterol} onChange={(e) => onChange("cholesterol", Number(e.target.value))} />
      </EditableField>
      <EditableField label={getFieldLabel("fastingBS")}>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={modelInput.fastingBS}
          onChange={(e) => onChange("fastingBS", Number(e.target.value) as 0 | 1)}
        >
          <option value={0}>{fieldValueLabels.fastingBS[0]}</option>
          <option value={1}>{fieldValueLabels.fastingBS[1]}</option>
        </select>
      </EditableField>
      <EditableField label={getFieldLabel("maxHR")}>
        <Input type="number" value={modelInput.maxHR} onChange={(e) => onChange("maxHR", Number(e.target.value))} />
      </EditableField>
      <EditableField label={getFieldLabel("exerciseAngina")}>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={modelInput.exerciseAngina}
          onChange={(e) => onChange("exerciseAngina", e.target.value as "Sí" | "No")}
        >
          <option value="No">{fieldValueLabels.exerciseAngina.N}</option>
          <option value="Sí">{fieldValueLabels.exerciseAngina.Y}</option>
        </select>
      </EditableField>
      <EditableField label={getFieldLabel("oldpeak")}>
        <Input type="number" step="0.1" value={modelInput.oldpeak} onChange={(e) => onChange("oldpeak", Number(e.target.value))} />
      </EditableField>
      <EditableField label={getFieldLabel("restingECG")}>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={modelInput.restingECG}
          onChange={(e) => onChange("restingECG", e.target.value as "Normal" | "ST" | "LVH")}
        >
          <option value="Normal">{fieldValueLabels.restingECG.Normal}</option>
          <option value="ST">{fieldValueLabels.restingECG.ST}</option>
          <option value="LVH">{fieldValueLabels.restingECG.LVH}</option>
        </select>
      </EditableField>
      <EditableField label={getFieldLabel("stSlope")}>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={modelInput.stSlope}
          onChange={(e) => onChange("stSlope", e.target.value as "Up" | "Flat" | "Down")}
        >
          <option value="Up">{fieldValueLabels.stSlope.Up}</option>
          <option value="Flat">{fieldValueLabels.stSlope.Flat}</option>
          <option value="Down">{fieldValueLabels.stSlope.Down}</option>
        </select>
      </EditableField>
    </div>
  );
}

export function DispositionCard({
  title,
  description,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-2xl border p-4 text-left transition ${selected ? "border-primary bg-primary/5" : "border-border/70 bg-background/80 hover:border-primary/40"
        }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </button>
  );
}

export function TimelineCard({
  timeline,
}: {
  timeline: PatientCase["workflow"]["timeline"];
}) {
  const nextPendingEvent = timeline.find((event) => !event.completed);

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle>Línea de tiempo del caso</CardTitle>
        <CardDescription>Estado del paciente dentro del flujo clínico.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 xl:hidden">
          {timeline.map((event, index) => (
            <TimelineEvent
              key={`${event.id}-${index}`}
              event={event}
              isCurrent={!event.completed && event === nextPendingEvent}
              isLast={index === timeline.length - 1}
            />
          ))}
        </div>

        <div className="hidden xl:grid xl:grid-cols-[repeat(3,minmax(0,1fr))] xl:gap-4">
          {timeline.map((event, index) => (
            <HorizontalTimelineEvent
              key={`${event.id}-${index}`}
              event={event}
              isCurrent={!event.completed && event === nextPendingEvent}
              isFirst={index === 0}
              isLast={index === timeline.length - 1}
            />
          ))}
        </div>

        <div className="mt-4 hidden xl:flex xl:flex-wrap xl:gap-2">
          {timeline.map((event, index) => (
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
          {event.completed ? <CheckCircle2 className="size-4" /> : <div className="size-2 rounded-full bg-current" />}
        </div>
        {!isLast ? <div className="my-2 h-full min-h-8 w-px bg-border" /> : null}
      </div>

      <div
        className={`rounded-2xl border p-4 ${isCurrent ? "border-amber-500/30 bg-amber-500/5" : "border-border/70 bg-background/80"
          }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{event.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.note}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={event.completed ? "secondary" : "outline"}>{event.by}</Badge>
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
        {!isFirst ? <div className="absolute left-0 right-1/2 top-1/2 h-px -translate-y-1/2 bg-border" /> : null}
        {!isLast ? <div className="absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 bg-border" /> : null}
        <div
          className={`relative z-10 flex size-9 items-center justify-center rounded-full border bg-background ${event.completed
            ? "border-primary/30 bg-primary/10 text-primary"
            : isCurrent
              ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "border-border text-muted-foreground"
            }`}
        >
          {event.completed ? <CheckCircle2 className="size-4" /> : <div className="size-2 rounded-full bg-current" />}
        </div>
      </div>

      <div
        className={`rounded-2xl border p-4 ${isCurrent ? "border-amber-500/30 bg-amber-500/5" : "border-border/70 bg-background/80"
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
