"use client";

import { useSearchParams } from "next/navigation";
import { Activity, ArrowUpRight, FileHeart } from "lucide-react";
import { CaseQueueTable } from "@/components/case-queue-table";
import { RoleDashboardSummary } from "@/components/role-dashboard-summary";
import { usePatientStore } from "@/stores/patient-store";

export default function ClinicalPage() {
  const searchParams = useSearchParams();
  const guide = searchParams.get("guide") ?? "on";

  const patients = usePatientStore((s) => s.patients);
  const isHydrated = usePatientStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-48 animate-pulse rounded-2xl bg-muted/50" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    );
  }

  const clinicalCases = patients.filter(
    (p) =>
      p.workflow.nextRole === "medico" ||
      p.workflow.status === "Listo para evaluación" ||
      p.workflow.status === "Seguimiento clínico",
  );
  const followUpCases = clinicalCases.filter(
    (p) =>
      p.workflow.status === "Seguimiento clínico" ||
      p.workflow.primaryActionLabel.toLowerCase().includes("reevalu"),
  );
  const initialEvaluationCases = clinicalCases.length - followUpCases.length;

  return (
    <div className="flex flex-col gap-6">
      <RoleDashboardSummary
        title="Médico clínico"
        description="Bandeja clínica para evaluación inicial, reevaluación y seguimiento posterior."
        metrics={[
          {
            icon: FileHeart,
            label: "Evaluación inicial",
            value: String(initialEvaluationCases),
            note: "Casos listos para score y definición de conducta inicial.",
          },
          {
            icon: Activity,
            label: "Seguimiento / reevaluación",
            value: String(followUpCases.length),
            note: "Casos devueltos por cardiología o con control clínico pendiente.",
          },
          {
            icon: ArrowUpRight,
            label: "Escalamiento",
            value: "Cardiología",
            note: "Los casos priorizados siguen el circuito de derivación especializada.",
          },
        ]}
      />

      <CaseQueueTable
        title="Casos pendientes"
        description="Pacientes para evaluación inicial, reevaluación o seguimiento."
        cases={clinicalCases}
        role="medico"
        guide={guide}
      />
    </div>
  );
}
