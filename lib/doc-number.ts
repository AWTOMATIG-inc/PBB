// Sequential document numbers ("INV-2026-0007", "MR-2026-0003") for admin
// collections. The unique index on the number field is the real guard
// against duplicates; callers retry when two saves race for the same number.

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

export async function nextSequentialNumber(
  token: string,
  { collection, field, prefix }: { collection: string; field: string; prefix: string }
): Promise<string> {
  const params = new URLSearchParams({
    page: "1",
    perPage: "1",
    sort: `-${field}`,
    filter: `${field} ~ "${prefix}%"`,
    fields: field,
    skipTotal: "1",
  });
  const res = await fetch(
    `${POCKETBASE_URL}/api/collections/${collection}/records?${params.toString()}`,
    { headers: { Authorization: token }, cache: "no-store" }
  );
  let last = 0;
  if (res.ok) {
    const data = await res.json();
    const match = String(data.items?.[0]?.[field] ?? "").match(/-(\d+)$/);
    if (match) last = Number(match[1]);
  }
  return `${prefix}${String(last + 1).padStart(4, "0")}`;
}

/**
 * Today's date (YYYY-MM-DD) in Bangladesh (UTC+6, no DST), so a document
 * created just after midnight Dhaka time isn't dated the previous day on a
 * UTC server.
 */
export function todayInDhaka(): string {
  return new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().split("T")[0];
}

/** True when a failed PocketBase save was rejected because `field` is not unique. */
export function isDuplicateNumberError(body: unknown, field: string): boolean {
  const data = (body as { data?: Record<string, { code?: string }> })?.data;
  return data?.[field]?.code === "validation_not_unique";
}
