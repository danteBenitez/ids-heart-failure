export type CaseStatus =
  | "Pendiente de triaje"
  | "Listo para evaluación"
  | "Derivado a cardiología"
  | "Cerrado";

export type RiskLevel = "Bajo" | "Medio" | "Alto";

export type RoleKey = "enfermeria" | "medico" | "cardiologia" | "coordinacion";

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

export type CaseEvent = {
  id: string;
  title: string;
  by: string;
  note: string;
  completed: boolean;
  timestamp: string;
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
  topFactors: string[];
  clinicianDisposition?: "Derivar a cardiología" | "Cerrar con control";
  clinicianNotes?: string;
  hasHeartDisease?: boolean;
  finalDiagnosis?: string;
  specialistNotes?: string;
};

export type CaseMetadata = {
  createdAt: string;
  updatedAt: string;
};

export type PatientCase = {
  id: string;
  patient: PatientIdentity;
  modelInput: ModelFeaturePayload;
  workflow: CaseWorkflow;
  assessment: CaseAssessment;
  metadata: CaseMetadata;
};

export type CreatePatientInput = {
  patient: Omit<PatientIdentity, "recordNumber">;
  modelInput: ModelFeaturePayload;
  assessment?: Partial<Pick<CaseAssessment, "riskLevel" | "clinicalSummary" | "topFactors">>;
};

export type UpdateModelInput = Partial<ModelFeaturePayload>;
export type UpdateAssessmentInput = Partial<CaseAssessment>;
