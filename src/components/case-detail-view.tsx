"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  CaseActionBar,
  ClinicalVariablesCard,
  DispositionCard,
  MedicalRiskCard,
  ModelInputFields,
  TimelineCard,
} from "@/components/case-detail-sections";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { roleActionCopy, roleBasePath } from "@/lib/case-helpers";
import type { ModelFeaturePayload, PatientCase, RoleKey } from "@/lib/types";
import { classify } from "@/services/classifier-service";
import { patientService } from "@/services/patient-service";

type CaseDetailViewProps = {
  patientCase: PatientCase;
  activeRole: RoleKey;
  guide: string;
  readonly?: boolean;
};

export function CaseDetailView({
  patientCase,
  activeRole,
  guide,
  readonly = false,
}: CaseDetailViewProps) {
  const router = useRouter();
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isSavingVariables, setIsSavingVariables] = useState(false);
  const [isNursingDialogOpen, setIsNursingDialogOpen] = useState(false);
  const [isMedicalDialogOpen, setIsMedicalDialogOpen] = useState(false);
  const [isCardiologyDialogOpen, setIsCardiologyDialogOpen] = useState(false);
  const [editableModelInput, setEditableModelInput] = useState<ModelFeaturePayload>(
    patientCase.modelInput,
  );
  const [clinicianDisposition, setClinicianDisposition] = useState<
    "" | "Derivar a cardiología" | "Cerrar con control"
  >(patientCase.assessment.clinicianDisposition ?? "");
  const [clinicianNotes, setClinicianNotes] = useState(
    patientCase.assessment.clinicianNotes ?? "",
  );
  const [hasHeartDisease, setHasHeartDisease] = useState<"" | "true" | "false">(
    typeof patientCase.assessment.hasHeartDisease === "boolean"
      ? (String(patientCase.assessment.hasHeartDisease) as "true" | "false")
      : "",
  );
  const [diagnosis, setDiagnosis] = useState(patientCase.assessment.finalDiagnosis ?? "");
  const [specialistNotes, setSpecialistNotes] = useState(
    patientCase.assessment.specialistNotes ?? "",
  );

  const isReadOnly = patientCase.workflow.nextRole !== activeRole || readonly;
  const canUpdateMedicalAssessment =
    activeRole === "medico" &&
    patientCase.workflow.status === "Derivado a cardiología";
  const modelResult =
    activeRole === "medico" || activeRole === "cardiologia"
      ? classify(patientCase.modelInput)
      : null;

  const basePath = roleBasePath[activeRole];
  const isClosed = patientCase.workflow.status === "Cerrado";
  const canEditVariables =
    activeRole === "enfermeria" &&
    patientCase.workflow.status === "Pendiente de triaje" &&
    !isReadOnly;

  function updateEditableModelInput<K extends keyof ModelFeaturePayload>(
    key: K,
    value: ModelFeaturePayload[K],
  ) {
    setEditableModelInput((current) => ({ ...current, [key]: value }));
  }

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

  async function handleSaveVariables() {
    if (!canEditVariables || isSavingVariables) return;

    setIsSavingVariables(true);
    try {
      await patientService.updateModelInput(patientCase.id, editableModelInput);
      setIsNursingDialogOpen(false);
    } catch (error) {
      console.error("Error al actualizar variables del caso:", error);
    } finally {
      setIsSavingVariables(false);
    }
  }

  async function handleMedicalDisposition(e: React.FormEvent) {
    e.preventDefault();
    if (isAdvancing || isClosed || clinicianDisposition === "") return;

    setIsAdvancing(true);
    try {
      const transition = patientService.getMedicalDispositionTransition(clinicianDisposition);
      await patientService.updateAssessment(patientCase.id, {
        clinicianDisposition,
        clinicianNotes: clinicianNotes.trim(),
      });
      await patientService.advanceStatus(patientCase.id, {
        ...transition,
        note: clinicianNotes.trim() || transition.eventTitle,
      });
      setIsMedicalDialogOpen(false);
      router.push(`${basePath}?guide=${guide}`);
    } catch (error) {
      console.error("Error al registrar la conducta médica:", error);
      setIsAdvancing(false);
    }
  }

  async function handleUpdateMedicalAssessment(e: React.FormEvent) {
    e.preventDefault();
    if (isAdvancing || isClosed || clinicianDisposition === "") return;

    setIsAdvancing(true);
    try {
      await patientService.updateAssessment(patientCase.id, {
        clinicianDisposition,
        clinicianNotes: clinicianNotes.trim(),
      });
      setIsMedicalDialogOpen(false);
    } catch (error) {
      console.error("Error al actualizar la evaluación médica:", error);
    } finally {
      setIsAdvancing(false);
    }
  }

  async function handleCardiologyResolution(e: React.FormEvent) {
    e.preventDefault();
    if (isAdvancing || isClosed || hasHeartDisease === "") return;

    setIsAdvancing(true);
    try {
      const transition = patientService.getCardiologyTransition();
      await patientService.updateAssessment(patientCase.id, {
        hasHeartDisease: hasHeartDisease === "true",
        finalDiagnosis: diagnosis.trim(),
        specialistNotes: specialistNotes.trim(),
      });
      await patientService.advanceStatus(patientCase.id, {
        ...transition,
        note: diagnosis.trim() || "Se registró la resolución clínica del especialista.",
      });
      setIsCardiologyDialogOpen(false);
      router.push(`${basePath}?guide=${guide}`);
    } catch (error) {
      console.error("Error al registrar la resolución cardiológica:", error);
      setIsAdvancing(false);
    }
  }

  const actionElement = (() => {
    if (isReadOnly) {
      return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-muted text-muted-foreground border-dashed">
              Solo lectura
            </Badge>
            <span className="text-sm text-muted-foreground italic">
              Estás viendo este caso en modo de solo lectura
            </span>
          </div>
          {canUpdateMedicalAssessment && (
            <Button variant="outline" size="sm" onClick={() => setIsMedicalDialogOpen(true)}>
              Actualizar evaluación
            </Button>
          )}
        </div>
      );
    }

    if (activeRole === "medico") {
      return (
        <Button onClick={() => setIsMedicalDialogOpen(true)} disabled={isClosed}>
          {patientCase.workflow.primaryActionLabel}
        </Button>
      );
    }

    if (activeRole === "cardiologia") {
      return (
        <Button onClick={() => setIsCardiologyDialogOpen(true)} disabled={isClosed}>
          {patientCase.workflow.primaryActionLabel}
        </Button>
      );
    }

    if (activeRole === "coordinacion") {
      return <Button disabled>{roleActionCopy.coordinacion.primaryAction}</Button>;
    }

    return (
      <Button onClick={handleAdvanceStatus} disabled={isClosed || isAdvancing}>
        {isAdvancing ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : null}
        {roleActionCopy.enfermeria.primaryAction}
      </Button>
    );
  })();

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

      <CaseActionBar
        role={activeRole}
        task={patientCase.workflow.currentTask}
        action={actionElement}
      />

      {(activeRole === "medico" || activeRole === "cardiologia") && (
        <MedicalRiskCard patientCase={patientCase} logit={modelResult?.logit} />
      )}

      <ClinicalVariablesCard
        patientCase={patientCase}
        canEdit={canEditVariables}
        onEdit={() => {
          setEditableModelInput(patientCase.modelInput);
          setIsNursingDialogOpen(true);
        }}
      />


      <TimelineCard timeline={patientCase.workflow.timeline} />

      <Dialog open={isNursingDialogOpen} onOpenChange={setIsNursingDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar variables clínicas</DialogTitle>
            <DialogDescription>
              Ajustá los datos que alimentan la evaluación antes de confirmar el triaje.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <ModelInputFields
              modelInput={editableModelInput}
              onChange={updateEditableModelInput}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveVariables} disabled={isSavingVariables}>
              {isSavingVariables ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : null}
              Guardar variables
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsNursingDialogOpen(false)}
              disabled={isSavingVariables}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMedicalDialogOpen} onOpenChange={setIsMedicalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {canUpdateMedicalAssessment ? "Actualizar evaluación médica" : "Registrar conducta clínica"}
            </DialogTitle>
            <DialogDescription>
              {canUpdateMedicalAssessment
                ? "Modificá la conducta o la nota clínica de este caso derivado."
                : "Elegí la conducta a seguir para este caso y agregá una nota clínica breve."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={canUpdateMedicalAssessment ? handleUpdateMedicalAssessment : handleMedicalDisposition}
            className="grid gap-4"
          >
            <div className="grid gap-3">
              <DispositionCard
                title="Derivar a cardiología"
                description="Escalar el caso para resolución especializada."
                selected={clinicianDisposition === "Derivar a cardiología"}
                onSelect={() => setClinicianDisposition("Derivar a cardiología")}
              />
              <DispositionCard
                title="Cerrar con control"
                description="Cerrar el caso con indicaciones y control clínico habitual."
                selected={clinicianDisposition === "Cerrar con control"}
                onSelect={() => setClinicianDisposition("Cerrar con control")}
              />
            </div>

            <textarea
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              placeholder="Registrar criterio clínico, plan o motivo de derivación."
              value={clinicianNotes}
              onChange={(e) => setClinicianNotes(e.target.value)}
            />

            <DialogFooter>
              <Button type="submit" disabled={isAdvancing || clinicianDisposition === ""}>
                {isAdvancing ? (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                ) : null}
                {canUpdateMedicalAssessment ? "Actualizar evaluación" : "Registrar conducta"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMedicalDialogOpen(false)}
                disabled={isAdvancing}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCardiologyDialogOpen} onOpenChange={setIsCardiologyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar resolución clínica</DialogTitle>
            <DialogDescription>
              Confirmá la presencia o ausencia de enfermedad cardíaca y cerrá el caso.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCardiologyResolution} className="grid gap-4">
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
              <p className="text-sm font-medium text-muted-foreground">Detalle diagnóstico</p>
              <input
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                placeholder="Ej. Enfermedad coronaria estable de alto riesgo"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Observaciones del especialista
              </p>
              <textarea
                rows={5}
                className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                placeholder="Registrar hallazgos, estudios sugeridos o indicaciones de cierre."
                value={specialistNotes}
                onChange={(e) => setSpecialistNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isAdvancing || hasHeartDisease === ""}>
                {isAdvancing ? (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                ) : null}
                Registrar resolución
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCardiologyDialogOpen(false)}
                disabled={isAdvancing}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
