import { supabase } from "@/services/supabaseClient";
import { ensureGuestSession } from "@/services/guest";
import { getApiBaseUrl } from "@/lib/apiBase";

const BASE_URL = getApiBaseUrl();

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session: existing } } = await supabase.auth.getSession();
  if (existing?.access_token) {
    const { data: refreshData } = await supabase.auth.refreshSession();
    const session = refreshData.session ?? existing;
    if (session?.access_token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };
    }
  }

  const guestToken = await ensureGuestSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${guestToken}`,
  };
}

async function parseError(res: Response, endpoint: string): Promise<Error> {
  try {
    const data = await res.json();
    const detail = data?.detail;
    if (typeof detail === "string") return new Error(detail);
    if (Array.isArray(detail)) {
      return new Error(detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", "));
    }
  } catch {
    /* ignore */
  }
  return new Error(`HTTP ${res.status} — ${endpoint}`);
}

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: await authHeaders(),
    });

    if (!res.ok) throw await parseError(res, endpoint);
    return res.json();
  },

  post: async (endpoint: string, body: object) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) throw await parseError(res, endpoint);
    return res.json();
  },

  /** Guest session bootstrap (no auth header required). */
  postPublic: async (endpoint: string, body: object) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await parseError(res, endpoint);
    return res.json();
  },
};
