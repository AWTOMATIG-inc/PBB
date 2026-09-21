import AdminNav from "@/components/admin/admin-nav";
import { verifyAdminSession } from "@/lib/auth";

export default async function AdminProtectedLayout({
  children,
}: LayoutProps<"/admin">) {
  const admin = await verifyAdminSession();

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <AdminNav email={admin.email} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
