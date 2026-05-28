"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClipboardPlus, Clock3, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaseQueueTable } from "@/components/case-queue-table";
import { RoleDashboardSummary } from "@/components/role-dashboard-summary";
import { usePatientStore } from "@/stores/patient-store";

export default function NursingPage() {
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

  const pendingCases = patients.filter(
    (p) =>
      p.workflow.nextRole === "enfermeria" ||
      p.workflow.status === "Pendiente de triaje",
  );

  const reviewNeeded = patients.filter(
    (p) =>
      p.workflow.nextRole === "enfermeria" &&
      (p.modelInput.restingBP === 0 ||
        p.modelInput.cholesterol === 0 ||
        p.modelInput.maxHR === 0),
  ).length;

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
            value: String(
              patients.filter((p) => p.workflow.status === "Pendiente de triaje").length,
            ),
            note: "Pacientes que aún no pasaron por enfermería.",
          },
          {
            icon: TriangleAlert,
            label: "Revisión requerida",
            value: String(reviewNeeded),
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
