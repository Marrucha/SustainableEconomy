const STORAGE_PREFIX = 'sustainable_economy_1880_v1_';

export function loadPersistedState<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function savePersistedState<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignoruj przekroczenie limitu localStorage
  }
}

export function clearAllPersistedGameState(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Ignore storage errors
  }
}

const SAVE_SLOTS_KEY = 'sustainable_economy_1880_saves_v1';

export interface SaveSlotEntry {
  id: string;
  name: string;
  savedAtIso: string;
  gameDateLabel: string;
  gold: number;
  snapshot: Record<string, string>;
}

export function loadSaveSlots(): SaveSlotEntry[] {
  try {
    const raw = window.localStorage.getItem(SAVE_SLOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSaveSlots(slots: SaveSlotEntry[]): void {
  try {
    window.localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
  } catch {
    // Ignoruj przekroczenie limitu localStorage
  }
}

export function createSaveSlot(
  name: string,
  gameDateLabel: string,
  gold: number
): SaveSlotEntry[] {
  const snapshot: Record<string, string> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        const val = window.localStorage.getItem(k);
        if (val !== null) snapshot[k] = val;
      }
    }
  } catch {
    // Ignore storage errors
  }

  const entry: SaveSlotEntry = {
    id: `save_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim() || `Zapis (${gameDateLabel})`,
    savedAtIso: new Date().toISOString(),
    gameDateLabel,
    gold,
    snapshot,
  };
  const updated = [entry, ...loadSaveSlots()];
  persistSaveSlots(updated);
  return updated;
}

export function deleteSaveSlot(id: string): SaveSlotEntry[] {
  const updated = loadSaveSlots().filter((s) => s.id !== id);
  persistSaveSlots(updated);
  return updated;
}

export function restoreSaveSlot(slot: SaveSlotEntry): void {
  clearAllPersistedGameState();
  try {
    Object.entries(slot.snapshot).forEach(([k, v]) => {
      if (k.startsWith(STORAGE_PREFIX)) {
        window.localStorage.setItem(k, v);
      }
    });
  } catch {
    // Ignore storage errors
  }
}
