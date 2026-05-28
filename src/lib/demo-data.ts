export type CaseStatus =
  | "Pendiente de triaje"
  | "Listo para evaluación"
  | "Derivado a cardiología"
  | "Cerrado";

export type RiskLevel = "Bajo" | "Medio" | "Alto";

export type RoleKey = "enfermeria" | "medico" | "cardiologia" | "coordinacion";

export type CaseEvent = {
  title: string;
  by: string;
  note: string;
  completed: boolean;
};

export type PatientIdentity = {
  recordNumber: string;
  fullName: string;
  location: string;
};

export type ModelFeaturePayload = {
  age: number;
  sex: "F" | "M";
  chestPainType: "TA" | "ATA" | "NAP" | "ASY";
  restingBP: number;
  cholesterol: number;
  fastingBS: 0 | 1;
  maxHR: number;
  exerciseAngina: "Sí" | "No";
  oldpeak: number;
  restingECG: "Normal" | "ST" | "LVH";
  stSlope: "Up" | "Flat" | "Down";
};

export type CaseWorkflow = {
  status: CaseStatus;
  nextRole: RoleKey;
  currentTask: string;
  primaryActionLabel: string;
  timeline: CaseEvent[];
};

export type CaseAssessment = {
  riskLevel: RiskLevel;
  riskProbability: number;
  clinicalSummary: string;
  insights: string[];
};

export type PatientCase = {
  id: string;
  patient: PatientIdentity;
  modelInput: ModelFeaturePayload;
  workflow: CaseWorkflow;
  assessment: CaseAssessment;
};

export const patientCases: PatientCase[] = [
  {
    id: "PAC-104",
    patient: {
      recordNumber: "PAC-104",
      fullName: "María Sosa",
      location: "Centro Norte",
    },
    modelInput: {
      age: 57,
      sex: "F",
      chestPainType: "NAP",
      restingBP: 132,
      cholesterol: 226,
      fastingBS: 0,
      maxHR: 148,
      exerciseAngina: "No",
      oldpeak: 0.4,
      restingECG: "Normal",
      stSlope: "Up",
    },
    workflow: {
      status: "Pendiente de triaje",
      nextRole: "enfermeria",
      currentTask: "Registrar mediciones iniciales y confirmar el ingreso del caso.",
      primaryActionLabel: "Completar triaje",
      timeline: [
        {
          title: "Caso creado",
          by: "Recepción",
          note: "Se abrió un caso preventivo por controles regulares.",
          completed: true,
        },
        {
          title: "Carga de triaje",
          by: "Enfermería",
          note: "Faltan completar mediciones y confirmar el set de datos.",
          completed: false,
        },
        {
          title: "Evaluación médica",
          by: "Médico general",
          note: "Bloqueada hasta confirmar el triaje.",
          completed: false,
        },
      ],
    },
    assessment: {
      riskLevel: "Medio",
      riskProbability: 0.42,
      clinicalSummary: "Paciente con fatiga y dolor no anginal. Falta completar mediciones.",
      insights: [
        "Aún no hay score definitivo porque el caso no terminó la etapa de enfermería.",
        "La app puede usar validaciones para detectar campos faltantes o inconsistentes.",
      ],
    },
  },
  {
    id: "PAC-271",
    patient: {
      recordNumber: "PAC-271",
      fullName: "Jorge Ferreyra",
      location: "Policlínico Oeste",
    },
    modelInput: {
      age: 63,
      sex: "M",
      chestPainType: "ASY",
      restingBP: 145,
      cholesterol: 289,
      fastingBS: 1,
      maxHR: 118,
      exerciseAngina: "Sí",
      oldpeak: 1.8,
      restingECG: "ST",
      stSlope: "Flat",
    },
    workflow: {
      status: "Listo para evaluación",
      nextRole: "medico",
      currentTask: "Calcular el riesgo y decidir si corresponde seguimiento o derivación.",
      primaryActionLabel: "Evaluar con el modelo",
      timeline: [
        {
          title: "Datos iniciales confirmados",
          by: "Enfermería",
          note: "Todas las mediciones necesarias quedaron registradas.",
          completed: true,
        },
        {
          title: "Pendiente de score",
          by: "Médico general",
          note: "La app espera la evaluación apoyada por el modelo.",
          completed: false,
        },
        {
          title: "Derivación",
          by: "Cardiología",
          note: "Todavía no iniciada.",
          completed: false,
        },
      ],
    },
    assessment: {
      riskLevel: "Alto",
      riskProbability: 0.86,
      clinicalSummary:
        "Caso preparado para consulta médica con factores de riesgo combinados.",
      insights: [
        "La combinación de dolor asintomático, glucemia alta y baja tolerancia al ejercicio eleva el riesgo.",
        "La evaluación médica decide si el caso requiere derivación especializada.",
      ],
    },
  },
  {
    id: "PAC-318",
    patient: {
      recordNumber: "PAC-318",
      fullName: "Elena Acosta",
      location: "Clínica Sur",
    },
    modelInput: {
      age: 68,
      sex: "F",
      chestPainType: "ATA",
      restingBP: 138,
      cholesterol: 241,
      fastingBS: 1,
      maxHR: 126,
      exerciseAngina: "Sí",
      oldpeak: 2.1,
      restingECG: "LVH",
      stSlope: "Flat",
    },
    workflow: {
      status: "Derivado a cardiología",
      nextRole: "cardiologia",
      currentTask: "Revisar el score, confirmar la conducta y registrar la resolución clínica.",
      primaryActionLabel: "Registrar resolución",
      timeline: [
        {
          title: "Triaje completado",
          by: "Enfermería",
          note: "Registro inicial validado.",
          completed: true,
        },
        {
          title: "Riesgo alto detectado",
          by: "Médico general",
          note: "Se deriva a cardiología con score y explicación.",
          completed: true,
        },
        {
          title: "Consulta especializada",
          by: "Cardiología",
          note: "Pendiente de resolución.",
          completed: false,
        },
      ],
    },
    assessment: {
      riskLevel: "Alto",
      riskProbability: 0.79,
      clinicalSummary:
        "Paciente ya priorizada y esperando confirmación del especialista.",
      insights: [
        "El score ya fue calculado y la derivación quedó justificada con trazabilidad.",
        "La vista de cardiología debe recibir el contexto resumido, no repetir toda la carga manual.",
      ],
    },
  },
  {
    id: "PAC-402",
    patient: {
      recordNumber: "PAC-402",
      fullName: "Ricardo Vega",
      location: "Hospital Central",
    },
    modelInput: {
      age: 52,
      sex: "M",
      chestPainType: "TA",
      restingBP: 124,
      cholesterol: 198,
      fastingBS: 0,
      maxHR: 162,
      exerciseAngina: "No",
      oldpeak: 0.1,
      restingECG: "Normal",
      stSlope: "Up",
    },
    workflow: {
      status: "Cerrado",
      nextRole: "coordinacion",
      currentTask: "Inspeccionar el historial completo y cómo se cerró el caso.",
      primaryActionLabel: "Ver cierre",
      timeline: [
        {
          title: "Triaje completado",
          by: "Enfermería",
          note: "Ingreso sin anomalías.",
          completed: true,
        },
        {
          title: "Evaluación médica",
          by: "Médico general",
          note: "Riesgo bajo, se indica control en 90 días.",
          completed: true,
        },
        {
          title: "Caso cerrado",
          by: "Coordinación clínica",
          note: "Se registró el plan preventivo.",
          completed: true,
        },
      ],
    },
    assessment: {
      riskLevel: "Bajo",
      riskProbability: 0.18,
      clinicalSummary: "Caso cerrado con seguimiento preventivo y sin derivación.",
      insights: [
        "Sirve para mostrar que la app no solo deriva, también documenta casos de bajo riesgo.",
        "El tablero administrativo puede usar este cierre para métricas de eficiencia y seguimiento.",
      ],
    },
  },
];

export const roleLabels: Record<RoleKey, string> = {
  enfermeria: "Enfermería / triaje",
  medico: "Médico general",
  cardiologia: "Cardiología",
  coordinacion: "Coordinación clínica",
};

export function getCaseById(id: string) {
  return patientCases.find((patientCase) => patientCase.id === id);
}
