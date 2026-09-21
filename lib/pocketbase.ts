// Talks to PocketBase's REST API directly (no SDK dependency), matching the
// convention already used by scripts/migrate-products.mjs.

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

type SuperuserAuthResponse = {
  token: string;
  record: { id: string; email: string };
};

async function pbFetch(
  endpoint: string,
  token: string | undefined,
  init: RequestInit = {}
) {
  return fetch(`${POCKETBASE_URL}${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });
}

export async function authenticateSuperuser(
  identity: string,
  password: string
): Promise<SuperuserAuthResponse | null> {
  const res = await pbFetch(
    "/api/collections/_superusers/auth-with-password",
    undefined,
    {
      method: "POST",
      body: JSON.stringify({ identity, password }),
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function refreshSuperuserAuth(
  token: string
): Promise<SuperuserAuthResponse | null> {
  const res = await pbFetch(
    "/api/collections/_superusers/auth-refresh",
    token,
    { method: "POST" }
  );
  if (!res.ok) return null;
  return res.json();
}
