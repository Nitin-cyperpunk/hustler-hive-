import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return <AdminShell session={session}>{children}</AdminShell>;
}
