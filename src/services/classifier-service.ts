import modelJson from "../../public/model.json";
import type { ModelFeaturePayload, PatientCase } from "@/lib/types";
import {
  buildAssessmentFromModelWithModel,
  classifyWithModel,
  type AssessmentFromModel,
  type ClassifierModel,
  type ModelOutput,
} from "@/lib/classifier-core";

const model = modelJson as ClassifierModel;

export function classify(features: ModelFeaturePayload): ModelOutput {
  return classifyWithModel(model, features);
}

export function buildAssessmentFromModel(features: ModelFeaturePayload): AssessmentFromModel {
  return buildAssessmentFromModelWithModel(model, features);
}

export function synchronizeCaseAssessment(patientCase: PatientCase): PatientCase {
  if (patientCase.workflow.status === "Pendiente de triaje") {
    return patientCase;
  }

  return {
    ...patientCase,
    assessment: {
      ...patientCase.assessment,
      ...buildAssessmentFromModel(patientCase.modelInput)
    }
  };
}

export const classifierMetadata = {
  metrics: model.metrics,
  confusionMatrix: model.confusion_matrix,
  featureNames: model.feature_names
};
