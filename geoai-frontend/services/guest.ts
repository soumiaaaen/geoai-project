import { getApiBaseUrl } from "@/lib/apiBase";

const STORAGE_ID = "hydrosight_guest_id";
const STORAGE_TOKEN = "hydrosight_guest_token";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== "number") return true;
  return Date.now() >= exp * 1000 - 60_000;
}

export function getStoredGuestToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_TOKEN);
}

export function clearGuestSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_ID);
  localStorage.removeItem(STORAGE_TOKEN);
}

export async function ensureGuestSession(): Promise<string> {
  const existing = getStoredGuestToken();
  const guestId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_ID) : null;

  if (existing && !isTokenExpired(existing)) {
    return existing;
  }

  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(guestId ? { guestId } : {}),
  });

  if (!res.ok) {
    throw new Error("Impossible de démarrer la session démo.");
  }

  const data = (await res.json()) as { token: string; guestId: string };
  localStorage.setItem(STORAGE_ID, data.guestId);
  localStorage.setItem(STORAGE_TOKEN, data.token);
  return data.token;
}
