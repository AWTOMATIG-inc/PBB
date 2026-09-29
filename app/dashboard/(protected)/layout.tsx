import AdminSidebar from "@/components/admin/admin-sidebar";
import { verifyAdminSession } from "@/lib/auth";

export default async function AdminProtectedLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const admin = await verifyAdminSession();

  return (
    <AdminSidebar email={admin.email}>
      {children}
    </AdminSidebar>
  );
}
