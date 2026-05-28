"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fieldValueLabels } from "@/lib/clinical-labels";
import type { CreatePatientInput } from "@/lib/types";
import { patientService } from "@/services/patient-service";

type FormData = {
  firstName: string;
  lastName: string;
  age: string;
  sex: "" | "F" | "M";
  location: string;
  risk: "" | "Bajo" | "Medio" | "Alto";
  chestPainType: string;
  exerciseAngina: string;
  restingBP: string;
  maxHR: string;
  cholesterol: string;
  fastingBS: string;
  restingECG: string;
  oldpeak: string;
  stSlope: string;
  notes: string;
};

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  age: "",
  sex: "",
  location: "",
  risk: "",
  chestPainType: "",
  exerciseAngina: "",
  restingBP: "",
  maxHR: "",
  cholesterol: "",
  fastingBS: "",
  restingECG: "",
  oldpeak: "",
  stSlope: "",
  notes: "",
};

export default function NewNursingPatientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guide = searchParams.get("guide") ?? "on";

  const [form, setForm] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  function validate(): string | null {
    if (!form.firstName.trim() || !form.lastName.trim()) return "El nombre y apellido son obligatorios.";
    if (!form.age || Number(form.age) <= 0) return "La edad debe ser mayor a 0.";
    if (!form.sex) return "Seleccioná el sexo del paciente.";
    if (!form.location.trim()) return "La ubicación es obligatoria.";
    if (!form.chestPainType) return "Seleccioná el tipo de dolor de pecho.";
    if (!form.restingBP) return "La presión en reposo es obligatoria.";
    if (!form.cholesterol) return "El colesterol es obligatorio.";
    if (!form.maxHR) return "La frecuencia máxima es obligatoria.";
    return null;
  }

  function buildCreatePatientInput({ asDraft }: { asDraft: boolean }): CreatePatientInput {
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    return {
      patient: {
        fullName: fullName || "Paciente pendiente de identificación",
        location: form.location.trim() || "Ubicación pendiente",
      },
      modelInput: {
        age: form.age ? Number(form.age) : 0,
        sex: (form.sex || "M") as "F" | "M",
        chestPainType: (form.chestPainType || "NAP") as "TA" | "ATA" | "NAP" | "ASY",
        restingBP: form.restingBP ? Number(form.restingBP) : 0,
        cholesterol: form.cholesterol ? Number(form.cholesterol) : 0,
        fastingBS: (form.fastingBS ? Number(form.fastingBS) : 0) as 0 | 1,
        maxHR: form.maxHR ? Number(form.maxHR) : 0,
        exerciseAngina: form.exerciseAngina === "Y" ? "Sí" : "No",
        oldpeak: form.oldpeak ? Number(form.oldpeak) : 0,
        restingECG: (form.restingECG || "Normal") as "Normal" | "ST" | "LVH",
        stSlope: (form.stSlope || "Up") as "Up" | "Flat" | "Down",
      },
      assessment: {
        riskLevel: (form.risk as "Bajo" | "Medio" | "Alto") || "Medio",
        clinicalSummary: asDraft
          ? form.notes.trim() || "Borrador guardado. Faltan completar datos de triaje."
          : form.notes.trim() || "Caso creado y pendiente de triaje.",
        recommendedAction: asDraft
          ? "Completar el registro antes de confirmar el triaje."
          : undefined,
      },
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await patientService.create(buildCreatePatientInput({ asDraft: false }));
      router.push(`/dashboard/nursing?guide=${guide}`);
    } catch (err) {
      console.error("Error al crear paciente:", err);
      setError("Ocurrió un error al guardar el paciente. Intentá de nuevo.");
      setIsSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    setError(null);
    setIsSavingDraft(true);
    try {
      await patientService.create(buildCreatePatientInput({ asDraft: true }));
      router.push(`/dashboard/nursing?guide=${guide}`);
    } catch (err) {
      console.error("Error al guardar borrador:", err);
      setError("Ocurrió un error al guardar el borrador. Intentá de nuevo.");
      setIsSavingDraft(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-3xl">Nuevo paciente</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Alta clínica inicial y registro del ingreso.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Ingreso del paciente</CardTitle>
          <CardDescription>Datos personales, motivo de consulta, mediciones y observaciones.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <SectionTitle title="Identificación" />
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Nombre">
                  <Input
                    placeholder="María"
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                  />
                </Field>
                <Field label="Apellido">
                  <Input
                    placeholder="Sosa"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                  />
                </Field>
                <Field label="Edad">
                  <Input
                    type="number"
                    placeholder="57"
                    value={form.age}
                    onChange={(e) => updateField("age", e.target.value)}
                  />
                </Field>
                <Field label="Sexo">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={form.sex}
                    onChange={(e) => updateField("sex", e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="F">{fieldValueLabels.sex.F}</option>
                    <option value="M">{fieldValueLabels.sex.M}</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <SectionTitle title="Ubicación y riesgo inicial" />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Ubicación / centro">
                  <Input
                    placeholder="Hospital Central"
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </Field>
                <Field label="Riesgo estimado">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={form.risk}
                    onChange={(e) => updateField("risk", e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Bajo">Bajo</option>
                    <option value="Medio">Medio</option>
                    <option value="Alto">Alto</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <SectionTitle title="Motivo de consulta" />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Tipo de dolor de pecho">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={form.chestPainType}
                    onChange={(e) => updateField("chestPainType", e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="TA">{fieldValueLabels.chestPainType.TA}</option>
                    <option value="ATA">{fieldValueLabels.chestPainType.ATA}</option>
                    <option value="NAP">{fieldValueLabels.chestPainType.NAP}</option>
                    <option value="ASY">{fieldValueLabels.chestPainType.ASY}</option>
                  </select>
                </Field>
                <Field label="Angina por ejercicio">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={form.exerciseAngina}
                    onChange={(e) => updateField("exerciseAngina", e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="N">{fieldValueLabels.exerciseAngina.N}</option>
                    <option value="Y">{fieldValueLabels.exerciseAngina.Y}</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <SectionTitle title="Signos y mediciones" />
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Presión en reposo (mm Hg)">
                  <Input
                    type="number"
                    placeholder="132"
                    value={form.restingBP}
                    onChange={(e) => updateField("restingBP", e.target.value)}
                  />
                </Field>
                <Field label="Frecuencia máxima">
                  <Input
                    type="number"
                    placeholder="148"
                    value={form.maxHR}
                    onChange={(e) => updateField("maxHR", e.target.value)}
                  />
                </Field>
                <Field label="Colesterol (mg/dl)">
                  <Input
                    type="number"
                    placeholder="226"
                    value={form.cholesterol}
                    onChange={(e) => updateField("cholesterol", e.target.value)}
                  />
                </Field>
                <Field label="Glucemia en ayunas">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={form.fastingBS}
                    onChange={(e) => updateField("fastingBS", e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="0">{fieldValueLabels.fastingBS[0]}</option>
                    <option value="1">{fieldValueLabels.fastingBS[1]}</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <SectionTitle title="Pruebas complementarias" />
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field label="ECG en reposo">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={form.restingECG}
                    onChange={(e) => updateField("restingECG", e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Normal">{fieldValueLabels.restingECG.Normal}</option>
                    <option value="ST">{fieldValueLabels.restingECG.ST}</option>
                    <option value="LVH">{fieldValueLabels.restingECG.LVH}</option>
                  </select>
                </Field>
                <Field label="Oldpeak">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.4"
                    value={form.oldpeak}
                    onChange={(e) => updateField("oldpeak", e.target.value)}
                  />
                </Field>
                <Field label="Pendiente ST">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={form.stSlope}
                    onChange={(e) => updateField("stSlope", e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Up">{fieldValueLabels.stSlope.Up}</option>
                    <option value="Flat">{fieldValueLabels.stSlope.Flat}</option>
                    <option value="Down">{fieldValueLabels.stSlope.Down}</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <SectionTitle title="Observaciones" />
              <label className="mt-4 grid gap-2">
                <span className="text-sm font-medium">Notas del ingreso</span>
                <textarea
                  rows={5}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  placeholder="Síntomas reportados, contexto de la consulta, datos a revisar..."
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </label>
            </section>

            {error ? (
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 border-t border-border/70 pt-4">
              <Button type="submit" disabled={isSubmitting || isSavingDraft}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                ) : null}
                Guardar y pasar a evaluación
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSavingDraft}
              >
                {isSavingDraft ? (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                ) : null}
                Guardar como borrador
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
