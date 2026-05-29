"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, MoveRight, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fieldValueLabels } from "@/lib/clinical-labels";
import { cn } from "@/lib/utils";
import type { CreatePatientInput } from "@/lib/types";
import { patientService } from "@/services/patient-service";

type FormData = {
  firstName: string;
  lastName: string;
  age: string;
  sex: "" | "F" | "M";
  location: string;
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
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  function validate(): string | null {
    if (!form.firstName.trim() || !form.lastName.trim()) return "El nombre y apellido son obligatorios.";
    if (!form.age || Number(form.age) <= 0) return "La edad debe ser mayor a 0.";
    if (Number(form.age) < 18 || Number(form.age) > 120) return "La edad debe estar entre 18 y 120 años.";
    if (!form.sex) return "Seleccioná el sexo del paciente.";
    if (!form.location.trim()) return "La ubicación es obligatoria.";
    if (!form.chestPainType) return "Seleccioná el tipo de dolor de pecho.";
    if (!form.exerciseAngina) return "Indicá si presenta angina inducida por ejercicio.";
    if (!form.restingBP) return "La presión en reposo es obligatoria.";
    if (Number(form.restingBP) < 70 || Number(form.restingBP) > 250) {
      return "La presión en reposo debe estar entre 70 y 250 mm Hg.";
    }
    if (!form.cholesterol) return "El colesterol es obligatorio.";
    if (Number(form.cholesterol) < 50 || Number(form.cholesterol) > 700) {
      return "El colesterol debe estar entre 50 y 700 mg/dl.";
    }
    if (!form.maxHR) return "La frecuencia máxima es obligatoria.";
    if (Number(form.maxHR) < 60 || Number(form.maxHR) > 240) {
      return "La frecuencia máxima debe estar entre 60 y 240 lpm.";
    }
    if (!form.fastingBS) return "Indicá el rango de glucemia en ayunas.";
    if (!form.restingECG) return "Seleccioná el resultado del ECG en reposo.";
    if (!form.stSlope) return "Seleccioná la pendiente del segmento ST.";
    if (form.oldpeak && (Number(form.oldpeak) < -5 || Number(form.oldpeak) > 10)) {
      return "La depresión del segmento ST debe estar entre -5.0 y 10.0.";
    }
    return null;
  }

  function buildCreatePatientInput(): CreatePatientInput {
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    return {
      patient: {
        fullName,
        location: form.location.trim(),
      },
      modelInput: {
        age: Number(form.age),
        sex: form.sex as "F" | "M",
        chestPainType: form.chestPainType as "TA" | "ATA" | "NAP" | "ASY",
        restingBP: Number(form.restingBP),
        cholesterol: Number(form.cholesterol),
        fastingBS: (form.fastingBS ? Number(form.fastingBS) : 0) as 0 | 1,
        maxHR: Number(form.maxHR),
        exerciseAngina: form.exerciseAngina === "Y" ? "Sí" : "No",
        oldpeak: form.oldpeak ? Number(form.oldpeak) : 0,
        restingECG: (form.restingECG || "Normal") as "Normal" | "ST" | "LVH",
        stSlope: (form.stSlope || "Up") as "Up" | "Flat" | "Down",
      },
      assessment: {
        clinicalSummary: form.notes.trim() || "Caso creado y pendiente de triaje.",
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
      const patient = await patientService.create(buildCreatePatientInput());
      await patientService.advanceStatus(patient.id);
      router.push(`/dashboard/nursing?guide=${guide}`);
    } catch (err) {
      console.error("Error al crear paciente:", err);
      setError("Ocurrió un error al guardar el paciente. Intentá de nuevo.");
      setIsSubmitting(false);
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
                  <Select value={form.sex} onValueChange={(value) => updateField("sex", value)}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F">{fieldValueLabels.sex.F}</SelectItem>
                      <SelectItem value="M">{fieldValueLabels.sex.M}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Ubicación / centro" className="xl:col-span-2">
                  <Input
                    placeholder="Hospital Central"
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <SectionTitle title="Motivo de consulta" />
              <div className="mt-4 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Field label="Tipo de dolor de pecho">
                  <ChoiceGrid
                    value={form.chestPainType}
                    onChange={(value) => updateField("chestPainType", value)}
                    options={[
                      { value: "TA", label: fieldValueLabels.chestPainType.TA },
                      { value: "ATA", label: fieldValueLabels.chestPainType.ATA },
                      { value: "NAP", label: fieldValueLabels.chestPainType.NAP },
                      { value: "ASY", label: fieldValueLabels.chestPainType.ASY },
                    ]}
                    columns="md:grid-cols-2"
                    compact
                  />
                </Field>
                <Field
                  label="Angina por ejercicio"
                  hint="Indica si el dolor aparece o empeora con el esfuerzo."
                >
                  <ChoiceGrid
                    value={form.exerciseAngina}
                    onChange={(value) => updateField("exerciseAngina", value)}
                    options={[
                      { value: "N", label: fieldValueLabels.exerciseAngina.N },
                      { value: "Y", label: fieldValueLabels.exerciseAngina.Y },
                    ]}
                    columns="grid-cols-2"
                    compact
                  />
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
                    min={70}
                    max={250}
                    value={form.restingBP}
                    onChange={(e) => updateField("restingBP", e.target.value)}
                  />
                </Field>
                <Field label="Frecuencia máxima">
                  <Input
                    type="number"
                    placeholder="148"
                    min={60}
                    max={240}
                    value={form.maxHR}
                    onChange={(e) => updateField("maxHR", e.target.value)}
                  />
                </Field>
                <Field label="Colesterol (mg/dl)">
                  <Input
                    type="number"
                    placeholder="226"
                    min={50}
                    max={700}
                    value={form.cholesterol}
                    onChange={(e) => updateField("cholesterol", e.target.value)}
                  />
                </Field>
                <Field label="Glucemia en ayunas">
                  <ChoiceGrid
                    value={form.fastingBS}
                    onChange={(value) => updateField("fastingBS", value)}
                    options={[
                      { value: "0", label: fieldValueLabels.fastingBS[0] },
                      { value: "1", label: fieldValueLabels.fastingBS[1] },
                    ]}
                    columns="grid-cols-1"
                    compact
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <SectionTitle title="Resultados complementarios" />
              <div className="mt-4 grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="ECG en reposo"
                    hint="Electrocardiograma en reposo"
                  >
                    <Select
                      value={form.restingECG}
                      onValueChange={(value) => updateField("restingECG", value)}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">
                          {fieldValueLabels.restingECG.Normal}
                        </SelectItem>
                        <SelectItem value="ST">{fieldValueLabels.restingECG.ST}</SelectItem>
                        <SelectItem value="LVH">{fieldValueLabels.restingECG.LVH}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field
                    label="Depresión del segmento ST"
                    hint="Diferencia respecto al reposo durante el esfuerzo."
                  >
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.4"
                      min={-5}
                      max={10}
                      value={form.oldpeak}
                      onChange={(e) => updateField("oldpeak", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Pendiente ST">
                  <ChoiceGrid
                    value={form.stSlope}
                    onChange={(value) => updateField("stSlope", value)}
                    options={[
                      {
                        value: "Up",
                        label: fieldValueLabels.stSlope.Up,
                        icon: TrendingUp,
                      },
                      {
                        value: "Flat",
                        label: fieldValueLabels.stSlope.Flat,
                        icon: MoveRight,
                      },
                      {
                        value: "Down",
                        label: fieldValueLabels.stSlope.Down,
                        icon: TrendingDown,
                      },
                    ]}
                    columns="md:grid-cols-3"
                    compact
                  />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                ) : null}
                Guardar y pasar a evaluación
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
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-medium">{label}</span>
      {hint ? (
        <span className="-mt-1 text-xs leading-5 text-muted-foreground">{hint}</span>
      ) : null}
      {children}
    </label>
  );
}

function ChoiceGrid({
  value,
  onChange,
  options,
  columns = "grid-cols-1",
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  columns?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid gap-2", columns)}>
      {options.map((option) => {
        const selected = value === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-between rounded-xl border px-3 text-left text-sm transition-colors",
              compact ? "min-h-10 py-2" : "min-h-11 py-2.5",
              "hover:border-primary/50 hover:bg-accent/50",
              selected
                ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20"
                : "border-input bg-background text-muted-foreground",
            )}
          >
            <div className="flex items-center gap-3">
              {Icon ? (
                <span
                  className={cn(
                    "rounded-lg border p-1.5",
                    selected
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/70 bg-muted/40 text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
              ) : null}
              <span>{option.label}</span>
            </div>
            {selected ? <Check className="size-4 text-primary" /> : null}
          </button>
        );
      })}
    </div>
  );
}
