"use client";

import { Activity, BarChart3, Gauge, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { classifierMetadata } from "@/services/classifier-service";

const metricCards = [
  {
    title: "Accuracy",
    value: classifierMetadata.metrics.accuracy,
    icon: Gauge,
    description: "Proporción total de predicciones correctas.",
    tone: "bg-emerald-500",
  },
  {
    title: "Precision",
    value: classifierMetadata.metrics.precision,
    icon: Sparkles,
    description: "Casos positivos predichos que realmente resultan positivos.",
    tone: "bg-sky-500",
  },
  {
    title: "Recall",
    value: classifierMetadata.metrics.recall,
    icon: Activity,
    description: "Capacidad del modelo para detectar casos positivos reales.",
    tone: "bg-amber-500",
  },
  {
    title: "F1 score",
    value: classifierMetadata.metrics.f1_score,
    icon: BarChart3,
    description: "Balance global entre precision y recall.",
    tone: "bg-rose-500",
  },
];

const featureGroups = [
  {
    title: "Datos demográficos",
    items: [
      "Edad",
      "Sexo",
    ],
  },
  {
    title: "Síntomas y antecedentes",
    items: [
      "Tipo de dolor de pecho",
      "Angina inducida por ejercicio",
      "Glucemia en ayunas",
    ],
  },
  {
    title: "Signos, mediciones y estudios",
    items: [
      "Presión sanguínea en reposo",
      "Colesterol sérico",
      "Frecuencia cardíaca máxima",
      "Electrocardiograma en reposo",
      "Depresión del segmento ST",
      "Pendiente del segmento ST",
    ],
  },
];

export default function ModelPage() {
  const [[trueNegative, falsePositive], [falseNegative, truePositive]] =
    classifierMetadata.confusionMatrix;

  const confusionCells = [
    {
      label: "Verdaderos negativos",
      shortLabel: "VN",
      value: trueNegative,
      tone: "bg-emerald-500/12 border-emerald-500/20",
    },
    {
      label: "Falsos positivos",
      shortLabel: "FP",
      value: falsePositive,
      tone: "bg-amber-500/12 border-amber-500/20",
    },
    {
      label: "Falsos negativos",
      shortLabel: "FN",
      value: falseNegative,
      tone: "bg-orange-500/12 border-orange-500/20",
    },
    {
      label: "Verdaderos positivos",
      shortLabel: "VP",
      value: truePositive,
      tone: "bg-rose-500/12 border-rose-500/20",
    },
  ];

  const maxConfusionValue = Math.max(...confusionCells.map((cell) => cell.value), 1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Modelo"
        subtitle="Métricas base, matriz de confusión y espacio de features del clasificador exportado."
        right={
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Exactitud global
            </p>
            <p className="font-heading text-6xl font-semibold tracking-tight">
              {(classifierMetadata.metrics.accuracy * 100).toFixed(1)}%
            </p>
          </div>
        }
        bottom={
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
            <HeroStat label="Features" value={String(classifierMetadata.featureNames.length)} />
            <HeroStat label="Encoding" value="One-hot" />
            <HeroStat label="Escalado" value="Standard" />
          </div>
        }
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Métricas del modelo</CardTitle>
          <CardDescription>
            Seleccioná una métrica para enfocarte en su valor y lectura principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Accuracy" className="space-y-6">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
              {metricCards.map((metric) => (
                <TabsTrigger
                  key={metric.title}
                  value={metric.title}
                  className="rounded-full border border-border/70 bg-background/80 px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                >
                  {metric.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {metricCards.map((metric) => {
              const Icon = metric.icon;
              return (
                <TabsContent key={metric.title} value={metric.title} className="m-0">
                  <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            {metric.title}
                          </p>
                          <p className="font-heading text-6xl font-semibold">
                            {(metric.value * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {metric.description}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-card p-3 text-muted-foreground">
                          <Icon className="size-5" />
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <Progress
                          value={metric.value * 100}
                          className="h-4 bg-muted"
                          indicatorClassName={metric.tone}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>{metric.value.toFixed(4)}</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-background/80 p-6">
                      <p className="text-sm font-medium text-muted-foreground">
                        Lectura rápida
                      </p>
                      <p className="mt-3 text-2xl font-semibold">
                        {getMetricHeadline(metric.title, metric.value)}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {getMetricInterpretation(metric.title)}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Matriz de confusión</CardTitle>
          <CardDescription>
            Conteos de verdaderos y falsos positivos/negativos exportados junto al modelo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/70">
            <div className="grid grid-cols-[minmax(120px,1fr)_1fr_1fr]">
              <MatrixHeader />
              <MatrixTop label="Predicción negativa" />
              <MatrixTop label="Predicción positiva" />
              <MatrixSide label="Real negativa" />
              <MatrixValue value={trueNegative} tone="bg-emerald-500/12" />
              <MatrixValue value={falsePositive} tone="bg-amber-500/12" />
              <MatrixSide label="Real positiva" />
              <MatrixValue value={falseNegative} tone="bg-orange-500/12" />
              <MatrixValue value={truePositive} tone="bg-rose-500/12" />
            </div>
          </div>

          <Accordion type="single" collapsible className="rounded-2xl border border-border/70 bg-background/80 px-4">
            <AccordionItem value="confusion-breakdown" className="border-b-0">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="space-y-1 text-left">
                  <p className="text-sm font-medium">Desglose detallado</p>
                  <p className="text-xs text-muted-foreground">
                    Ver conteos individuales de VN, FP, FN y VP.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {confusionCells.map((cell) => (
                    <div
                      key={cell.shortLabel}
                      className="rounded-xl border border-border/70 bg-card px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">{cell.label}</p>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {cell.shortLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold">{cell.value}</p>
                      <div className="mt-3">
                        <Progress
                          value={(cell.value / maxConfusionValue) * 100}
                          className="h-2 bg-muted"
                          indicatorClassName="bg-foreground/80"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Variables clínicas consideradas</CardTitle>
          <CardDescription>
            Resumen de la información médica que utiliza el clasificador para estimar riesgo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion
            type="multiple"
            defaultValue={["Datos demográficos"]}
            className="rounded-2xl border border-border/70 bg-background/80 px-4"
          >
            {featureGroups.map((group) => (
              <AccordionItem key={group.title} value={group.title}>
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="space-y-1 text-left">
                    <p className="text-sm font-medium">{group.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.items.length} columna{group.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((featureName) => (
                      <div
                        key={featureName}
                        className="rounded-xl border border-border/70 bg-card px-3 py-2 text-sm"
                      >
                        {featureName}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
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

function getMetricHeadline(title: string, value: number) {
  const percentage = (value * 100).toFixed(1);

  switch (title) {
    case "Accuracy":
      return `${percentage}% de aciertos globales`;
    case "Precision":
      return `${percentage}% de positivos predichos correctos`;
    case "Recall":
      return `${percentage}% de positivos reales detectados`;
    case "F1 score":
      return `${percentage}% de equilibrio entre precision y recall`;
    default:
      return `${percentage}%`;
  }
}

function getMetricInterpretation(title: string) {
  switch (title) {
    case "Accuracy":
      return "Resume el rendimiento general del clasificador sobre el conjunto evaluado, sin distinguir el costo relativo de falsos positivos y falsos negativos.";
    case "Precision":
      return "Sirve para evaluar cuánta confianza merece una predicción positiva: cuanto más alta, menor proporción de casos marcados como positivos por error.";
    case "Recall":
      return "Mide la sensibilidad del modelo frente a casos positivos reales. Es especialmente útil cuando interesa minimizar pacientes riesgosos no detectados.";
    case "F1 score":
      return "Combina precision y recall en una sola métrica. Es útil cuando querés una lectura compacta del balance entre ambas sin privilegiar una sola.";
    default:
      return "";
  }
}

function MatrixHeader() {
  return (
    <div className="border-b border-r border-border/70 bg-card px-4 py-4 text-sm font-medium text-muted-foreground">
      Valor real / Predicción
    </div>
  );
}

function MatrixTop({ label }: { label: string }) {
  return (
    <div className="border-b border-border/70 bg-card px-4 py-4 text-center text-sm font-medium">
      {label}
    </div>
  );
}

function MatrixSide({ label }: { label: string }) {
  return (
    <div className="border-r border-border/70 bg-card px-4 py-4 text-sm font-medium">
      {label}
    </div>
  );
}

function MatrixValue({ value, tone }: { value: number; tone: string }) {
  return (
    <div className={`px-4 py-6 text-center ${tone}`}>
      <p className="font-heading text-3xl font-semibold">{value}</p>
    </div>
  );
}
