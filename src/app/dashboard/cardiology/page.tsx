"use client";

import { useSearchParams } from "next/navigation";
import { ArrowUpRight, HeartPulse, ShieldCheck } from "lucide-react";
import { CaseQueueTable } from "@/components/case-queue-table";
import { RoleDashboardSummary } from "@/components/role-dashboard-summary";
import { usePatientStore } from "@/stores/patient-store";

export default function CardiologyPage() {
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

  const referredCases = patients.filter(
    (p) => p.workflow.nextRole === "cardiologia",
  );

  const historyCases = patients.filter(
    (p) => p.workflow.status === "Cerrado",
  );

  return (
    <div className="flex flex-col gap-8">
      <RoleDashboardSummary
        title="Cardiología"
        description="Casos derivados para confirmación diagnóstica y resolución especializada."
        metrics={[
          {
            icon: HeartPulse,
            label: "Pendientes de resolución",
            value: String(referredCases.length),
            note: "Casos que esperan diagnóstico o resolución definitiva.",
          },
          {
            icon: ShieldCheck,
            label: "Casos resueltos / Cerrados",
            value: String(historyCases.length),
            note: "Pacientes con diagnóstico definitivo y seguimiento cerrado.",
          },
          {
            icon: ArrowUpRight,
            label: "Total en plataforma",
            value: String(patients.length),
            note: "Total general de pacientes en el circuito de insuficiencia cardíaca.",
          },
        ]}
      />

      <div className="flex flex-col gap-6">
        <CaseQueueTable
          title="Casos Requiriendo Acción"
          description="Pacientes derivados para confirmación diagnóstica y conducta terapéutica especializada."
          cases={referredCases}
          role="cardiologia"
          guide={guide}
        />

        <CaseQueueTable
          title="Historial de Casos Cerrados"
          description="Pacientes que ya fueron diagnosticados y su circuito de seguimiento está cerrado."
          cases={historyCases}
          role="cardiologia"
          guide={guide}
          readOnly={true}
        />
      </div>
    </div>
  );
}
