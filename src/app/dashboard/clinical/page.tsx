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
    (p) => p.workflow.nextRole === "medico",
  );

  const historyCases = patients.filter(
    (p) =>
      p.workflow.status === "Derivado a cardiología" ||
      p.workflow.status === "Cerrado",
  );

  const derivedCount = patients.filter(
    (p) => p.workflow.status === "Derivado a cardiología",
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <RoleDashboardSummary
        title="Médico clínico"
        description="Casos listos para evaluación clínica y definición de conducta."
        metrics={[
          {
            icon: FileHeart,
            label: "Pendientes de evaluación",
            value: String(clinicalCases.length),
            note: "Casos listos para score y decisión clínica.",
          },
          {
            icon: Activity,
            label: "Derivados a cardiología",
            value: String(derivedCount),
            note: "Casos que pasaron por el médico y requieren especialista.",
          },
          {
            icon: ArrowUpRight,
            label: "Historial / Evaluados",
            value: String(historyCases.length),
            note: "Total de pacientes evaluados por clínica médica.",
          },
        ]}
      />

      <div className="flex flex-col gap-6">
        <CaseQueueTable
          title="Casos Requiriendo Acción"
          description="Pacientes listos para evaluación clínica y definición de conducta médica."
          cases={clinicalCases}
          role="medico"
          guide={guide}
        />

        <CaseQueueTable
          title="Historial de Evaluaciones y Seguimiento"
          description="Casos ya evaluados (derivados a cardiología o cerrados) donde puedes consultar y ajustar tu evaluación médica."
          cases={historyCases}
          role="medico"
          guide={guide}
          readOnly={true}
        />
      </div>
    </div>
  );
}
