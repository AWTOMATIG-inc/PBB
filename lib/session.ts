import { cookies } from "next/headers";
import { ADMIN_AUTH_COOKIE, ADMIN_AUTH_COOKIE_OPTIONS } from "./auth-cookie";

export async function setAdminSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_AUTH_COOKIE, token, ADMIN_AUTH_COOKIE_OPTIONS);
}

export async function getAdminSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_AUTH_COOKIE);
}
