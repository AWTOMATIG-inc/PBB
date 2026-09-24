"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/lib/session";
import { createProduct, deleteProduct, updateProduct } from "@/lib/products";
import { describePbError } from "@/lib/pb-error";
import { parseFuelTank, parseOptionalNumber } from "@/lib/validation";

export type ProductFormState = { error: string } | undefined;

const TEXT_FIELDS = ["engineModel", "alternator", "alternatorMake", "controller", "notes"] as const;
const NUMBER_FIELDS = [
  { name: "standbyKva", label: "Standby kVA" },
  { name: "primeKva", label: "Prime kVA" },
  { name: "weightKg", label: "Weight" },
] as const;
const CURRENCIES = ["BDT", "USD"] as const;

function buildProductPayload(formData: FormData): { payload: FormData; error?: string } {
  const payload = new FormData();

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const powerBand = String(formData.get("powerBand") ?? "").trim();
  if (!brand || !model || !powerBand) {
    return { payload, error: "Brand, model, and power band are required." };
  }
  payload.set("brand", brand);
  payload.set("model", model);
  payload.set("powerBand", powerBand);

  const errors: string[] = [];

  for (const { name, label } of NUMBER_FIELDS) {
    const raw = String(formData.get(name) ?? "").trim();
    const { value, error } = parseOptionalNumber(raw, label);
    if (error) errors.push(error);
    else if (value) payload.set(name, value);
  }

  const { value: fuelTank, error: fuelTankError } = parseFuelTank(
    String(formData.get("fuelTank") ?? "").trim()
  );
  if (fuelTankError) errors.push(fuelTankError);
  else payload.set("fuelTank", fuelTank ?? "");

  // Pricing (PBB-09/10). Unlike the fields above, price is always sent so
  // clearing it in the form actually clears it (PocketBase stores "" as 0,
  // which the public site treats as "no price").
  const { value: price, error: priceError } = parseOptionalNumber(
    String(formData.get("price") ?? "").trim(),
    "Price"
  );
  const showPrice = Boolean(formData.get("showPrice"));
  const currency = String(formData.get("currency") ?? "BDT");
  if (priceError) errors.push(priceError);
  else if (showPrice && !Number(price)) errors.push("Enter a price above 0 to show it.");
  if (!CURRENCIES.includes(currency as (typeof CURRENCIES)[number])) {
    errors.push("Currency must be BDT or USD.");
  }
  payload.set("price", price ?? "");
  payload.set("currency", currency);
  payload.set("showPrice", showPrice ? "true" : "false");

  if (errors.length) return { payload, error: errors.join(" ") };

  for (const field of TEXT_FIELDS) {
    payload.set(field, String(formData.get(field) ?? "").trim());
  }

  const specsRaw = String(formData.get("specs") ?? "").trim();
  if (specsRaw) {
    try {
      payload.set("specs", JSON.stringify(JSON.parse(specsRaw)));
    } catch {
      return { payload, error: "Specs must be valid JSON." };
    }
  } else {
    payload.set("specs", "{}");
  }

  payload.set("isActive", formData.get("isActive") ? "true" : "false");

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    payload.set("image", image);
  } else if (formData.get("removeImage")) {
    payload.set("image", "");
  }

  return { payload };
}

/**
 * PocketBase silently drops fields its schema doesn't have, so if the
 * pricing migration (1789554845) hasn't been applied on this instance yet
 * (it runs when `pocketbase serve` starts), a save "succeeds" with the price
 * thrown away. Detect that from the saved record instead of failing silently.
 */
async function missingPricingFieldsError(res: Response): Promise<ProductFormState> {
  const record = await res.json().catch(() => null);
  if (record && !("showPrice" in record)) {
    return {
      error:
        "Saved, but the price was not stored: the database is missing the pricing fields. Restart PocketBase so its pending migrations apply, then save again.",
    };
  }
  return undefined;
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const { payload, error } = buildProductPayload(formData);
  if (error) return { error };

  const res = await createProduct(token, payload);
  if (!res.ok) {
    return { error: describePbError(res.status, await res.json().catch(() => null)) };
  }
  const pricingError = await missingPricingFieldsError(res);

  revalidatePath("/");
  revalidatePath("/products");
  if (pricingError) return pricingError;
  redirect("/admin/products");
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const { payload, error } = buildProductPayload(formData);
  if (error) return { error };

  const res = await updateProduct(token, id, payload);
  if (!res.ok) {
    return { error: describePbError(res.status, await res.json().catch(() => null)) };
  }
  const pricingError = await missingPricingFieldsError(res);

  revalidatePath("/");
  revalidatePath("/products");
  if (pricingError) return pricingError;
  redirect("/admin/products");
}

export async function deleteProductAction(id: string) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  await deleteProduct(token, id);
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
}
