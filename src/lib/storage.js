// Safe wrapper around localStorage. Handles quota errors and private-mode access.

export function getItem(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch {
    return fallback;
  }
}

/** @returns {boolean} false when the value could not be stored (quota, private mode). */
export function setItem(key, value) {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  theme: 'ac-theme',
  lang: 'ac-lang',
  history: 'ac-history',
  historyEnabled: 'ac-history-enabled',
};
