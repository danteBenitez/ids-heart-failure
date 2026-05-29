"use client";

import { useParams, useSearchParams } from "next/navigation";
import { CaseDetailView } from "@/components/case-detail-view";
import { usePatientStore } from "@/stores/patient-store";
import type { RoleKey } from "@/lib/types";

function resolveRole(value: string | null, fallback: RoleKey): RoleKey {
  if (value === "enfermeria" || value === "medico" || value === "cardiologia") {
    return value;
  }
  return fallback;
}

export default function DashboardCaseDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const guide = searchParams.get("guide") ?? "on";
  const roleParam = searchParams.get("role");

  const patients = usePatientStore((s) => s.patients);
  const isHydrated = usePatientStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-20 animate-pulse rounded-2xl bg-muted/50" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    );
  }

  const patientCase = patients.find((p) => p.id === id);

  if (!patientCase) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg font-semibold">Caso no encontrado</p>
        <p className="text-sm text-muted-foreground">
          No se encontró un paciente con el identificador indicado.
        </p>
      </div>
    );
  }

  const activeRole = resolveRole(roleParam, patientCase.workflow.nextRole);

  return (
    <CaseDetailView
      patientCase={patientCase}
      activeRole={activeRole}
      guide={guide}
    />
  );
}
