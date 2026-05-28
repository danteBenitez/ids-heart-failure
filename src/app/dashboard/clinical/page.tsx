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
    (p) => p.nextRole === "medico" || p.status === "Listo para evaluación",
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
