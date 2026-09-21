// Turns a failed PocketBase REST response body into a user-facing message.
// Shared by admin server actions (products, filters) that submit FormData
// straight to PocketBase and need to surface its validation errors.

export function describePbError(status: number, body: unknown): string {
  if (status === 400 && body && typeof body === "object" && "data" in body) {
    const data = (body as { data?: Record<string, { message?: string }> }).data;
    if (data) {
      const messages = Object.entries(data)
        .map(([field, err]) => `${field}: ${err?.message ?? "invalid"}`)
        .join("; ");
      if (messages) return messages;
    }
  }
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: string }).message;
    if (message) return message;
  }
  return "Something went wrong. Please try again.";
}
