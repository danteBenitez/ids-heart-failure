import type { CaseStatus, RoleKey } from "./types";

export function getCaseSummary(status: CaseStatus): string {
  const caseSummaries: Record<CaseStatus, string> = {
    "Pendiente de triaje":
      "Paciente con ingreso pendiente de validación por enfermería.",
    "Listo para evaluación":
      "Caso preparado para evaluación médica con factores de riesgo registrados.",
    "Derivado a cardiología":
      "Paciente derivado y esperando resolución del especialista.",
    Cerrado: "Caso cerrado con resolución clínica registrada.",
  };

  return caseSummaries[status];
}

export function getCaseGuideStep(nextRole: RoleKey): string {
  const guideSteps: Record<RoleKey, string> = {
    enfermeria: "Registrar mediciones iniciales y confirmar el ingreso del caso.",
    medico: "Calcular el riesgo y decidir si corresponde derivación o cierre clínico.",
    cardiologia: "Revisar el score y registrar la resolución clínica final.",
    coordinacion: "Inspeccionar el historial completo y cómo se cerró el caso.",
  };

  return guideSteps[nextRole];
}

export function getCaseActionLabel(nextRole: RoleKey): string {
  const actionLabels: Record<RoleKey, string> = {
    enfermeria: "Completar triaje",
    medico: "Registrar conducta",
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
  { primaryAction: string }
> = {
  enfermeria: {
    primaryAction: "Confirmar triaje",
  },
  medico: {
    primaryAction: "Registrar evaluación",
  },
  cardiologia: {
    primaryAction: "Registrar resolución",
  },
  coordinacion: {
    primaryAction: "Ver cierre",
  },
};

export function getNextStatus(current: CaseStatus): CaseStatus {
  const statusTransitions: Record<CaseStatus, CaseStatus> = {
    "Pendiente de triaje": "Listo para evaluación",
    "Listo para evaluación": "Derivado a cardiología",
    "Derivado a cardiología": "Cerrado",
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

export function getCardiologyTransition() {
  return {
    status: "Cerrado" as const,
    nextRole: "coordinacion" as const,
    currentTask: "Inspeccionar el historial completo y cómo se cerró el caso.",
    primaryActionLabel: "Ver cierre",
    eventTitle: "Resolución cardiológica registrada",
  };
}

export function getMedicalDispositionTransition(
  disposition: "Derivar a cardiología" | "Cerrar con control",
) {
  if (disposition === "Cerrar con control") {
    return {
      status: "Cerrado" as const,
      nextRole: "coordinacion" as const,
      currentTask: "Inspeccionar el historial completo y cómo se cerró el caso.",
      primaryActionLabel: "Ver cierre",
      eventTitle: "Caso cerrado con control clínico",
    };
  }

  return {
    status: "Derivado a cardiología" as const,
    nextRole: "cardiologia" as const,
    currentTask: "Revisar el score, confirmar la conducta y registrar la resolución clínica.",
    primaryActionLabel: "Registrar resolución",
    eventTitle: "Derivación a cardiología indicada",
  };
}
