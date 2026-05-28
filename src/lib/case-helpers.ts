import type { CaseStatus, RoleKey } from "./types";

const caseSummaries: Record<CaseStatus, string> = {
  "Pendiente de triaje":
    "Paciente con ingreso pendiente de validación por enfermería.",
  "Listo para evaluación":
    "Caso preparado para evaluación médica con factores de riesgo registrados.",
  "Derivado a cardiología":
    "Paciente derivado y esperando resolución del especialista.",
  Cerrado: "Caso cerrado con resolución clínica registrada.",
};

/** Resumen del caso derivado de su estado actual. */
export function getCaseSummary(status: CaseStatus): string {
  return caseSummaries[status];
}

const guideSteps: Record<RoleKey, string> = {
  enfermeria: "Registrar mediciones iniciales y confirmar el ingreso del caso.",
  medico:
    "Calcular el riesgo y decidir si corresponde seguimiento o derivación.",
  cardiologia:
    "Revisar el score, confirmar la conducta y registrar la resolución clínica.",
  coordinacion: "Inspeccionar el historial completo y cómo se cerró el caso.",
};

/** Instrucción de guía para el rol que tiene la acción pendiente. */
export function getCaseGuideStep(nextRole: RoleKey): string {
  return guideSteps[nextRole];
}

const actionLabels: Record<RoleKey, string> = {
  enfermeria: "Completar triaje",
  medico: "Evaluar con el modelo",
  cardiologia: "Registrar resolución",
  coordinacion: "Ver cierre",
};

/** Label del botón de acción principal para el rol actual. */
export function getCaseActionLabel(nextRole: RoleKey): string {
  return actionLabels[nextRole];
}

/** Nombre legible de cada rol para mostrar en la UI. */
export const roleLabels: Record<RoleKey, string> = {
  enfermeria: "Enfermería / triaje",
  medico: "Médico general",
  cardiologia: "Cardiología",
  coordinacion: "Coordinación clínica",
};

/** Ruta base del dashboard de cada rol. */
export const roleBasePath: Record<RoleKey, string> = {
  enfermeria: "/dashboard/nursing",
  medico: "/dashboard/clinical",
  cardiologia: "/dashboard/cardiology",
  coordinacion: "/dashboard",
};

/** Copy de los botones de acción en la vista de detalle, por rol. */
export const roleActionCopy: Record<
  RoleKey,
  { primaryAction: string; secondaryAction: string }
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

// ── Transiciones de estado ─────────────────────────────────────────────

const statusTransitions: Record<CaseStatus, CaseStatus> = {
  "Pendiente de triaje": "Listo para evaluación",
  "Listo para evaluación": "Derivado a cardiología",
  "Derivado a cardiología": "Cerrado",
  Cerrado: "Cerrado", // estado terminal
};

/**
 * Dado el estado actual de un caso, retorna el siguiente estado en el flujo.
 * Si el caso ya está cerrado, retorna "Cerrado" (idempotente).
 */
export function getNextStatus(current: CaseStatus): CaseStatus {
  return statusTransitions[current];
}

/**
 * Dado el rol que tiene la acción pendiente, retorna el rol que sigue
 */
const roleTransitions: Record<RoleKey, RoleKey> = {
  enfermeria: "medico",
  medico: "cardiologia",
  cardiologia: "coordinacion",
  coordinacion: "coordinacion", // estado terminal
};

/**
 * Dado el rol que tiene la acción pendiente, retorna el rol que sigue
 * en el flujo después de completar la acción.
 */
export function getNextRole(current: RoleKey): RoleKey {
  return roleTransitions[current];
}

// ── Etiquetas para eventos generados por transiciones ──────────────────

const transitionEventTitles: Record<RoleKey, string> = {
  enfermeria: "Triaje completado",
  medico: "Evaluación médica registrada",
  cardiologia: "Resolución cardiológica registrada",
  coordinacion: "Caso revisado por coordinación",
};

/**
 * Título del evento que se genera cuando un rol completa su acción.
 * Usado por el servicio al avanzar el estado del caso.
 */
export function getTransitionEventTitle(role: RoleKey): string {
  return transitionEventTitles[role];
}
