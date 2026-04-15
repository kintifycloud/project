export type HistoryItem = {
  id: string;
  input: string;
  output: string;
  trace?: string;
  createdAt: number;
};

const STORAGE_KEY = "kintify_history";
const MAX_ITEMS = 20;

// Generate unique ID for history items
export function generateHistoryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Get all history items from localStorage (newest first)
export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Save a new history item (prepends, limits to MAX_ITEMS)
export function saveToHistory(item: Omit<HistoryItem, "id" | "createdAt">): HistoryItem {
  const newItem: HistoryItem = {
    ...item,
    id: generateHistoryId(),
    createdAt: Date.now(),
  };

  try {
    const history = getHistory();
    const updated = [newItem, ...history].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore localStorage errors (e.g., quota exceeded)
  }

  return newItem;
}

// Delete a history item by ID
export function deleteFromHistory(id: string): void {
  try {
    const history = getHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore localStorage errors
  }
}

// Clear all history
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore localStorage errors
  }
}

// Format relative time (e.g., "2h ago", "1d ago")
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
