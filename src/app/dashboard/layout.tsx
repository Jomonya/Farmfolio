import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="container-page grid gap-8 py-10 md:grid-cols-[220px_1fr]">
      <DashboardSidebar />
      <div className="min-w-0">
        <p className="text-sm text-neutral-500">
          Signed in as {user.name || user.email}
        </p>
        {children}
      </div>
    </div>
  );
}
