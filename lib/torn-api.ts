// lib/torn-api.ts
const BASE = "https://api.torn.com/v2";

export async function tornFetch<T>(endpoint: string, apiKey: string, selections: string): Promise<T> {
  const res = await fetch(`${BASE}/${endpoint}?selections=${selections}&key=${apiKey}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Torn API error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.error);
  return data as T;
}