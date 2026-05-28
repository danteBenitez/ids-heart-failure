import { Activity, ArrowUpRight, FileHeart } from "lucide-react";
import { CaseQueueTable } from "@/components/case-queue-table";
import { RoleDashboardSummary } from "@/components/role-dashboard-summary";
import { patientCases } from "@/lib/demo-data";

type ClinicalPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClinicalPage({ searchParams }: ClinicalPageProps) {
  const params = (await searchParams) ?? {};
  const guide = typeof params.guide === "string" ? params.guide : "on";
  const clinicalCases = patientCases.filter(
    (patientCase) =>
      patientCase.workflow.nextRole === "medico" ||
      patientCase.workflow.status === "Listo para evaluación",
  );

  return (
    <div className="flex flex-col gap-6">
      <RoleDashboardSummary
        title="Médico clínico"
        description="Casos listos para evaluación, priorización y definición de conducta."
        metrics={[
          {
            icon: FileHeart,
            label: "Listos para evaluar",
            value: String(clinicalCases.length),
            note: "Pacientes con triaje suficiente para revisión clínica.",
          },
          {
            icon: Activity,
            label: "Acción principal",
            value: "Registrar evaluación",
            note: "El score apoya la decisión, pero la conducta queda a cargo del médico.",
          },
          {
            icon: ArrowUpRight,
            label: "Siguiente transición",
            value: "Cardiología",
            note: "Solo los casos priorizados avanzan a derivación especializada.",
          },
        ]}
      />

      <CaseQueueTable
        title="Casos pendientes"
        description="Pacientes listos para evaluación clínica."
        cases={clinicalCases}
        role="medico"
        guide={guide}
      />
    </div>
  );
}
