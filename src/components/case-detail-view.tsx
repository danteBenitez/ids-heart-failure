"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FilePenLine,
  HeartPulse,
  Loader2,
  TrendingUp,
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
import { Input } from "@/components/ui/input";
import {
  fieldValueLabels,
  getFieldLabel,
  getFieldValueLabel,
} from "@/lib/clinical-labels";
import type { CaseEvent, ModelFeaturePayload, PatientCase, RoleKey } from "@/lib/types";
import { roleActionCopy, roleBasePath, roleLabels } from "@/lib/case-helpers";
import { patientService } from "@/services/patient-service";

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
  const router = useRouter();
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isEditingVariables, setIsEditingVariables] = useState(false);
  const [isSavingVariables, setIsSavingVariables] = useState(false);
  const [editableModelInput, setEditableModelInput] = useState<ModelFeaturePayload>(
    patientCase.modelInput,
  );
  const [hasHeartDisease, setHasHeartDisease] = useState<"" | "true" | "false">(
    typeof patientCase.assessment.hasHeartDisease === "boolean"
      ? String(patientCase.assessment.hasHeartDisease) as "true" | "false"
      : "",
  );
  const [diagnosis, setDiagnosis] = useState(patientCase.assessment.finalDiagnosis ?? "");
  const [specialistNotes, setSpecialistNotes] = useState(
    patientCase.assessment.specialistNotes ?? "",
  );
  const [resolutionDisposition, setResolutionDisposition] = useState<
    "Cerrar caso" | "Solicitar seguimiento" | "Reevaluar"
  >(patientCase.assessment.resolutionDisposition ?? "Cerrar caso");
  const nextPendingEvent = patientCase.workflow.timeline.find((event) => !event.completed);
  const roleCopy = roleActionCopy[activeRole];
  const basePath = roleBasePath[activeRole];
  const riskPercentage = Math.round(patientCase.assessment.riskProbability * 100);
  const isClosed = patientCase.workflow.status === "Cerrado";
  const canEditVariables =
    activeRole === "enfermeria" && patientCase.workflow.status === "Pendiente de triaje";
  const isMedicalFollowUp =
    activeRole === "medico" && patientCase.workflow.status === "Seguimiento clínico";
  const isMedicalReevaluation =
    activeRole === "medico" &&
    patientCase.workflow.status === "Listo para evaluación" &&
    patientCase.workflow.primaryActionLabel.toLowerCase().includes("reevalu");
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

  useEffect(() => {
    setEditableModelInput(patientCase.modelInput);
    setIsEditingVariables(false);
  }, [patientCase.modelInput]);

  async function handleAdvanceStatus() {
    if (isAdvancing || isClosed) return;

    setIsAdvancing(true);
    try {
      await patientService.advanceStatus(patientCase.id);
      router.push(`${basePath}?guide=${guide}`);
    } catch (error) {
      console.error("Error al avanzar el estado del caso:", error);
      setIsAdvancing(false);
    }
  }

  async function handleCardiologyResolution(e: React.FormEvent) {
    e.preventDefault();
    if (isAdvancing || isClosed || hasHeartDisease === "") return;

    setIsAdvancing(true);
    try {
      const transition = patientService.getDispositionTransition(resolutionDisposition);
      await patientService.updateAssessment(patientCase.id, {
        hasHeartDisease: hasHeartDisease === "true",
        finalDiagnosis: diagnosis.trim(),
        specialistNotes: specialistNotes.trim(),
        resolutionDisposition,
      });
      await patientService.advanceStatus(patientCase.id, {
        ...transition,
        note: diagnosis.trim() || "Se registró la resolución clínica del especialista.",
      });
      router.push(`${basePath}?guide=${guide}`);
    } catch (error) {
      console.error("Error al registrar la resolución cardiológica:", error);
      setIsAdvancing(false);
    }
  }

  function updateEditableModelInput<K extends keyof ModelFeaturePayload>(
    key: K,
    value: ModelFeaturePayload[K],
  ) {
    setEditableModelInput((current) => ({ ...current, [key]: value }));
  }

  async function handleSaveVariables() {
    if (!canEditVariables || isSavingVariables) return;

    setIsSavingVariables(true);
    try {
      await patientService.updateModelInput(patientCase.id, editableModelInput);
      setIsEditingVariables(false);
    } catch (error) {
      console.error("Error al actualizar variables del caso:", error);
    } finally {
      setIsSavingVariables(false);
    }
  }

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
            <p className="text-sm text-muted-foreground">{patientCase.workflow.currentTask}</p>
          </div>
          {activeRole === "cardiologia" ? (
            <Badge variant="outline">Completar resolución clínica</Badge>
          ) : (
            <div className="flex flex-wrap gap-3">
              {!isClosed ? (
                <Button onClick={handleAdvanceStatus} disabled={isAdvancing}>
                  {isAdvancing ? (
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  ) : null}
                  {activeRole === "medico"
                    ? patientCase.workflow.primaryActionLabel
                    : roleCopy.primaryAction}
                </Button>
              ) : (
                <Button disabled>
                  {activeRole === "medico"
                    ? patientCase.workflow.primaryActionLabel
                    : roleCopy.primaryAction}
                </Button>
              )}
              <Button variant="outline">{roleCopy.secondaryAction}</Button>
            </div>
          )}
        </div>
      </section>

      {activeRole === "medico" ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div className={`rounded-2xl border p-5 ${riskTone}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Probabilidad estimada de enfermedad cardíaca
                </p>
                <div className="flex items-end gap-3">
                  <div className="flex items-center gap-3">
                    <HeartPulse className={`size-8 ${probabilityTone}`} />
                    <span
                      className={`font-heading text-5xl font-semibold tracking-tight ${probabilityTone}`}
                    >
                      {riskPercentage}%
                    </span>
                  </div>
                  <Badge
                    variant={
                      patientCase.assessment.riskLevel === "Alto" ? "default" : "secondary"
                    }
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
                  className={`h-full rounded-full ${
                    patientCase.assessment.riskLevel === "Alto"
                      ? "bg-red-500"
                      : patientCase.assessment.riskLevel === "Medio"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${riskPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/90 p-5">
            <div className="space-y-4">
              {(isMedicalFollowUp || isMedicalReevaluation) &&
              (patientCase.assessment.finalDiagnosis ||
                patientCase.assessment.specialistNotes ||
                typeof patientCase.assessment.hasHeartDisease === "boolean") ? (
                <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Devolución de cardiología
                  </p>
                  <div className="mt-3 space-y-3 text-sm">
                    {typeof patientCase.assessment.hasHeartDisease === "boolean" ? (
                      <Badge
                        variant={
                          patientCase.assessment.hasHeartDisease ? "default" : "secondary"
                        }
                      >
                        {patientCase.assessment.hasHeartDisease
                          ? "Enfermedad cardíaca presente"
                          : "Enfermedad cardíaca ausente"}
                      </Badge>
                    ) : null}
                    {patientCase.assessment.finalDiagnosis ? (
                      <p>{patientCase.assessment.finalDiagnosis}</p>
                    ) : null}
                    {patientCase.assessment.specialistNotes ? (
                      <p className="leading-6 text-muted-foreground">
                        {patientCase.assessment.specialistNotes}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Factores principales del resultado
                </p>
                <ul className="mt-3 grid gap-2">
                  {patientCase.assessment.topFactors.map((factor) => (
                    <li
                      key={factor}
                      className="rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm"
                    >
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Conducta sugerida
                </p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {patientCase.assessment.recommendedAction ??
                    "Registrar evaluación clínica y definir conducta."}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeRole === "cardiologia" ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <form
            onSubmit={handleCardiologyResolution}
            className="rounded-2xl border border-border/70 bg-card/90 p-5"
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Presencia de enfermedad cardíaca
                </p>
                <select
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  value={hasHeartDisease}
                  onChange={(e) => setHasHeartDisease(e.target.value as "" | "true" | "false")}
                >
                  <option value="">Seleccionar</option>
                  <option value="true">Presente</option>
                  <option value="false">Ausente</option>
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Detalle diagnóstico
                </p>
                <input
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  placeholder="Ej. Enfermedad coronaria estable de alto riesgo"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Conducta
                </p>
                <select
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  value={resolutionDisposition}
                  onChange={(e) =>
                    setResolutionDisposition(
                      e.target.value as "Cerrar caso" | "Solicitar seguimiento" | "Reevaluar",
                    )
                  }
                >
                  <option value="Cerrar caso">Cerrar caso</option>
                  <option value="Solicitar seguimiento">Solicitar seguimiento</option>
                  <option value="Reevaluar">Reevaluar con clínica</option>
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Observaciones del especialista
                </p>
                <textarea
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  placeholder="Registrar hallazgos, estudios sugeridos o plan de seguimiento."
                  value={specialistNotes}
                  onChange={(e) => setSpecialistNotes(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3 border-t border-border/70 pt-4">
                <Button type="submit" disabled={isAdvancing || hasHeartDisease === ""}>
                  {isAdvancing ? (
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  ) : null}
                  Registrar resolución
                </Button>
                <Button type="button" variant="outline">
                  Guardar borrador
                </Button>
              </div>
            </div>
          </form>

          <div className="rounded-2xl border border-border/70 bg-card/90 p-5">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Resumen del caso derivado
                </p>
                <p className="mt-2 text-sm leading-6">
                  {patientCase.assessment.clinicalSummary}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Riesgo registrado
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Badge
                    variant={
                      patientCase.assessment.riskLevel === "Alto" ? "default" : "secondary"
                    }
                  >
                    Riesgo {patientCase.assessment.riskLevel}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {riskPercentage}% de probabilidad estimada
                  </span>
                </div>
              </div>

              {typeof patientCase.assessment.hasHeartDisease === "boolean" ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Diagnóstico registrado
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge
                      variant={
                        patientCase.assessment.hasHeartDisease ? "default" : "secondary"
                      }
                    >
                      {patientCase.assessment.hasHeartDisease
                        ? "Enfermedad cardíaca presente"
                        : "Enfermedad cardíaca ausente"}
                    </Badge>
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Factores principales
                </p>
                <ul className="mt-3 grid gap-2">
                  {patientCase.assessment.topFactors.map((factor) => (
                    <li
                      key={factor}
                      className="rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm"
                    >
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarFallback>
                    {patientCase.patient.fullName
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{patientCase.patient.fullName}</CardTitle>
                  <CardDescription>
                    {patientCase.patient.recordNumber} · {patientCase.modelInput.age} años ·{" "}
                    {patientCase.modelInput.sex === "F" ? "Femenino" : "Masculino"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{patientCase.workflow.status}</Badge>
                <Badge
                  variant={
                    patientCase.assessment.riskLevel === "Alto" ? "default" : "secondary"
                  }
                >
                  Riesgo {patientCase.assessment.riskLevel}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {isEditingVariables ? (
                <>
                  <EditableField label={getFieldLabel("age")}>
                    <Input
                      type="number"
                      value={editableModelInput.age}
                      onChange={(e) =>
                        updateEditableModelInput("age", Number(e.target.value))
                      }
                    />
                  </EditableField>
                  <EditableField label={getFieldLabel("sex")}>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      value={editableModelInput.sex}
                      onChange={(e) =>
                        updateEditableModelInput("sex", e.target.value as "F" | "M")
                      }
                    >
                      <option value="F">{fieldValueLabels.sex.F}</option>
                      <option value="M">{fieldValueLabels.sex.M}</option>
                    </select>
                  </EditableField>
                  <EditableField label={getFieldLabel("chestPainType")}>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      value={editableModelInput.chestPainType}
                      onChange={(e) =>
                        updateEditableModelInput(
                          "chestPainType",
                          e.target.value as "TA" | "ATA" | "NAP" | "ASY",
                        )
                      }
                    >
                      <option value="TA">{fieldValueLabels.chestPainType.TA}</option>
                      <option value="ATA">{fieldValueLabels.chestPainType.ATA}</option>
                      <option value="NAP">{fieldValueLabels.chestPainType.NAP}</option>
                      <option value="ASY">{fieldValueLabels.chestPainType.ASY}</option>
                    </select>
                  </EditableField>
                  <EditableField label={getFieldLabel("restingBP")}>
                    <Input
                      type="number"
                      value={editableModelInput.restingBP}
                      onChange={(e) =>
                        updateEditableModelInput("restingBP", Number(e.target.value))
                      }
                    />
                  </EditableField>
                  <EditableField label={getFieldLabel("cholesterol")}>
                    <Input
                      type="number"
                      value={editableModelInput.cholesterol}
                      onChange={(e) =>
                        updateEditableModelInput("cholesterol", Number(e.target.value))
                      }
                    />
                  </EditableField>
                  <EditableField label={getFieldLabel("fastingBS")}>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      value={editableModelInput.fastingBS}
                      onChange={(e) =>
                        updateEditableModelInput("fastingBS", Number(e.target.value) as 0 | 1)
                      }
                    >
                      <option value={0}>{fieldValueLabels.fastingBS[0]}</option>
                      <option value={1}>{fieldValueLabels.fastingBS[1]}</option>
                    </select>
                  </EditableField>
                  <EditableField label={getFieldLabel("maxHR")}>
                    <Input
                      type="number"
                      value={editableModelInput.maxHR}
                      onChange={(e) =>
                        updateEditableModelInput("maxHR", Number(e.target.value))
                      }
                    />
                  </EditableField>
                  <EditableField label={getFieldLabel("exerciseAngina")}>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      value={editableModelInput.exerciseAngina}
                      onChange={(e) =>
                        updateEditableModelInput(
                          "exerciseAngina",
                          e.target.value as "Sí" | "No",
                        )
                      }
                    >
                      <option value="No">{fieldValueLabels.exerciseAngina.N}</option>
                      <option value="Sí">{fieldValueLabels.exerciseAngina.Y}</option>
                    </select>
                  </EditableField>
                  <EditableField label={getFieldLabel("oldpeak")}>
                    <Input
                      type="number"
                      step="0.1"
                      value={editableModelInput.oldpeak}
                      onChange={(e) =>
                        updateEditableModelInput("oldpeak", Number(e.target.value))
                      }
                    />
                  </EditableField>
                  <EditableField label={getFieldLabel("restingECG")}>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      value={editableModelInput.restingECG}
                      onChange={(e) =>
                        updateEditableModelInput(
                          "restingECG",
                          e.target.value as "Normal" | "ST" | "LVH",
                        )
                      }
                    >
                      <option value="Normal">{fieldValueLabels.restingECG.Normal}</option>
                      <option value="ST">{fieldValueLabels.restingECG.ST}</option>
                      <option value="LVH">{fieldValueLabels.restingECG.LVH}</option>
                    </select>
                  </EditableField>
                  <EditableField label={getFieldLabel("stSlope")}>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      value={editableModelInput.stSlope}
                      onChange={(e) =>
                        updateEditableModelInput(
                          "stSlope",
                          e.target.value as "Up" | "Flat" | "Down",
                        )
                      }
                    >
                      <option value="Up">{fieldValueLabels.stSlope.Up}</option>
                      <option value="Flat">{fieldValueLabels.stSlope.Flat}</option>
                      <option value="Down">{fieldValueLabels.stSlope.Down}</option>
                    </select>
                  </EditableField>
                </>
              ) : (
                Object.entries(patientCase.modelInput).map(([key, value]) => (
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
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {canEditVariables ? (
                isEditingVariables ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSaveVariables}
                      disabled={isSavingVariables}
                    >
                      {isSavingVariables ? (
                        <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                      ) : null}
                      Guardar variables
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditableModelInput(patientCase.modelInput);
                        setIsEditingVariables(false);
                      }}
                      disabled={isSavingVariables}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingVariables(true)}
                  >
                    <FilePenLine data-icon="inline-start" />
                    Corregir variables
                  </Button>
                )
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Línea de tiempo del caso</CardTitle>
            <CardDescription>Estado del paciente dentro del flujo clínico.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 xl:hidden">
              {patientCase.workflow.timeline.map((event, index) => (
                <TimelineEvent
                  key={`${event.id}-${index}`}
                  event={event}
                  isCurrent={!event.completed && event === nextPendingEvent}
                  isLast={index === patientCase.workflow.timeline.length - 1}
                />
              ))}
            </div>

            <div className="hidden xl:grid xl:grid-cols-[repeat(3,minmax(0,1fr))] xl:gap-4">
              {patientCase.workflow.timeline.map((event, index) => (
                <HorizontalTimelineEvent
                  key={`${event.id}-${index}`}
                  event={event}
                  isCurrent={!event.completed && event === nextPendingEvent}
                  isFirst={index === 0}
                  isLast={index === patientCase.workflow.timeline.length - 1}
                />
              ))}
            </div>

            <div className="mt-4 hidden xl:flex xl:flex-wrap xl:gap-2">
              {patientCase.workflow.timeline.map((event, index) => (
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

function EditableField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-3">{children}</div>
    </label>
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
          className={`flex size-9 items-center justify-center rounded-full border ${
            event.completed
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
        className={`rounded-2xl border p-4 ${
          isCurrent
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
          className={`relative z-10 flex size-9 items-center justify-center rounded-full border bg-background ${
            event.completed
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
        className={`rounded-2xl border p-4 ${
          isCurrent
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
