/** Backend API root — same as services/api.ts */
export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return base.replace(/\/$/, "");
}
