// ---------------------------------------------------------------------------
// Tipos de dominio – CardioFlow
// Solo datos de negocio. Los campos de UI (summary, guideStep, actionLabel)
// se derivan en case-helpers.ts a partir del status y nextRole.
// ---------------------------------------------------------------------------

/** Estados posibles de un caso clínico dentro del flujo. */
export type CaseStatus =
  | "Pendiente de triaje"
  | "Listo para evaluación"
  | "Derivado a cardiología"
  | "Cerrado";

/** Roles del sistema que participan en el flujo clínico. */
export type RoleKey = "enfermeria" | "medico" | "cardiologia" | "coordinacion";

/** Signos vitales y mediciones clínicas del paciente. */
export type PatientVitals = {
  chestPainType: string;
  restingBP: number;
  cholesterol: number;
  fastingBS: number;
  maxHR: number;
  exerciseAngina: "Sí" | "No";
  oldpeak: number;
  restingECG: string;
  stSlope: string;
};

/** Evento dentro de la línea de tiempo del caso. */
export type CaseEvent = {
  id: string;
  title: string;
  by: string;
  note: string;
  completed: boolean;
  timestamp: string; // ISO 8601
};

/** Caso clínico de un paciente. */
export type PatientCase = {
  id: string; // UUID v4
  patient: string;
  age: number;
  sex: "F" | "M";
  status: CaseStatus;
  risk: "Bajo" | "Medio" | "Alto";
  nextRole: RoleKey;
  location: string;
  vitals: PatientVitals;
  insights: string[];
  events: CaseEvent[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

/**
 * Datos que el formulario de enfermería envía al crear un paciente.
 * El servicio se encarga de asignar id, status, nextRole, events,
 * timestamps e insights.
 */
export type CreatePatientInput = {
  patient: string;
  age: number;
  sex: "F" | "M";
  location: string;
  risk: "Bajo" | "Medio" | "Alto";
  vitals: PatientVitals;
};
