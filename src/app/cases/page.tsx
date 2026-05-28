import { redirect } from "next/navigation";

type CasesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = (await searchParams) ?? {};
  const nextParams = new URLSearchParams();

  if (typeof params.guide === "string") {
    nextParams.set("guide", params.guide);
  }

  const query = nextParams.toString();
  redirect(query ? `/dashboard/nursing?${query}` : "/dashboard/nursing");
}
