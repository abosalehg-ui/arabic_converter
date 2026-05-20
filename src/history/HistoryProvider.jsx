import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';

const HistoryContext = createContext(null);
const MAX_ENTRIES = 50;
const MAX_TEXT = 5000;

function truncate(s) {
  if (!s) return s;
  return s.length > MAX_TEXT ? s.slice(0, MAX_TEXT) + '…' : s;
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function HistoryProvider({ children }) {
  const [entries, setEntries] = useState(() => {
    const saved = getItem(STORAGE_KEYS.history, []);
    return Array.isArray(saved) ? saved : [];
  });

  useEffect(() => {
    setItem(STORAGE_KEYS.history, entries);
  }, [entries]);

  const addEntry = useCallback((entry) => {
    if (!entry || !entry.input || !entry.output) return;
    setEntries((prev) => {
      const next = [
        {
          id: makeId(),
          ts: Date.now(),
          type: entry.type,
          input: truncate(entry.input),
          output: truncate(entry.output),
          meta: entry.meta,
        },
        ...prev,
      ];
      return next.slice(0, MAX_ENTRIES);
    });
  }, []);

  const removeEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => setEntries([]), []);

  const value = useMemo(
    () => ({ entries, addEntry, removeEntry, clearAll }),
    [entries, addEntry, removeEntry, clearAll]
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used inside HistoryProvider');
  return ctx;
}
