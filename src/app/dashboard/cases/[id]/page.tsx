import { notFound } from "next/navigation";
import { CaseDetailView } from "@/components/case-detail-view";
import { getCaseById, type RoleKey } from "@/lib/demo-data";

type DashboardCaseDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function resolveRole(value: string | string[] | undefined, fallback: RoleKey): RoleKey {
  if (value === "enfermeria" || value === "medico" || value === "cardiologia") {
    return value;
  }

  return fallback;
}

export default async function DashboardCaseDetailPage({
  params,
  searchParams,
}: DashboardCaseDetailPageProps) {
  const route = await params;
  const query = (await searchParams) ?? {};
  const guide = typeof query.guide === "string" ? query.guide : "on";
  const patientCase = getCaseById(route.id);

  if (!patientCase) {
    notFound();
  }

  const activeRole = resolveRole(query.role, patientCase.workflow.nextRole);

  return (
    <CaseDetailView patientCase={patientCase} activeRole={activeRole} guide={guide} />
  );
}
