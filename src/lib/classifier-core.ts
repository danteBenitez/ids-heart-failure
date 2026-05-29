import type { CaseAssessment, ModelFeaturePayload, RiskLevel } from "@/lib/types";

export type ClassifierModel = {
  feature_names: readonly string[];
  weights: readonly number[];
  intercept: readonly number[];
  scaler: {
    means: readonly number[];
    variances: readonly number[];
  };
  metrics: {
    accuracy: number;
    recall: number;
    f1_score: number;
    precision: number;
  };
  confusion_matrix: readonly (readonly number[])[];
};

export type FeatureContribution = {
  feature: string;
  label: string;
  rawValue: number;
  scaledValue: number;
  weight: number;
  contribution: number;
};

export type ModelOutput = {
  label: 0 | 1;
  probability: number;
  logit: number;
  rawVector: number[];
  scaledVector: number[];
  contributions: FeatureContribution[];
};

export type AssessmentFromModel = Pick<
  CaseAssessment,
  "riskLevel" | "riskProbability" | "clinicalSummary" | "topFactors"
>;

const FEATURE_DESCRIPTIONS: Record<string, (features: ModelFeaturePayload) => string> = {
  Age: (features) => `Edad: ${features.age} años`,
  RestingBP: (features) => `Presión en reposo: ${features.restingBP} mm Hg`,
  Cholesterol: (features) => `Colesterol sérico: ${features.cholesterol} mg/dl`,
  FastingBS: (features) =>
    features.fastingBS === 1
      ? "Glucemia en ayunas > 120 mg/dl"
      : "Glucemia en ayunas <= 120 mg/dl",
  MaxHR: (features) => `Frecuencia cardíaca máxima: ${features.maxHR} lpm`,
  Oldpeak: (features) => `Depresión del segmento ST: ${features.oldpeak.toFixed(1)}`,
  Sex_M: () => "Sexo masculino",
  ChestPainType_ATA: () => "Dolor de pecho atípico",
  ChestPainType_NAP: () => "Dolor de pecho no anginal",
  ChestPainType_TA: () => "Dolor de pecho típico",
  RestingECG_Normal: () => "ECG en reposo normal",
  RestingECG_ST: () => "ECG en reposo con alteraciones ST",
  ExerciseAngina_Y: () => "Angina inducida por ejercicio",
  ST_Slope_Flat: () => "Pendiente ST plana",
  ST_Slope_Up: () => "Pendiente ST ascendente",
};

const ONE_HOT_FEATURES = new Set([
  "Sex_M",
  "ChestPainType_ATA",
  "ChestPainType_NAP",
  "ChestPainType_TA",
  "RestingECG_Normal",
  "RestingECG_ST",
  "ExerciseAngina_Y",
  "ST_Slope_Flat",
  "ST_Slope_Up",
]);

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

export function validateModelShape(model: ClassifierModel) {
  const expectedLength = model.feature_names.length;
  if (
    model.weights.length !== expectedLength ||
    model.scaler.means.length !== expectedLength ||
    model.scaler.variances.length !== expectedLength
  ) {
    throw new Error("El shape del modelo no coincide entre feature_names, weights y scaler.");
  }
}

export function toFeatureValue(featureName: string, features: ModelFeaturePayload): number {
  switch (featureName) {
    case "Age":
      return features.age;
    case "RestingBP":
      return features.restingBP;
    case "Cholesterol":
      return features.cholesterol;
    case "FastingBS":
      return features.fastingBS;
    case "MaxHR":
      return features.maxHR;
    case "Oldpeak":
      return features.oldpeak;
    case "Sex_M":
      return features.sex === "M" ? 1 : 0;
    case "ChestPainType_ATA":
      return features.chestPainType === "ATA" ? 1 : 0;
    case "ChestPainType_NAP":
      return features.chestPainType === "NAP" ? 1 : 0;
    case "ChestPainType_TA":
      return features.chestPainType === "TA" ? 1 : 0;
    case "RestingECG_Normal":
      return features.restingECG === "Normal" ? 1 : 0;
    case "RestingECG_ST":
      return features.restingECG === "ST" ? 1 : 0;
    case "ExerciseAngina_Y":
      return features.exerciseAngina === "Sí" ? 1 : 0;
    case "ST_Slope_Flat":
      return features.stSlope === "Flat" ? 1 : 0;
    case "ST_Slope_Up":
      return features.stSlope === "Up" ? 1 : 0;
    default:
      throw new Error(`Feature desconocida en el modelo: ${featureName}`);
  }
}

export function buildRawVector(model: ClassifierModel, features: ModelFeaturePayload) {
  validateModelShape(model);
  return model.feature_names.map((featureName) => toFeatureValue(featureName, features));
}

export function buildScaledVector(model: ClassifierModel, rawVector: readonly number[]) {
  return rawVector.map((value, index) => {
    const mean = model.scaler.means[index];
    const variance = model.scaler.variances[index];
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return 0;
    }

    return (value - mean) / stdDev;
  });
}

export function toRiskLevel(probability: number): RiskLevel {
  if (probability >= 0.7) return "Alto";
  if (probability >= 0.4) return "Medio";
  return "Bajo";
}

export function buildSummary(probability: number, riskLevel: RiskLevel) {
  const percentage = Math.round(probability * 100);

  if (riskLevel === "Alto") {
    return `Probabilidad estimada alta (${percentage}%) de enfermedad cardíaca.`;
  }

  if (riskLevel === "Medio") {
    return `Probabilidad estimada intermedia (${percentage}%) de enfermedad cardíaca.`;
  }

  return `Probabilidad estimada baja (${percentage}%) de enfermedad cardíaca.`;
}

export function buildTopFactors(
  features: ModelFeaturePayload,
  contributions: readonly FeatureContribution[],
) {
  const topPositive = [...contributions]
    .filter((entry) => !ONE_HOT_FEATURES.has(entry.feature) || entry.rawValue === 1)
    .filter((entry) => entry.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 4);

  const selected =
    topPositive.length > 0
      ? topPositive
      : [...contributions]
          .filter((entry) => !ONE_HOT_FEATURES.has(entry.feature) || entry.rawValue === 1)
          .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
          .slice(0, 4);

  return selected.map((entry) => {
    const describe = FEATURE_DESCRIPTIONS[entry.feature];
    return describe ? describe(features) : entry.label;
  });
}

export function classifyWithModel(
  model: ClassifierModel,
  features: ModelFeaturePayload,
): ModelOutput {
  const rawVector = buildRawVector(model, features);
  const scaledVector = buildScaledVector(model, rawVector);
  const contributions = model.feature_names.map((feature, index) => ({
    feature,
    label: feature,
    rawValue: rawVector[index],
    scaledValue: scaledVector[index],
    weight: model.weights[index],
    contribution: model.weights[index] * scaledVector[index],
  }));

  const logit =
    model.intercept[0] +
    contributions.reduce((accumulator, entry) => accumulator + entry.contribution, 0);

  const probability = sigmoid(logit);

  return {
    label: probability >= 0.5 ? 1 : 0,
    probability,
    logit,
    rawVector,
    scaledVector,
    contributions,
  };
}

export function buildAssessmentFromModelWithModel(
  model: ClassifierModel,
  features: ModelFeaturePayload,
): AssessmentFromModel {
  const result = classifyWithModel(model, features);
  const riskLevel = toRiskLevel(result.probability);

  return {
    riskLevel,
    riskProbability: result.probability,
    clinicalSummary: buildSummary(result.probability, riskLevel),
    topFactors: buildTopFactors(features, result.contributions),
  };
}
