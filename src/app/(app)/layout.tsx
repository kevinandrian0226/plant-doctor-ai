import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";

// Layout untuk area aplikasi (terproteksi). Middleware juga melindungi, ini lapisan kedua.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Navbar email={user.email} />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:pb-10">{children}</main>
    </div>
  );
}
