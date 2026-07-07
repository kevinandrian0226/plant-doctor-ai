import { redirect } from "next/navigation";

export default function PlantDetailRedirect({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  redirect(searchParams.tab ? `/plants/${params.id}?tab=${searchParams.tab}` : `/plants/${params.id}`);
}
