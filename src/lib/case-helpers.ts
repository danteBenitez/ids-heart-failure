import type { CaseStatus, RoleKey } from "./types";

export function getCaseSummary(status: CaseStatus): string {
  const caseSummaries: Record<CaseStatus, string> = {
    "Pendiente de triaje":
      "Paciente con ingreso pendiente de validación por enfermería.",
    "Listo para evaluación":
      "Caso preparado para evaluación médica con factores de riesgo registrados.",
    "Derivado a cardiología":
      "Paciente derivado y esperando resolución del especialista.",
    "Seguimiento clínico":
      "Caso con resolución especializada y seguimiento clínico pendiente.",
    Cerrado: "Caso cerrado con resolución clínica registrada.",
  };

  return caseSummaries[status];
}

export function getCaseGuideStep(nextRole: RoleKey): string {
  const guideSteps: Record<RoleKey, string> = {
    enfermeria: "Registrar mediciones iniciales y confirmar el ingreso del caso.",
    medico:
      "Calcular el riesgo y decidir si corresponde seguimiento o derivación.",
    cardiologia:
      "Revisar el score, confirmar la conducta y registrar la resolución clínica.",
    coordinacion: "Inspeccionar el historial completo y cómo se cerró el caso.",
  };

  return guideSteps[nextRole];
}

export function getCaseActionLabel(nextRole: RoleKey): string {
  const actionLabels: Record<RoleKey, string> = {
    enfermeria: "Completar triaje",
    medico: "Evaluar con el modelo",
    cardiologia: "Registrar resolución",
    coordinacion: "Ver cierre",
  };

  return actionLabels[nextRole];
}

export const roleLabels: Record<RoleKey, string> = {
  enfermeria: "Enfermería / triaje",
  medico: "Médico general",
  cardiologia: "Cardiología",
  coordinacion: "Coordinación clínica",
};

export const roleBasePath: Record<RoleKey, string> = {
  enfermeria: "/dashboard/nursing",
  medico: "/dashboard/clinical",
  cardiologia: "/dashboard/cardiology",
  coordinacion: "/dashboard",
};

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

export function getNextStatus(current: CaseStatus): CaseStatus {
  const statusTransitions: Record<CaseStatus, CaseStatus> = {
    "Pendiente de triaje": "Listo para evaluación",
    "Listo para evaluación": "Derivado a cardiología",
    "Derivado a cardiología": "Cerrado",
    "Seguimiento clínico": "Cerrado",
    Cerrado: "Cerrado",
  };

  return statusTransitions[current];
}

export function getNextRole(current: RoleKey): RoleKey {
  const roleTransitions: Record<RoleKey, RoleKey> = {
    enfermeria: "medico",
    medico: "cardiologia",
    cardiologia: "coordinacion",
    coordinacion: "coordinacion",
  };

  return roleTransitions[current];
}

export function getTransitionEventTitle(role: RoleKey): string {
  const transitionEventTitles: Record<RoleKey, string> = {
    enfermeria: "Triaje completado",
    medico: "Evaluación médica registrada",
    cardiologia: "Resolución cardiológica registrada",
    coordinacion: "Caso revisado por coordinación",
  };

  return transitionEventTitles[role];
}

export function getDispositionTransition(
  disposition: "Cerrar caso" | "Solicitar seguimiento" | "Reevaluar",
) {
  if (disposition === "Solicitar seguimiento") {
    return {
      status: "Seguimiento clínico" as const,
      nextRole: "medico" as const,
      currentTask: "Revisar la resolución cardiológica y definir el plan de seguimiento.",
      primaryActionLabel: "Registrar seguimiento",
      eventTitle: "Seguimiento clínico solicitado",
    };
  }

  if (disposition === "Reevaluar") {
    return {
      status: "Listo para evaluación" as const,
      nextRole: "medico" as const,
      currentTask: "Reevaluar el caso con la devolución de cardiología.",
      primaryActionLabel: "Registrar reevaluación",
      eventTitle: "Caso devuelto para reevaluación clínica",
    };
  }

  return {
    status: "Cerrado" as const,
    nextRole: "coordinacion" as const,
    currentTask: "Inspeccionar el historial completo y cómo se cerró el caso.",
    primaryActionLabel: "Ver cierre",
    eventTitle: "Resolución cardiológica registrada",
  };
}
