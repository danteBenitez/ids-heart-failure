import { ArrowUpRight, HeartPulse, ShieldCheck } from "lucide-react";
import { CaseQueueTable } from "@/components/case-queue-table";
import { RoleDashboardSummary } from "@/components/role-dashboard-summary";
import { patientCases } from "@/lib/demo-data";

type CardiologyPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CardiologyPage({
  searchParams,
}: CardiologyPageProps) {
  const params = (await searchParams) ?? {};
  const guide = typeof params.guide === "string" ? params.guide : "on";
  const referredCases = patientCases.filter(
    (patientCase) =>
      patientCase.nextRole === "cardiologia" ||
      patientCase.status === "Derivado a cardiología",
  );

  return (
    <div className="flex flex-col gap-6">
      <RoleDashboardSummary
        title="Cardiología"
        description="Casos derivados para confirmación diagnóstica y resolución especializada."
        metrics={[
          {
            icon: HeartPulse,
            label: "Pendientes de resolución",
            value: String(referredCases.length),
            note: "Casos que ya atravesaron etapas previas y esperan resolución.",
          },
          {
            icon: ShieldCheck,
            label: "Entrada del rol",
            value: "Derivación priorizada",
            note: "La derivación llega con trazabilidad clínica y fundamentos.",
          },
          {
            icon: ArrowUpRight,
            label: "Salida esperada",
            value: "Resolución clínica",
            note: "Cardiología confirma, corrige o cierra el caso.",
          },
        ]}
      />

      <CaseQueueTable
        title="Casos pendientes"
        description="Pacientes derivados con resolución clínica pendiente."
        cases={referredCases}
        role="cardiologia"
        guide={guide}
      />
    </div>
  );
}
