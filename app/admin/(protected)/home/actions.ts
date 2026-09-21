"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/lib/session";
import {
  createHomePlacement,
  deleteHomePlacement,
  listHomePlacements,
  updateHomePlacement,
  type HomeSection,
} from "@/lib/products";
import { describePbError } from "@/lib/pb-error";
import { HOME_SECTION_LIMITS } from "@/lib/home-section-limits";

export type HomePlacementFormState = { error: string } | undefined;

export async function addHomePlacementAction(
  section: HomeSection,
  _prevState: HomePlacementFormState,
  formData: FormData
): Promise<HomePlacementFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const product = String(formData.get("product") ?? "").trim();
  if (!product) return { error: "Choose a product to add." };

  const existing = await listHomePlacements(token);
  const sortOrder = existing.filter((p) => p.section === section).length;
  const limit = HOME_SECTION_LIMITS[section];
  if (sortOrder >= limit) {
    return { error: `This section is limited to ${limit} products. Remove one before adding another.` };
  }

  const payload = new FormData();
  payload.set("section", section);
  payload.set("product", product);
  payload.set("sortOrder", String(sortOrder));

  const res = await createHomePlacement(token, payload);
  if (!res.ok) return { error: describePbError(res.status, await res.json().catch(() => null)) };

  revalidatePath("/admin/home");
  revalidatePath("/");
}

export async function deleteHomePlacementAction(id: string) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const res = await deleteHomePlacement(token, id);
  if (!res.ok) {
    throw new Error(describePbError(res.status, await res.json().catch(() => null)));
  }
  revalidatePath("/admin/home");
  revalidatePath("/");
}

export async function moveHomePlacementAction(
  section: HomeSection,
  id: string,
  direction: "up" | "down"
) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const items = (await listHomePlacements(token))
    .filter((p) => p.section === section)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const index = items.findIndex((p) => p.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= items.length) return;

  const current = items[index];
  const swap = items[swapIndex];

  const currentPayload = new FormData();
  currentPayload.set("sortOrder", String(swap.sortOrder));
  const swapPayload = new FormData();
  swapPayload.set("sortOrder", String(current.sortOrder));

  const [currentRes, swapRes] = await Promise.all([
    updateHomePlacement(token, current.id, currentPayload),
    updateHomePlacement(token, swap.id, swapPayload),
  ]);
  if (!currentRes.ok || !swapRes.ok) {
    throw new Error("Failed to reorder.");
  }
  revalidatePath("/admin/home");
  revalidatePath("/");
}
