import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NewNursingPatientPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Ruta: `/dashboard/nursing/new`</Badge>
              <Badge variant="outline">Pantalla operativa</Badge>
            </div>
            <CardTitle className="text-3xl">Nuevo paciente</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Formulario inicial para que enfermería cree un caso clínico. Toma los
              campos base del dataset del notebook y los organiza como captura usable
              para personas reales.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Comportamiento esperado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              Al guardar, se crea un caso en estado <strong>Pendiente de evaluación</strong>.
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              El siguiente rol esperado pasa a ser <strong>Médico clínico</strong>.
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              Si faltan datos críticos, el caso debería quedar en revisión de enfermería.
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Formulario clínico inicial</CardTitle>
          <CardDescription>
            Primera versión de la captura. Más adelante podemos convertir esto en un
            estado real con validaciones, guardado y redirección al detalle del caso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <section className="grid gap-4">
              <SectionTitle title="Identificación del paciente" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                    <option>F</option>
                    <option>M</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="grid gap-4">
              <SectionTitle title="Variables del modelo" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Tipo de dolor de pecho">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
                    <option>TA</option>
                    <option>ATA</option>
                    <option>NAP</option>
                    <option>ASY</option>
                  </select>
                </Field>
                <Field label="Presión en reposo (mm Hg)">
                  <Input type="number" placeholder="132" />
                </Field>
                <Field label="Colesterol (mg/dl)">
                  <Input type="number" placeholder="226" />
                </Field>
                <Field label="Glucemia en ayunas">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
                    <option value="0">Menor o igual a 120 mg/dl</option>
                    <option value="1">Mayor a 120 mg/dl</option>
                  </select>
                </Field>
                <Field label="ECG en reposo">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
                    <option>Normal</option>
                    <option>ST</option>
                    <option>LVH</option>
                  </select>
                </Field>
                <Field label="Frecuencia máxima">
                  <Input type="number" placeholder="148" />
                </Field>
                <Field label="Angina por ejercicio">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
                    <option>No</option>
                    <option>Sí</option>
                  </select>
                </Field>
                <Field label="Oldpeak">
                  <Input type="number" step="0.1" placeholder="0.4" />
                </Field>
                <Field label="Pendiente ST">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <option>Seleccionar</option>
                    <option>Up</option>
                    <option>Flat</option>
                    <option>Down</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="grid gap-4">
              <SectionTitle title="Observaciones" />
              <label className="grid gap-2">
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
      <Badge variant="secondary">Enfermería</Badge>
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
