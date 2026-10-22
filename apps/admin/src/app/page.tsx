import { Sidebar } from "@/components/sidebar";
import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <DashboardPlaceholder />
      </main>
    </div>
  );
}
