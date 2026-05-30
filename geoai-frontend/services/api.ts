import { supabase } from "@/services/supabaseClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// 🔐 Attach Supabase token
async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: await authHeaders(),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} — ${endpoint}`);
    return res.json();
  },

  post: async (endpoint: string, body: object) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} — ${endpoint}`);
    return res.json();
  },
};