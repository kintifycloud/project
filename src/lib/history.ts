export type HistoryEntry = {
  input: string;
  slug: string;
  problem: string;
  timestamp: number;
};

const STORAGE_KEY = "kintify_history";
const MAX_ENTRIES = 3;

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: HistoryEntry): void {
  try {
    const history = getHistory();
    const updated = [entry, ...history.filter((h) => h.slug !== entry.slug)].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore localStorage errors
  }
}
