import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getItem, removeItem, setItem, STORAGE_KEYS } from '../lib/storage';

const HistoryContext = createContext(null);
const MAX_ENTRIES = 50;
const MAX_TEXT = 5000;

function truncate(text) {
  if (!text) return text;
  return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…` : text;
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const VALID_TYPES = new Set(['text', 'file', 'color', 'quoted']);

/**
 * Entries come back from localStorage, which any other page on the same origin
 * can write to. Everything read from there is checked before it is trusted.
 */
function isValidEntry(entry) {
  return (
    !!entry &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    typeof entry.ts === 'number' &&
    Number.isFinite(entry.ts) &&
    VALID_TYPES.has(entry.type) &&
    typeof entry.input === 'string' &&
    typeof entry.output === 'string'
  );
}

function loadEntries() {
  const saved = getItem(STORAGE_KEYS.history, []);
  return Array.isArray(saved) ? saved.filter(isValidEntry).slice(0, MAX_ENTRIES) : [];
}

function loadPersistPreference() {
  const saved = getItem(STORAGE_KEYS.historyEnabled);
  return saved === false ? false : true;
}

export function HistoryProvider({ children }) {
  const [persist, setPersistState] = useState(loadPersistPreference);
  const [entries, setEntries] = useState(() =>
    loadPersistPreference() ? loadEntries() : []
  );
  /** Set when a write fails so the UI can admit the history is not being saved. */
  const [storageFailed, setStorageFailed] = useState(false);

  /**
   * Writes happen here rather than in an effect on `entries`. An effect would
   * fire once on mount just to write back what was read, and would re-render
   * the tree a second time to record the outcome of the write.
   */
  const commit = useCallback(
    (next) => {
      setEntries(next);
      if (persist) setStorageFailed(!setItem(STORAGE_KEYS.history, next));
    },
    [persist]
  );

  /**
   * Turning persistence off wipes what is already on disk — the point of the
   * switch is that sensitive text stops being left behind.
   */
  const setPersist = useCallback(
    (next) => {
      setPersistState(next);
      setItem(STORAGE_KEYS.historyEnabled, next);
      if (next) {
        setStorageFailed(!setItem(STORAGE_KEYS.history, entries));
      } else {
        removeItem(STORAGE_KEYS.history);
        setStorageFailed(false);
      }
    },
    [entries]
  );

  const addEntry = useCallback(
    (entry) => {
      if (!entry?.input || !entry?.output) return;
      commit(
        [
          {
            id: makeId(),
            ts: Date.now(),
            type: entry.type,
            input: truncate(entry.input),
            output: truncate(entry.output),
            meta: entry.meta,
          },
          ...entries,
        ].slice(0, MAX_ENTRIES)
      );
    },
    [entries, commit]
  );

  const removeEntry = useCallback(
    (id) => commit(entries.filter((entry) => entry.id !== id)),
    [entries, commit]
  );

  const clearAll = useCallback(() => {
    setEntries([]);
    removeItem(STORAGE_KEYS.history);
    setStorageFailed(false);
  }, []);

  const value = useMemo(
    () => ({
      entries,
      addEntry,
      removeEntry,
      clearAll,
      persist,
      setPersist,
      storageFailed,
    }),
    [entries, addEntry, removeEntry, clearAll, persist, setPersist, storageFailed]
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistory must be used inside HistoryProvider');
  return context;
}
