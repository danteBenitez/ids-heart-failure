export const fieldLabels = {
  sex: "Sexo",
  chestPainType: "Tipo de dolor de pecho",
  restingBP: "Presión en reposo (mm Hg)",
  cholesterol: "Colesterol (mg/dl)",
  fastingBS: "Glucemia en ayunas",
  maxHR: "Frecuencia cardíaca máxima",
  exerciseAngina: "Angina por ejercicio",
  oldpeak: "Oldpeak",
  restingECG: "Electrocardiograma en reposo",
  stSlope: "Pendiente del segmento ST",
} as const;

export const fieldValueLabels = {
  sex: {
    F: "Femenino",
    M: "Masculino",
  },
  chestPainType: {
    TA: "Angina típica",
    ATA: "Angina atípica",
    NAP: "Dolor no anginal",
    ASY: "Asintomático",
  },
  fastingBS: {
    0: "Menor o igual a 120 mg/dl",
    1: "Mayor a 120 mg/dl",
  },
  exerciseAngina: {
    Y: "Sí",
    N: "No",
    "Sí": "Sí",
    "No": "No",
  },
  restingECG: {
    Normal: "Actividad eléctrica normal",
    ST: "Alteración del segmento ST",
    LVH: "Hipertrofia ventricular izquierda",
  },
  stSlope: {
    Flat: "Plano",
    Up: "Pendiente positiva",
    Down: "Pendiente negativa",
  },
} as const;

export function getFieldLabel(field: string) {
  return fieldLabels[field as keyof typeof fieldLabels] ?? field;
}

export function getFieldValueLabel(field: string, value: string | number) {
  const valueMap = fieldValueLabels[field as keyof typeof fieldValueLabels] as
    | Record<string, string>
    | undefined;

  return valueMap?.[String(value)] ?? String(value);
}
