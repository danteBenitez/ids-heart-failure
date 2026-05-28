import { redirect } from "next/navigation";

type LegacyCaseDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyCaseDetailPage({
  params,
  searchParams,
}: LegacyCaseDetailPageProps) {
  const route = await params;
  const query = (await searchParams) ?? {};
  const nextParams = new URLSearchParams();

  if (typeof query.guide === "string") {
    nextParams.set("guide", query.guide);
  }

  if (typeof query.role === "string") {
    nextParams.set("role", query.role);
  }

  const nextQuery = nextParams.toString();
  redirect(
    nextQuery
      ? `/dashboard/cases/${route.id}?${nextQuery}`
      : `/dashboard/cases/${route.id}`,
  );
}
