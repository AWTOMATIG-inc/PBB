"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/lib/session";
import {
  createBrand,
  deleteBrand,
  updateBrand,
  createPowerBand,
  deletePowerBand,
  updatePowerBand,
} from "@/lib/products";
import { describePbError } from "@/lib/pb-error";
import { parseOptionalInteger, parseOptionalNumber } from "@/lib/validation";

export type FilterFormState = { error: string } | undefined;

function buildBrandPayload(formData: FormData): { payload: FormData; error?: string } {
  const payload = new FormData();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!name || !slug) {
    return { payload, error: "Name and slug are required." };
  }
  payload.set("name", name);
  payload.set("slug", slug);

  const sortOrderRaw = String(formData.get("sortOrder") ?? "").trim();
  const { value: sortOrder, error: sortOrderError } = parseOptionalInteger(
    sortOrderRaw,
    "Sort order"
  );
  if (sortOrderError) return { payload, error: sortOrderError };
  payload.set("sortOrder", sortOrder || "0");

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    payload.set("logo", logo);
  } else if (formData.get("removeLogo")) {
    payload.set("logo", "");
  }

  return { payload };
}

function buildPowerBandPayload(formData: FormData): { payload: FormData; error?: string } {
  const payload = new FormData();

  const value = String(formData.get("value") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!value || !label) {
    return { payload, error: "Value and label are required." };
  }
  payload.set("value", value);
  payload.set("label", label);

  const errors: string[] = [];

  const minKvaRaw = String(formData.get("minKva") ?? "").trim();
  const { value: minKva, error: minKvaError } = parseOptionalNumber(minKvaRaw, "Min kVA");
  if (minKvaError) errors.push(minKvaError);

  const maxKvaRaw = String(formData.get("maxKva") ?? "").trim();
  const { value: maxKva, error: maxKvaError } = parseOptionalNumber(maxKvaRaw, "Max kVA");
  if (maxKvaError) errors.push(maxKvaError);

  if (!minKvaError && !maxKvaError && minKva && maxKva && Number(maxKva) < Number(minKva)) {
    errors.push("Max kVA must be greater than or equal to Min kVA.");
  }

  const sortOrderRaw = String(formData.get("sortOrder") ?? "").trim();
  const { value: sortOrder, error: sortOrderError } = parseOptionalInteger(
    sortOrderRaw,
    "Sort order"
  );
  if (sortOrderError) errors.push(sortOrderError);

  if (errors.length) return { payload, error: errors.join(" ") };

  if (minKva) payload.set("minKva", minKva);
  if (maxKva) payload.set("maxKva", maxKva);
  payload.set("sortOrder", sortOrder || "0");

  return { payload };
}

export async function createBrandAction(
  _prevState: FilterFormState,
  formData: FormData
): Promise<FilterFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const { payload, error } = buildBrandPayload(formData);
  if (error) return { error };

  const res = await createBrand(token, payload);
  if (!res.ok) return { error: describePbError(res.status, await res.json().catch(() => null)) };

  revalidatePath("/admin/filters");
  revalidatePath("/");
  revalidatePath("/products");
}

export async function updateBrandAction(
  id: string,
  _prevState: FilterFormState,
  formData: FormData
): Promise<FilterFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const { payload, error } = buildBrandPayload(formData);
  if (error) return { error };

  const res = await updateBrand(token, id, payload);
  if (!res.ok) return { error: describePbError(res.status, await res.json().catch(() => null)) };

  revalidatePath("/admin/filters");
  revalidatePath("/");
  revalidatePath("/products");
}

export async function deleteBrandAction(id: string) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const res = await deleteBrand(token, id);
  if (!res.ok) {
    throw new Error(describePbError(res.status, await res.json().catch(() => null)));
  }
  revalidatePath("/admin/filters");
  revalidatePath("/");
  revalidatePath("/products");
}

export async function createPowerBandAction(
  _prevState: FilterFormState,
  formData: FormData
): Promise<FilterFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const { payload, error } = buildPowerBandPayload(formData);
  if (error) return { error };

  const res = await createPowerBand(token, payload);
  if (!res.ok) return { error: describePbError(res.status, await res.json().catch(() => null)) };

  revalidatePath("/admin/filters");
  revalidatePath("/");
  revalidatePath("/products");
}

export async function updatePowerBandAction(
  id: string,
  _prevState: FilterFormState,
  formData: FormData
): Promise<FilterFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const { payload, error } = buildPowerBandPayload(formData);
  if (error) return { error };

  const res = await updatePowerBand(token, id, payload);
  if (!res.ok) return { error: describePbError(res.status, await res.json().catch(() => null)) };

  revalidatePath("/admin/filters");
  revalidatePath("/");
  revalidatePath("/products");
}

export async function deletePowerBandAction(id: string) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const res = await deletePowerBand(token, id);
  if (!res.ok) {
    throw new Error(describePbError(res.status, await res.json().catch(() => null)));
  }
  revalidatePath("/admin/filters");
  revalidatePath("/");
  revalidatePath("/products");
}
