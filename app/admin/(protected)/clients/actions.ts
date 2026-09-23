"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/lib/session";
import { createClient, deleteClient, updateClient } from "@/lib/products";
import { describePbError } from "@/lib/pb-error";
import { parseOptionalInteger } from "@/lib/validation";

export type ClientFormState = { error: string } | undefined;

function buildClientPayload(formData: FormData): { payload: FormData; error?: string } {
  const payload = new FormData();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { payload, error: "Client name is required." };
  payload.set("name", name);

  const { value: sortOrder, error: sortOrderError } = parseOptionalInteger(
    String(formData.get("sortOrder") ?? "").trim(),
    "Display order"
  );
  if (sortOrderError) return { payload, error: sortOrderError };
  payload.set("sortOrder", sortOrder || "0");

  payload.set("featured", formData.get("featured") ? "true" : "false");
  payload.set("isActive", formData.get("isActive") ? "true" : "false");

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    payload.set("logo", logo);
  } else if (formData.get("removeLogo")) {
    payload.set("logo", "");
  }

  return { payload };
}

/**
 * Same silent-drop risk as the products pricing fields: until the clients
 * migration (1789554846) has run on this PocketBase instance, the collection
 * doesn't exist and every call 404s. Say so plainly instead of PocketBase's
 * generic "not found".
 */
function describeClientError(status: number, body: unknown) {
  if (status === 404) {
    return "The clients table doesn't exist yet. Restart PocketBase so its pending migrations apply, then try again.";
  }
  return describePbError(status, body);
}

function revalidateClientPages() {
  revalidatePath("/admin/clients");
  revalidatePath("/");
}

export async function createClientAction(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const { payload, error } = buildClientPayload(formData);
  if (error) return { error };

  const res = await createClient(token, payload);
  if (!res.ok) {
    return { error: describeClientError(res.status, await res.json().catch(() => null)) };
  }

  revalidateClientPages();
}

export async function updateClientAction(
  id: string,
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const { payload, error } = buildClientPayload(formData);
  if (error) return { error };

  const res = await updateClient(token, id, payload);
  if (!res.ok) {
    return { error: describeClientError(res.status, await res.json().catch(() => null)) };
  }

  revalidateClientPages();
}

export async function deleteClientAction(id: string) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const res = await deleteClient(token, id);
  if (!res.ok) {
    throw new Error(describeClientError(res.status, await res.json().catch(() => null)));
  }
  revalidateClientPages();
}
