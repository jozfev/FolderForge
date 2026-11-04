import { HistoryEntry } from '../core/models';

const STORAGE_KEY = 'folderforge_history';
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load history:', e);
  }
  return [];
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'date'>): void {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString()
  };
  
  history.unshift(newEntry);
  
  // Keep only max entries
  if (history.length > MAX_ENTRIES) {
    history.length = MAX_ENTRIES;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function deleteHistoryEntry(id: string): void {
  const history = getHistory().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
