import { usePatientStore } from "@/stores/patient-store";
import type {
  CaseStatus,
  CreatePatientInput,
  PatientCase,
  PatientVitals,
  RoleKey,
} from "@/lib/types";
import {
  getNextRole,
  getNextStatus,
  getTransitionEventTitle,
  roleLabels,
} from "@/lib/case-helpers";

// ---------------------------------------------------------------------------
// Servicio de pacientes – Capa de abstracción sobre el almacenamiento
//
// Esta es la ÚNICA interfaz que los componentes deben usar para leer y
// mutar datos de pacientes. Todos los métodos son async (devuelven
// Promise) para simular el comportamiento de una base de datos real.
//
// Cuando se migre a SQLite, se reemplaza la implementación interna de
// estos métodos (localStorage → API/SQLite) sin tocar los componentes.
// ---------------------------------------------------------------------------

export const patientService = {
  // ── Lectura ──────────────────────────────────────────────────────────

  /** Retorna todos los pacientes. */
  async getAll(): Promise<PatientCase[]> {
    return usePatientStore.getState().patients;
  },

  /** Busca un paciente por su ID. Retorna null si no existe. */
  async getById(id: string): Promise<PatientCase | null> {
    const patient = usePatientStore
      .getState()
      .patients.find((p) => p.id === id);
    return patient ?? null;
  },

  /**
   * Retorna los pacientes cuyo nextRole coincida con el rol indicado,
   * o cuyo status corresponda a la etapa de ese rol.
   */
  async getByRole(role: RoleKey): Promise<PatientCase[]> {
    const statusByRole: Record<RoleKey, CaseStatus> = {
      enfermeria: "Pendiente de triaje",
      medico: "Listo para evaluación",
      cardiologia: "Derivado a cardiología",
      coordinacion: "Cerrado",
    };

    const targetStatus = statusByRole[role];

    return usePatientStore
      .getState()
      .patients.filter(
        (p) => p.nextRole === role || p.status === targetStatus,
      );
  },

  /** Retorna todos los pacientes con un status específico. */
  async getByStatus(status: CaseStatus): Promise<PatientCase[]> {
    return usePatientStore
      .getState()
      .patients.filter((p) => p.status === status);
  },

  // ── Escritura ────────────────────────────────────────────────────────

  /**
   * Crea un nuevo paciente a partir de los datos del formulario de
   * enfermería. Genera UUID, timestamps, estado inicial y eventos
   * de timeline automáticamente.
   */
  async create(input: CreatePatientInput): Promise<PatientCase> {
    const now = new Date().toISOString();

    const patient: PatientCase = {
      id: crypto.randomUUID(),
      ...input,
      status: "Pendiente de triaje",
      nextRole: "enfermeria",
      insights: [],
      events: [
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
      createdAt: now,
      updatedAt: now,
    };

    usePatientStore.getState()._addPatient(patient);
    return patient;
  },

  /**
   * Avanza el caso al siguiente estado del flujo clínico.
   *
   * - Marca el primer evento pendiente como completado.
   * - Transiciona `status` y `nextRole` al siguiente paso.
   * - Actualiza `updatedAt`.
   *
   * @param id   ID del paciente
   * @param note Nota opcional del profesional que ejecuta la acción
   * @throws Error si el paciente no existe o el caso ya está cerrado
   */
  async advanceStatus(
    id: string,
    note?: string,
  ): Promise<PatientCase> {
    const store = usePatientStore.getState();
    const patient = store.patients.find((p) => p.id === id);

    if (!patient) {
      throw new Error(`Paciente con id "${id}" no encontrado.`);
    }

    if (patient.status === "Cerrado") {
      throw new Error(
        `El caso "${patient.patient}" ya está cerrado y no puede avanzar.`,
      );
    }

    const now = new Date().toISOString();
    const newStatus = getNextStatus(patient.status);
    const newRole = getNextRole(patient.nextRole);
    const eventTitle = getTransitionEventTitle(patient.nextRole);
    const eventBy = roleLabels[patient.nextRole];

    // Marcar el primer evento pendiente como completado
    let markedPending = false;
    const updatedEvents = patient.events.map((event) => {
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

    // Si no se encontró un evento pendiente, agregar uno nuevo
    if (!markedPending) {
      updatedEvents.push({
        id: crypto.randomUUID(),
        title: eventTitle,
        by: eventBy,
        note: note || `${eventTitle} por ${eventBy}.`,
        completed: true,
        timestamp: now,
      });
    }

    const updatedData: Partial<PatientCase> = {
      status: newStatus,
      nextRole: newRole,
      events: updatedEvents,
      updatedAt: now,
    };

    store._updatePatient(id, updatedData);

    return { ...patient, ...updatedData };
  },

  /**
   * Actualiza parcialmente los signos vitales de un paciente.
   *
   * @param id     ID del paciente
   * @param vitals Campos de vitales a actualizar (merge parcial)
   * @throws Error si el paciente no existe
   */
  async updateVitals(
    id: string,
    vitals: Partial<PatientVitals>,
  ): Promise<PatientCase> {
    const store = usePatientStore.getState();
    const patient = store.patients.find((p) => p.id === id);

    if (!patient) {
      throw new Error(`Paciente con id "${id}" no encontrado.`);
    }

    const updatedData: Partial<PatientCase> = {
      vitals: { ...patient.vitals, ...vitals },
      updatedAt: new Date().toISOString(),
    };

    store._updatePatient(id, updatedData);

    return { ...patient, ...updatedData };
  },
};
