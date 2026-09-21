import { cache } from "react";
import { redirect } from "next/navigation";
import { getAdminSessionToken } from "./session";
import { refreshSuperuserAuth } from "./pocketbase";

// Verifies the session cookie against PocketBase on every call, memoized per
// request via React's cache() so layout + page can both call it for free.
export const verifyAdminSession = cache(async () => {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const result = await refreshSuperuserAuth(token);
  if (!result) redirect("/admin/login");

  return result.record;
});
