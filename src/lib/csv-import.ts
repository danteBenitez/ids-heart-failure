import Papa, { type ParseResult } from "papaparse";
import type { CreatePatientInput, ModelFeaturePayload } from "@/lib/types";

type ImportRowCandidate = {
  fullName?: string;
  location?: string;
  modelInput: ModelFeaturePayload;
};

export type CsvImportPreviewRow = {
  rowNumber: number;
  fullName: string;
  location: string;
  candidate?: ImportRowCandidate;
  errors: string[];
};

export type CsvImportPreview = {
  headers: string[];
  rows: CsvImportPreviewRow[];
};

type ParsedCsvRow = Record<string, string>;

const requiredHeaderAliases = {
  age: ["Age", "age"],
  sex: ["Sex", "sex"],
  chestPainType: ["ChestPainType", "chestPainType"],
  restingBP: ["RestingBP", "restingBP"],
  cholesterol: ["Cholesterol", "cholesterol"],
  fastingBS: ["FastingBS", "fastingBS"],
  maxHR: ["MaxHR", "maxHR"],
  exerciseAngina: ["ExerciseAngina", "exerciseAngina"],
  oldpeak: ["Oldpeak", "oldpeak"],
  restingECG: ["RestingECG", "restingECG"],
  stSlope: ["ST_Slope", "stSlope"],
} as const;

const optionalHeaderAliases = {
  fullName: ["fullName", "FullName", "patientName", "PatientName", "name", "Name"],
  location: ["location", "Location", "center", "Center", "site", "Site"],
} as const;

export function parseCsvImportPreview(
  csvSource: File | string,
  defaults: { location?: string; namePrefix?: string } = {},
) {
  return parseRawCsv(csvSource).then(({ headers, rows: parsedRows }) => {
    const rows = parsedRows.map((row, index) =>
      buildPreviewRow({
        row,
        rowNumber: index + 2,
        defaults,
        generatedIndex: index + 1,
        headers,
      }),
    );

    return { headers, rows };
  });
}

export function buildCreateInputsFromPreview(preview: CsvImportPreview) {
  return preview.rows
    .filter((row) => row.errors.length === 0 && row.candidate)
    .map(
      (row): CreatePatientInput => ({
        patient: {
          fullName: row.fullName,
          location: row.location,
        },
        modelInput: row.candidate!.modelInput,
        assessment: {
          clinicalSummary: "Caso importado desde CSV y preparado para evaluación médica.",
        },
      }),
    );
}

function buildPreviewRow({
  row,
  rowNumber,
  defaults,
  generatedIndex,
  headers,
}: {
  row: ParsedCsvRow;
  rowNumber: number;
  defaults: { location?: string; namePrefix?: string };
  generatedIndex: number;
  headers: string[];
}) {
  const errors: string[] = [];

  const fullName =
    getOptionalValue(row, optionalHeaderAliases.fullName) ||
    `${defaults.namePrefix?.trim() || "Paciente importado"} ${String(generatedIndex).padStart(2, "0")}`;
  const location =
    getOptionalValue(row, optionalHeaderAliases.location) || defaults.location?.trim() || "";

  if (!location) {
    errors.push("Falta ubicación y no se definió una ubicación por defecto.");
  }

  const age = parseNumber(getRequiredValue(row, headers, "age", errors), "Edad", errors, {
    min: 18,
    max: 120,
  });
  const sex = parseEnum(
    getRequiredValue(row, headers, "sex", errors),
    "Sexo",
    { F: "F", M: "M" } as const,
    errors,
  );
  const chestPainType = parseEnum(
    getRequiredValue(row, headers, "chestPainType", errors),
    "Tipo de dolor de pecho",
    { TA: "TA", ATA: "ATA", NAP: "NAP", ASY: "ASY" } as const,
    errors,
  );
  const restingBP = parseNumber(
    getRequiredValue(row, headers, "restingBP", errors),
    "Presión en reposo",
    errors,
    { min: 70, max: 250 },
  );
  const cholesterol = parseNumber(
    getRequiredValue(row, headers, "cholesterol", errors),
    "Colesterol",
    errors,
    { min: 50, max: 700 },
  );
  const fastingBS = parseEnum(
    getRequiredValue(row, headers, "fastingBS", errors),
    "Glucemia en ayunas",
    { 0: 0, 1: 1 } as const,
    errors,
  );
  const maxHR = parseNumber(
    getRequiredValue(row, headers, "maxHR", errors),
    "Frecuencia máxima",
    errors,
    { min: 60, max: 240 },
  );
  const exerciseAngina = parseEnum(
    getRequiredValue(row, headers, "exerciseAngina", errors),
    "Angina por ejercicio",
    { Y: "Sí", N: "No", SI: "Sí", NO: "No", "SÍ": "Sí" } as const,
    errors,
  );
  const oldpeak = parseNumber(
    getRequiredValue(row, headers, "oldpeak", errors),
    "Depresión del segmento ST",
    errors,
    { min: -5, max: 10 },
  );
  const restingECG = parseEnum(
    getRequiredValue(row, headers, "restingECG", errors),
    "ECG en reposo",
    { NORMAL: "Normal", ST: "ST", LVH: "LVH" } as const,
    errors,
  );
  const stSlope = parseEnum(
    getRequiredValue(row, headers, "stSlope", errors),
    "Pendiente ST",
    { UP: "Up", FLAT: "Flat", DOWN: "Down" } as const,
    errors,
  );

  if (errors.length > 0) {
    return {
      rowNumber,
      fullName,
      location,
      errors,
    };
  }

  return {
    rowNumber,
    fullName,
    location,
    candidate: {
      fullName,
      location,
      modelInput: {
        age,
        sex,
        chestPainType,
        restingBP,
        cholesterol,
        fastingBS,
        maxHR,
        exerciseAngina,
        oldpeak,
        restingECG,
        stSlope,
      },
    },
    errors,
  };
}

function getRequiredValue(
  row: ParsedCsvRow,
  headers: string[],
  field: keyof typeof requiredHeaderAliases,
  errors: string[],
) {
  const header = findHeader(headers, requiredHeaderAliases[field]);

  if (!header) {
    errors.push(`Falta la columna requerida "${requiredHeaderAliases[field][0]}".`);
    return "";
  }

  return row[header]?.trim() ?? "";
}

function getOptionalValue(
  row: ParsedCsvRow,
  aliases: readonly string[],
) {
  const key = Object.keys(row).find((header) =>
    aliases.map(normalizeHeader).includes(normalizeHeader(header)),
  );

  return key ? row[key]?.trim() ?? "" : "";
}

function parseNumber(
  rawValue: string,
  label: string,
  errors: string[],
  range?: { min: number; max: number },
) {
  const normalized = rawValue.replace(",", ".");
  const value = Number(normalized);

  if (!rawValue || Number.isNaN(value)) {
    errors.push(`${label}: valor inválido.`);
    return 0;
  }

  if (range && (value < range.min || value > range.max)) {
    errors.push(`${label}: fuera de rango (${range.min} a ${range.max}).`);
  }

  return value;
}

function parseEnum<T>(
  rawValue: string,
  label: string,
  values: Record<string, T>,
  errors: string[],
) {
  const normalized = rawValue.trim().toUpperCase();
  const value = values[normalized];

  if (!rawValue || value === undefined) {
    errors.push(`${label}: opción inválida.`);
    return undefined as T;
  }

  return value;
}

function findHeader(headers: string[], aliases: readonly string[]) {
  return headers.find((header) =>
    aliases.map(normalizeHeader).includes(normalizeHeader(header)),
  );
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function parseRawCsv(csvSource: File | string) {
  return new Promise<{ headers: string[]; rows: ParsedCsvRow[] }>((resolve, reject) => {
    const sharedConfig = {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
      complete: (results: ParseResult<ParsedCsvRow>) => {
        if (results.errors.length > 0) {
          reject(results.errors[0]);
          return;
        }

        resolve({
          headers: results.meta.fields ?? [],
          rows: results.data,
        });
      },
      error: (error: Error) => reject(error),
    } as const;

    Papa.parse<ParsedCsvRow>(csvSource, {
      ...sharedConfig,
      worker: false,
    });
  });
}
