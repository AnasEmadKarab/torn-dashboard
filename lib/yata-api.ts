// lib/yata-api.ts
const YATA_BASE = "https://yata.yt/api/v1";

export interface YataStockItem {
  id: number;
  name: string;
  quantity: number;
  cost: number;
}

export interface YataCountryData {
  name: string;
  update: number;
  stocks: YataStockItem[];
}

export interface YataTravelExport {
  uk: YataCountryData;
  japan: YataCountryData;
}

export async function fetchYataTravelExport(): Promise<YataTravelExport> {
  const res = await fetch(`${YATA_BASE}/travel/export/`, { cache: "no-store" });
  if (!res.ok) throw new Error(`YATA API error: ${res.status}`);
  const raw = await res.json();

  const countries = { uk: "United Kingdom", japan: "Japan" };
  const result: Partial<YataTravelExport> = {};

  for (const [key, name] of Object.entries(countries)) {
    const country = raw.stocks?.[name];
    result[key as "uk" | "japan"] = {
      name,
      update: country?.update ?? Date.now() / 1000,
      stocks: country?.stocks ?? [],
    };
  }

  return result as YataTravelExport;
}

export function extractXanaxStock(country: YataCountryData) {
  const xanax = country.stocks.find((item) => item.name === "Xanax");
  return {
    quantity: xanax?.quantity ?? 0,
    cost: xanax?.cost ?? 0,
    timestamp: country.update,
  };
}