import { usePatientStore } from "@/stores/patient-store";
import type {
  CreatePatientInput,
  PatientCase,
  RoleKey,
  UpdateModelInput,
} from "@/lib/types";
import {
  getCaseActionLabel,
  getCaseGuideStep,
  getNextRole,
  getNextStatus,
  getTransitionEventTitle,
  roleLabels,
} from "@/lib/case-helpers";

export const patientService = {
  async getAll(): Promise<PatientCase[]> {
    return usePatientStore.getState().patients;
  },

  async getById(id: string): Promise<PatientCase | null> {
    return usePatientStore.getState().patients.find((p) => p.id === id) ?? null;
  },

  async getByRole(role: RoleKey): Promise<PatientCase[]> {
    const targetStatus = getStatusForRole(role);
    return usePatientStore
      .getState()
      .patients.filter(
        (p) => p.workflow.nextRole === role || p.workflow.status === targetStatus,
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
        insights: input.assessment?.insights ?? [],
      },
      metadata: {
        createdAt: now,
        updatedAt: now,
      },
    };

    usePatientStore.getState()._addPatient(patient);
    return patient;
  },

  async advanceStatus(id: string, note?: string): Promise<PatientCase> {
    const store = usePatientStore.getState();
    const patient = store.patients.find((p) => p.id === id);

    if (!patient) throw new Error(`Paciente con id "${id}" no encontrado.`);
    if (patient.workflow.status === "Cerrado") {
      throw new Error(`El caso "${patient.patient.fullName}" ya está cerrado.`);
    }

    const now = new Date().toISOString();
    const currentRole = patient.workflow.nextRole;
    const newStatus = getNextStatus(patient.workflow.status);
    const newRole = getNextRole(currentRole);
    const eventTitle = getTransitionEventTitle(currentRole);
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
          note: note || event.note,
        };
      }
      return event;
    });

    if (!markedPending) {
      updatedTimeline.push({
        id: crypto.randomUUID(),
        title: eventTitle,
        by: eventBy,
        note: note || `${eventTitle} por ${eventBy}.`,
        completed: true,
        timestamp: now,
      });
    }

    const updatedCase: PatientCase = {
      ...patient,
      workflow: {
        ...patient.workflow,
        status: newStatus,
        nextRole: newRole,
        currentTask: getCaseGuideStep(newRole),
        primaryActionLabel: getCaseActionLabel(newRole),
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
};

function buildRecordNumber() {
  return `PAC-${Math.floor(100 + Math.random() * 900)}`;
}

function getStatusForRole(role: RoleKey) {
  const statusByRole = {
    enfermeria: "Pendiente de triaje",
    medico: "Listo para evaluación",
    cardiologia: "Derivado a cardiología",
    coordinacion: "Cerrado",
  } as const;

  return statusByRole[role];
}
