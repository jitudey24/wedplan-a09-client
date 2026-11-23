import { authClient } from "@/lib/auth-client";

/**
 * API calls go through the same origin (relative URLs).
 * `next.config.ts` rewrites `/api/v1/*` to the Express backend, so the
 * Better Auth session cookie is first-party and is forwarded automatically.
 *
 * Set NEXT_PUBLIC_API_URL only if you intentionally want to call the backend
 * directly (cross-origin). Leave it empty in production.
 */
const API_URL: string = (process.env.NEXT_PUBLIC_API_URL || "").replace(
  /\/+$/,
  "",
);

async function getToken(): Promise<string | undefined> {
  try {
    const { data, error } = await authClient.token();
    if (!error && data?.token) return data.token;
  } catch {
    // Session cookie can still authenticate the request.
  }
  return undefined;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const response = await fetch(`${API_URL}${cleanEndpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  const result = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null
        ? result.message || result.error
        : result;

    throw new Error(message || `API request failed: ${response.status}`);
  }

  return result as T;
}
