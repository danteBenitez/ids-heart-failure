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
    (p) =>
      p.workflow.nextRole === "cardiologia" ||
      p.workflow.status === "Derivado a cardiología",
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
            value: "Cierre del caso",
            note: "Cardiología registra el diagnóstico y cierra el caso.",
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
