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

export default function NewNursingPatientPage() {
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
          <form className="grid gap-6">
            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <SectionTitle title="Identificación" />
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Nombre">
                  <Input placeholder="María" />
                </Field>
                <Field label="Apellido">
                  <Input placeholder="Sosa" />
                </Field>
                <Field label="Edad">
                  <Input type="number" placeholder="57" />
                </Field>
                <Field label="Sexo">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
                    <option value="F">{fieldValueLabels.sex.F}</option>
                    <option value="M">{fieldValueLabels.sex.M}</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <SectionTitle title="Motivo de consulta" />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Tipo de dolor de pecho">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
                    <option value="TA">{fieldValueLabels.chestPainType.TA}</option>
                    <option value="ATA">{fieldValueLabels.chestPainType.ATA}</option>
                    <option value="NAP">{fieldValueLabels.chestPainType.NAP}</option>
                    <option value="ASY">{fieldValueLabels.chestPainType.ASY}</option>
                  </select>
                </Field>
                <Field label="Angina por ejercicio">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
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
                  <Input type="number" placeholder="132" />
                </Field>
                <Field label="Frecuencia máxima">
                  <Input type="number" placeholder="148" />
                </Field>
                <Field label="Colesterol (mg/dl)">
                  <Input type="number" placeholder="226" />
                </Field>
                <Field label="Glucemia en ayunas">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
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
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
                    <option value="Normal">{fieldValueLabels.restingECG.Normal}</option>
                    <option value="ST">{fieldValueLabels.restingECG.ST}</option>
                    <option value="LVH">{fieldValueLabels.restingECG.LVH}</option>
                  </select>
                </Field>
                <Field label="Oldpeak">
                  <Input type="number" step="0.1" placeholder="0.4" />
                </Field>
                <Field label="Pendiente ST">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
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
                />
              </label>
            </section>

            <div className="flex flex-wrap gap-3 border-t border-border/70 pt-4">
              <Button type="button">Guardar y pasar a evaluación</Button>
              <Button type="button" variant="outline">
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
