import { DiagnoseClient } from "@/components/DiagnoseClient";

export const dynamic = "force-dynamic";

export default function ScanPage({ searchParams }: { searchParams: { plant?: string } }) {
  return <DiagnoseClient plantId={searchParams.plant} />;
}
