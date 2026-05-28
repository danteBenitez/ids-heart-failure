import { redirect } from "next/navigation";

type HomeProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = (await searchParams) ?? {};
  const nextParams = new URLSearchParams();

  if (typeof params.guide === "string") {
    nextParams.set("guide", params.guide);
  }

  const query = nextParams.toString();
  redirect(query ? `/dashboard?${query}` : "/dashboard");
}
