import { redirect } from "next/navigation";

export default function DiagnoseRedirect({
  searchParams,
}: {
  searchParams: { plant?: string };
}) {
  redirect(searchParams.plant ? `/scan?plant=${searchParams.plant}` : "/scan");
}
