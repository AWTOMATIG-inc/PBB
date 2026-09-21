"use server";

import { redirect } from "next/navigation";
import { authenticateSuperuser } from "@/lib/pocketbase";
import { clearAdminSession, setAdminSession } from "@/lib/session";

export type LoginState = { error: string } | undefined;

export async function login(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const identity = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identity || !password) {
    return { error: "Enter both email and password." };
  }

  const result = await authenticateSuperuser(identity, password);
  if (!result) {
    return { error: "Invalid email or password." };
  }

  await setAdminSession(result.token);
  redirect("/admin");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin/login");
}
