import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSessionToken } from "@/lib/session";
import { clientLogoUrl, listClients, type ClientRecord } from "@/lib/products";
import ClientsManager from "@/components/admin/clients-manager";

export const metadata: Metadata = {
  title: "Clients | Admin | Power Bank Bangladesh",
};

export default async function AdminClientsPage() {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  // Before the clients migration has run on this PocketBase instance, the
  // collection doesn't exist yet; show the fix instead of a crash page.
  let clients: ClientRecord[] | null = null;
  try {
    clients = await listClients(token);
  } catch {
    clients = null;
  }
  const logoUrls = Object.fromEntries(
    (clients ?? []).map((client) => [client.id, clientLogoUrl(client)])
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Clients</h1>
        <p className="mt-1 text-sm text-ink-500">
          Active, featured clients appear in the Home page &quot;Our Clients&quot; strip, in
          display order. With none, that section is hidden.
        </p>
      </div>

      {clients ? (
        <ClientsManager clients={clients} logoUrls={logoUrls} />
      ) : (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn&apos;t load clients. If this is a fresh deploy, restart PocketBase so the
          clients migration applies, then reload this page.
        </p>
      )}
    </div>
  );
}
