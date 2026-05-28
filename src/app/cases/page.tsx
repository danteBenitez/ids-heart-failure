import { AppFrame } from "@/components/app-frame";
import { CaseCard } from "@/components/case-card";
import { GuidePanel } from "@/components/guide-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { patientCases, roleLabels } from "@/lib/demo-data";

type CasesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = (await searchParams) ?? {};
  const palette = typeof params.palette === "string" ? params.palette : undefined;
  const guide = typeof params.guide === "string" ? params.guide : "on";
  const enabledGuide = guide !== "off";
  const highlightedCase = patientCases[0];

  return (
    <AppFrame
      title="Lista de casos"
      subtitle="Cada tarjeta representa un estado distinto del flujo clínico. La demo guiada solo destaca uno de ellos."
      paletteId={palette}
    >
      <GuidePanel
        enabled={enabledGuide}
        role={roleLabels[highlightedCase.nextRole]}
        step={`Para arrancar desde el inicio del flujo, abrí ${highlightedCase.patient} y completá el triaje.`}
        actionLabel="Abrir caso inicial"
        href={`/cases/${highlightedCase.id}?palette=${palette ?? "sand"}&guide=${guide}`}
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Pacientes precargados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          {patientCases.map((patientCase) => (
            <CaseCard
              key={patientCase.id}
              patientCase={patientCase}
              palette={palette ?? "sand"}
              guide={guide}
            />
          ))}
        </CardContent>
      </Card>
    </AppFrame>
  );
}
