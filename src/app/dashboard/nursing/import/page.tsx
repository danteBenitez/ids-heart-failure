"use client";

import { ChangeEvent, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FileUp, Loader2, Upload, WandSparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buildCreateInputsFromPreview,
  parseCsvImportPreview,
  type CsvImportPreview,
} from "@/lib/csv-import";
import { buildAssessmentFromModel } from "@/services/classifier-service";
import { patientService } from "@/services/patient-service";

const requiredColumns = [
  "Age",
  "Sex",
  "ChestPainType",
  "RestingBP",
  "Cholesterol",
  "FastingBS",
  "MaxHR",
  "ExerciseAngina",
  "Oldpeak",
  "RestingECG",
  "ST_Slope",
];

export default function NursingImportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guide = searchParams.get("guide") ?? "on";

  const [defaultLocation, setDefaultLocation] = useState("Hospital Central");
  const [namePrefix, setNamePrefix] = useState("Paciente importado");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isPendingPreview, startParsingTransition] = useTransition();
  const [importProgress, setImportProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);

  const validRows = useMemo(
    () => preview?.rows.filter((row) => row.errors.length === 0) ?? [],
    [preview],
  );
  const invalidRows = useMemo(
    () => preview?.rows.filter((row) => row.errors.length > 0) ?? [],
    [preview],
  );

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setSuccess(null);
    setFileName(file.name);
    setIsReadingFile(true);

    try {
      const nextPreview = await parseCsvImportPreview(file, {
        location: defaultLocation,
        namePrefix,
      });

      if (nextPreview.rows.length === 0) {
        setPreview(null);
        setError("El archivo no contiene filas de datos para importar.");
        return;
      }

      startParsingTransition(() => {
        setPreview(nextPreview);
      });
    } catch (err) {
      console.error("Error al leer CSV:", err);
      setPreview(null);
      setError("No se pudo leer el archivo CSV. Verificá el formato e intentá de nuevo.");
    } finally {
      setIsReadingFile(false);
    }
  }

  async function handleImport() {
    if (!preview) {
      return;
    }

    const inputs = buildCreateInputsFromPreview(preview);

    if (inputs.length === 0) {
      setError("No hay filas válidas para importar.");
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportProgress({ completed: 0, total: inputs.length });

    try {
      const imported = await patientService.importTriageCompleteCases(inputs, {
        onProgress: (completed, total) => {
          setImportProgress({ completed, total });
        },
      });
      setSuccess(`${imported.length} casos quedaron listos para evaluación médica.`);
      router.refresh();
    } catch (err) {
      console.error("Error al importar CSV:", err);
      setError("Ocurrió un error al importar los casos. Intentá nuevamente.");
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Importar CSV"
        subtitle="Carga masiva de pacientes con variables clínicas completas para dejarlos listos para evaluación médica."
        right={
          <Button asChild variant="outline">
            <Link href={`/dashboard/nursing?guide=${guide}`}>
              Volver a enfermería
            </Link>
          </Button>
        }
        bottom={
          <div className="grid gap-3 md:grid-cols-3">
            <HeroStat label="Columnas requeridas" value={String(requiredColumns.length)} />
            <HeroStat label="Filas válidas" value={String(validRows.length)} />
            <HeroStat label="Filas con error" value={String(invalidRows.length)} />
          </div>
        }
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Archivo y contexto de importación</CardTitle>
          <CardDescription>
            Si el CSV no incluye nombre o ubicación, se usarán los valores definidos acá.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ubicación por defecto">
                <Input
                  value={defaultLocation}
                  onChange={(e) => setDefaultLocation(e.target.value)}
                  placeholder="Hospital Central"
                />
              </Field>
              <Field label="Prefijo de nombre">
                <Input
                  value={namePrefix}
                  onChange={(e) => setNamePrefix(e.target.value)}
                  placeholder="Paciente importado"
                />
              </Field>
            </div>

            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-center transition-colors hover:border-primary/40 hover:bg-accent/30">
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <FileUp className="size-5 text-muted-foreground" />
              <p className="mt-3 font-medium">Seleccionar archivo CSV</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {fileName || "Formato esperado: columnas del modelo sin one-hot encoding."}
              </p>
              {isReadingFile || isPendingPreview ? (
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Procesando archivo...
                </p>
              ) : null}
            </label>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-sm font-medium">Columnas requeridas</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {requiredColumns.map((column) => (
                <Badge key={column} variant="outline">
                  {column}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </div>
      ) : null}

      {preview ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Vista previa de importación</CardTitle>
              <CardDescription>
                Se importarán solo las filas válidas; las inválidas quedan marcadas para revisión.
              </CardDescription>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              {importProgress ? (
                <p className="text-sm text-muted-foreground">
                  Importando {importProgress.completed} de {importProgress.total} filas válidas
                </p>
              ) : null}
              <Button onClick={handleImport} disabled={validRows.length === 0 || isImporting}>
              {isImporting ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <Upload data-icon="inline-start" />
              )}
              Importar casos válidos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">Fila</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Riesgo estimado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[340px]">Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.slice(0, 12).map((row) => {
                    const assessment = row.candidate
                      ? buildAssessmentFromModel(row.candidate.modelInput)
                      : null;

                    return (
                      <TableRow key={row.rowNumber}>
                        <TableCell className="pl-4">{row.rowNumber}</TableCell>
                        <TableCell className="font-medium">{row.fullName}</TableCell>
                        <TableCell>{row.location || "Sin ubicación"}</TableCell>
                        <TableCell>{row.candidate?.modelInput.age ?? "—"}</TableCell>
                        <TableCell>
                          {assessment ? (
                            <Badge
                              variant={
                                assessment.riskLevel === "Alto" ? "default" : "secondary"
                              }
                            >
                              {Math.round(assessment.riskProbability * 100)}% · {assessment.riskLevel}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.errors.length === 0 ? "secondary" : "destructive"}>
                            {row.errors.length === 0 ? "Lista para importar" : "Revisar"}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-normal text-sm text-muted-foreground">
                          {row.errors.length === 0
                            ? "Se creará como caso listo para evaluación médica."
                            : row.errors.join(" ")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {preview.rows.length > 12 ? (
              <p className="text-sm text-muted-foreground">
                Se muestran las primeras 12 filas de {preview.rows.length} detectadas en el archivo.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70 bg-card/90">
          <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-muted-foreground">
              <WandSparkles className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Subí un archivo para validar la importación</p>
              <p className="text-sm text-muted-foreground">
                La app revisará las columnas, normalizará las categorías y calculará el riesgo antes de crear los casos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
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
