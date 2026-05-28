import Link from "next/link";
import { ClipboardPlus, Clock3, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaseQueueTable } from "@/components/case-queue-table";
import { RoleDashboardSummary } from "@/components/role-dashboard-summary";
import { patientCases } from "@/lib/demo-data";

type NursingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NursingPage({ searchParams }: NursingPageProps) {
  const params = (await searchParams) ?? {};
  const guide = typeof params.guide === "string" ? params.guide : "on";

  const pendingCases = patientCases.filter(
    (patientCase) =>
      patientCase.workflow.nextRole === "enfermeria" ||
      patientCase.workflow.status === "Pendiente de triaje",
  );

  return (
    <div className="flex flex-col gap-6">
      <RoleDashboardSummary
        title="Enfermería"
        description="Ingresos pendientes, triajes incompletos y carga inicial de pacientes."
        metrics={[
          {
            icon: Clock3,
            label: "Pendientes de triaje",
            value: String(pendingCases.length),
            note: "Casos listos para carga o validación inicial.",
          },
          {
            icon: ClipboardPlus,
            label: "Nuevos ingresos",
            value: "1",
            note: "Pacientes listos para alta clínica.",
          },
          {
            icon: TriangleAlert,
            label: "Revisión requerida",
            value: "2",
            note: "Casos con datos pendientes de validar.",
          },
        ]}
      />

      <CaseQueueTable
        title="Pacientes pendientes"
        description="Pacientes con carga inicial o triaje por completar."
        cases={pendingCases}
        role="enfermeria"
        guide={guide}
        headerAction={
          <Button asChild className="w-full md:w-auto">
            <Link href={`/dashboard/nursing/new?guide=${guide}`}>
              Cargar paciente nuevo
              <ClipboardPlus data-icon="inline-end" />
            </Link>
          </Button>
        }
      />
    </div>
  );
}
