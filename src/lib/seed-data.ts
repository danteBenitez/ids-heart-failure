import type { PatientCase } from "./types";

// ---------------------------------------------------------------------------
// Datos semilla – CardioFlow
// Estos registros se cargan en localStorage cuando no existe data previa.
// Representan los 4 estados del flujo clínico para la demo.
// ---------------------------------------------------------------------------

/**
 * Semilla con 4 pacientes que cubren cada etapa del flujo:
 *
 * 1. María Sosa      → Pendiente de triaje       (solo enfermería)
 * 2. Jorge Ferreyra  → Listo para evaluación      (enfermería completó)
 * 3. Elena Acosta    → Derivado a cardiología     (enfermería + médico completaron)
 * 4. Ricardo Vega    → Cerrado                    (ciclo completo)
 */
export const seedPatients: PatientCase[] = [
  // ── 1. Pendiente de triaje ───────────────────────────────────────────
  {
    id: "d4a5f7e2-1b3c-4d8e-9f0a-2b4c6d8e0f1a",
    patient: "María Sosa",
    age: 57,
    sex: "F",
    status: "Pendiente de triaje",
    risk: "Medio",
    nextRole: "enfermeria",
    location: "Centro Norte",
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
        id: "evt-001",
        title: "Caso creado",
        by: "Recepción",
        note: "Se abrió un caso preventivo por controles regulares.",
        completed: true,
        timestamp: "2026-05-27T09:15:00.000Z",
      },
      {
        id: "evt-002",
        title: "Carga de triaje",
        by: "Enfermería",
        note: "Faltan completar mediciones y confirmar el set de datos.",
        completed: false,
        timestamp: "2026-05-27T09:15:00.000Z",
      },
      {
        id: "evt-003",
        title: "Evaluación médica",
        by: "Médico general",
        note: "Bloqueada hasta confirmar el triaje.",
        completed: false,
        timestamp: "2026-05-27T09:15:00.000Z",
      },
    ],
    createdAt: "2026-05-27T09:15:00.000Z",
    updatedAt: "2026-05-27T09:15:00.000Z",
  },

  // ── 2. Listo para evaluación ─────────────────────────────────────────
  {
    id: "b7c8d9e0-f1a2-4b3c-8d5e-6f7a8b9c0d1e",
    patient: "Jorge Ferreyra",
    age: 63,
    sex: "M",
    status: "Listo para evaluación",
    risk: "Alto",
    nextRole: "medico",
    location: "Policlínico Oeste",
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
        id: "evt-004",
        title: "Datos iniciales confirmados",
        by: "Enfermería",
        note: "Todas las mediciones necesarias quedaron registradas.",
        completed: true,
        timestamp: "2026-05-22T11:30:00.000Z",
      },
      {
        id: "evt-005",
        title: "Pendiente de score",
        by: "Médico general",
        note: "La app espera la evaluación apoyada por el modelo.",
        completed: false,
        timestamp: "2026-05-23T08:45:00.000Z",
      },
      {
        id: "evt-006",
        title: "Derivación",
        by: "Cardiología",
        note: "Todavía no iniciada.",
        completed: false,
        timestamp: "2026-05-23T08:45:00.000Z",
      },
    ],
    createdAt: "2026-05-22T10:00:00.000Z",
    updatedAt: "2026-05-23T08:45:00.000Z",
  },

  // ── 3. Derivado a cardiología ────────────────────────────────────────
  {
    id: "e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b",
    patient: "Elena Acosta",
    age: 68,
    sex: "F",
    status: "Derivado a cardiología",
    risk: "Alto",
    nextRole: "cardiologia",
    location: "Clínica Sur",
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
        id: "evt-007",
        title: "Triaje completado",
        by: "Enfermería",
        note: "Registro inicial validado.",
        completed: true,
        timestamp: "2026-05-15T14:20:00.000Z",
      },
      {
        id: "evt-008",
        title: "Riesgo alto detectado",
        by: "Médico general",
        note: "Se deriva a cardiología con score y explicación.",
        completed: true,
        timestamp: "2026-05-20T10:00:00.000Z",
      },
      {
        id: "evt-009",
        title: "Consulta especializada",
        by: "Cardiología",
        note: "Pendiente de resolución.",
        completed: false,
        timestamp: "2026-05-20T10:00:00.000Z",
      },
    ],
    createdAt: "2026-05-15T08:30:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
  },

  // ── 4. Cerrado (ciclo completo) ──────────────────────────────────────
  {
    id: "f8e7d6c5-b4a3-4291-8f0e-d1c2b3a4f5e6",
    patient: "Ricardo Vega",
    age: 52,
    sex: "M",
    status: "Cerrado",
    risk: "Bajo",
    nextRole: "coordinacion",
    location: "Hospital Central",
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
        id: "evt-010",
        title: "Triaje completado",
        by: "Enfermería",
        note: "Ingreso sin anomalías.",
        completed: true,
        timestamp: "2026-05-10T09:00:00.000Z",
      },
      {
        id: "evt-011",
        title: "Evaluación médica",
        by: "Médico general",
        note: "Riesgo bajo, se indica control en 90 días.",
        completed: true,
        timestamp: "2026-05-13T15:30:00.000Z",
      },
      {
        id: "evt-012",
        title: "Caso cerrado",
        by: "Coordinación clínica",
        note: "Se registró el plan preventivo.",
        completed: true,
        timestamp: "2026-05-18T11:00:00.000Z",
      },
    ],
    createdAt: "2026-05-10T08:00:00.000Z",
    updatedAt: "2026-05-18T11:00:00.000Z",
  },
];
