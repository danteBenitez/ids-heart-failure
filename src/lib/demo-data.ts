export type CaseStatus =
  | "Pendiente de triaje"
  | "Listo para evaluación"
  | "Derivado a cardiología"
  | "Cerrado";

export type RoleKey = "enfermeria" | "medico" | "cardiologia" | "coordinacion";

export type CaseEvent = {
  title: string;
  by: string;
  note: string;
  completed: boolean;
};

export type PatientCase = {
  id: string;
  patient: string;
  age: number;
  sex: "F" | "M";
  status: CaseStatus;
  risk: "Bajo" | "Medio" | "Alto";
  nextRole: RoleKey;
  location: string;
  summary: string;
  guideStep: string;
  actionLabel: string;
  vitals: {
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
  insights: string[];
  events: CaseEvent[];
};

export type Palette = {
  id: string;
  name: string;
  className: string;
  accent: string;
};

export const palettes: Palette[] = [
  {
    id: "sand",
    name: "Arena clínica",
    className: "theme-sand",
    accent: "Cálida y sobria",
  },
  {
    id: "mint",
    name: "Menta hospitalaria",
    className: "theme-mint",
    accent: "Más tecnológica",
  },
  {
    id: "sunset",
    name: "Coral de guardia",
    className: "theme-sunset",
    accent: "Más expresiva",
  },
];

export const patientCases: PatientCase[] = [
  {
    id: "PAC-104",
    patient: "María Sosa",
    age: 57,
    sex: "F",
    status: "Pendiente de triaje",
    risk: "Medio",
    nextRole: "enfermeria",
    location: "Centro Norte",
    summary: "Paciente con fatiga y dolor no anginal. Falta completar mediciones.",
    guideStep: "Registrar mediciones iniciales y confirmar el ingreso del caso.",
    actionLabel: "Completar triaje",
    vitals: {
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
    insights: [
      "Aún no hay score definitivo porque el caso no terminó la etapa de enfermería.",
      "La app puede usar validaciones para detectar campos faltantes o inconsistentes.",
    ],
    events: [
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
  {
    id: "PAC-271",
    patient: "Jorge Ferreyra",
    age: 63,
    sex: "M",
    status: "Listo para evaluación",
    risk: "Alto",
    nextRole: "medico",
    location: "Policlínico Oeste",
    summary: "Caso preparado para consulta médica con factores de riesgo combinados.",
    guideStep: "Calcular el riesgo y decidir si corresponde seguimiento o derivación.",
    actionLabel: "Evaluar con el modelo",
    vitals: {
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
    insights: [
      "La combinación de dolor asintomático, glucemia alta y baja tolerancia al ejercicio eleva el riesgo.",
      "Este caso es ideal para mostrar cómo la guía resalta el CTA clínico principal.",
    ],
    events: [
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
  {
    id: "PAC-318",
    patient: "Elena Acosta",
    age: 68,
    sex: "F",
    status: "Derivado a cardiología",
    risk: "Alto",
    nextRole: "cardiologia",
    location: "Clínica Sur",
    summary: "Paciente ya priorizada y esperando confirmación del especialista.",
    guideStep: "Revisar el score, confirmar la conducta y registrar la resolución clínica.",
    actionLabel: "Registrar resolución",
    vitals: {
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
    insights: [
      "El score ya fue calculado y la derivación quedó justificada con trazabilidad.",
      "La vista de cardiología debe recibir el contexto resumido, no repetir toda la carga manual.",
    ],
    events: [
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
  {
    id: "PAC-402",
    patient: "Ricardo Vega",
    age: 52,
    sex: "M",
    status: "Cerrado",
    risk: "Bajo",
    nextRole: "coordinacion",
    location: "Hospital Central",
    summary: "Caso cerrado con seguimiento preventivo y sin derivación.",
    guideStep: "Inspeccionar el historial completo y cómo se cerró el caso.",
    actionLabel: "Ver cierre",
    vitals: {
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
    insights: [
      "Sirve para mostrar que la app no solo deriva, también documenta casos de bajo riesgo.",
      "El tablero administrativo puede usar este cierre para métricas de eficiencia y seguimiento.",
    ],
    events: [
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

export function getPalette(id?: string) {
  return palettes.find((palette) => palette.id === id) ?? palettes[0];
}
