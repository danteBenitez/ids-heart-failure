import { usePatientStore } from "@/stores/patient-store";
import type {
  CaseStatus,
  CreatePatientInput,
  PatientCase,
  RoleKey,
  UpdateAssessmentInput,
  UpdateModelInput,
} from "@/lib/types";
import {
  getCaseActionLabel,
  getCaseGuideStep,
  getCardiologyTransition,
  getMedicalDispositionTransition,
  getNextRole,
  getNextStatus,
  getTransitionEventTitle,
  roleLabels,
} from "@/lib/case-helpers";
import { buildAssessmentFromModel } from "@/services/classifier-service";

type AdvanceStatusOptions = {
  eventTitle?: string;
  nextRole?: RoleKey;
  nextStatus?: CaseStatus;
  currentTask?: string;
  primaryActionLabel?: string;
  note?: string;
};

type ImportCasesOptions = {
  onProgress?: (completed: number, total: number) => void;
};

export const patientService = {
  async getAll(): Promise<PatientCase[]> {
    return usePatientStore.getState().patients;
  },

  async getById(id: string): Promise<PatientCase | null> {
    return usePatientStore.getState().patients.find((p) => p.id === id) ?? null;
  },

  async getByRole(role: RoleKey): Promise<PatientCase[]> {
    const targetStatuses = getStatusesForRole(role);
    return usePatientStore
      .getState()
      .patients.filter(
        (p) => p.workflow.nextRole === role || targetStatuses.includes(p.workflow.status),
      );
  },

  async create(input: CreatePatientInput): Promise<PatientCase> {
    const now = new Date().toISOString();

    const patient: PatientCase = {
      id: crypto.randomUUID(),
      patient: {
        ...input.patient,
        recordNumber: buildRecordNumber(),
      },
      modelInput: input.modelInput,
      workflow: {
        status: "Pendiente de triaje",
        nextRole: "enfermeria",
        currentTask: getCaseGuideStep("enfermeria"),
        primaryActionLabel: getCaseActionLabel("enfermeria"),
        timeline: [
          {
            id: crypto.randomUUID(),
            title: "Caso creado",
            by: "Enfermería",
            note: "Paciente ingresado al sistema.",
            completed: true,
            timestamp: now,
          },
          {
            id: crypto.randomUUID(),
            title: "Carga de triaje",
            by: "Enfermería",
            note: "Pendiente de validación de datos clínicos.",
            completed: false,
            timestamp: now,
          },
          {
            id: crypto.randomUUID(),
            title: "Evaluación médica",
            by: "Médico general",
            note: "Bloqueada hasta confirmar el triaje.",
            completed: false,
            timestamp: now,
          },
        ],
      },
      assessment: {
        riskLevel: input.assessment?.riskLevel ?? "Medio",
        riskProbability: 0,
        clinicalSummary:
          input.assessment?.clinicalSummary ?? "Caso creado y pendiente de triaje.",
        topFactors: input.assessment?.topFactors ?? [],
      },
      metadata: {
        createdAt: now,
        updatedAt: now,
      },
    };

    usePatientStore.getState()._addPatient(patient);
    return patient;
  },

  async importTriageCompleteCases(
    inputs: CreatePatientInput[],
    options: ImportCasesOptions = {},
  ): Promise<PatientCase[]> {
    const importedCases: PatientCase[] = [];
    const total = inputs.length;

    for (let index = 0; index < inputs.length; index += 1) {
      const input = inputs[index];
      const created = await this.create(input);
      const advanced = await this.advanceStatus(created.id, {
        note: "Datos clínicos importados desde CSV y validados para evaluación médica.",
      });
      importedCases.push(advanced);
      options.onProgress?.(index + 1, total);

      if ((index + 1) % 20 === 0) {
        await yieldToBrowser();
      }
    }

    return importedCases;
  },

  async advanceStatus(id: string, options?: string | AdvanceStatusOptions): Promise<PatientCase> {
    const store = usePatientStore.getState();
    const patient = store.patients.find((p) => p.id === id);

    if (!patient) throw new Error(`Paciente con id "${id}" no encontrado.`);
    if (patient.workflow.status === "Cerrado") {
      throw new Error(`El caso "${patient.patient.fullName}" ya está cerrado.`);
    }

    const normalizedOptions =
      typeof options === "string" ? { note: options } : (options ?? {});

    const now = new Date().toISOString();
    const currentRole = patient.workflow.nextRole;
    const newStatus = normalizedOptions.nextStatus ?? getNextStatus(patient.workflow.status);
    const newRole = normalizedOptions.nextRole ?? getNextRole(currentRole);
    const eventTitle = normalizedOptions.eventTitle ?? getTransitionEventTitle(currentRole);
    const eventBy = roleLabels[currentRole];

    let markedPending = false;
    const updatedTimeline = patient.workflow.timeline.map((event) => {
      if (!markedPending && !event.completed) {
        markedPending = true;
        return {
          ...event,
          title: eventTitle,
          completed: true,
          timestamp: now,
          note: normalizedOptions.note || event.note,
        };
      }
      return event;
    });

    if (!markedPending) {
      updatedTimeline.push({
        id: crypto.randomUUID(),
        title: eventTitle,
        by: eventBy,
        note: normalizedOptions.note || `${eventTitle} por ${eventBy}.`,
        completed: true,
        timestamp: now,
      });
    }

    const updatedCase: PatientCase = {
      ...patient,
      assessment:
        currentRole === "enfermeria"
          ? {
              ...patient.assessment,
              ...buildAssessmentFromModel(patient.modelInput),
            }
          : patient.assessment,
      workflow: {
        ...patient.workflow,
        status: newStatus,
        nextRole: newRole,
        currentTask: normalizedOptions.currentTask ?? getCaseGuideStep(newRole),
        primaryActionLabel: normalizedOptions.primaryActionLabel ?? getCaseActionLabel(newRole),
        timeline: updatedTimeline,
      },
      metadata: {
        ...patient.metadata,
        updatedAt: now,
      },
    };

    store._replacePatient(id, updatedCase);
    return updatedCase;
  },

  async updateModelInput(id: string, input: UpdateModelInput): Promise<PatientCase> {
    const store = usePatientStore.getState();
    const patient = store.patients.find((p) => p.id === id);

    if (!patient) throw new Error(`Paciente con id "${id}" no encontrado.`);

    const updatedCase: PatientCase = {
      ...patient,
      modelInput: {
        ...patient.modelInput,
        ...input,
      },
      metadata: {
        ...patient.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    store._replacePatient(id, updatedCase);
    return updatedCase;
  },

  async updateAssessment(id: string, input: UpdateAssessmentInput): Promise<PatientCase> {
    const store = usePatientStore.getState();
    const patient = store.patients.find((p) => p.id === id);

    if (!patient) throw new Error(`Paciente con id "${id}" no encontrado.`);

    const updatedCase: PatientCase = {
      ...patient,
      assessment: {
        ...patient.assessment,
        ...input,
      },
      metadata: {
        ...patient.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    store._replacePatient(id, updatedCase);
    return updatedCase;
  },

  getCardiologyTransition,
  getMedicalDispositionTransition,
};

function buildRecordNumber() {
  return `PAC-${Math.floor(100 + Math.random() * 900)}`;
}

function getStatusesForRole(role: RoleKey) {
  const statusByRole: Record<RoleKey, readonly CaseStatus[]> = {
    enfermeria: ["Pendiente de triaje"],
    medico: ["Listo para evaluación"],
    cardiologia: ["Derivado a cardiología"],
    coordinacion: ["Cerrado"],
  };

  return statusByRole[role];
}

function yieldToBrowser() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
      return;
    }

    setTimeout(resolve, 0);
  });
}
