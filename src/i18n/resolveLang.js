import { getItem, STORAGE_KEYS } from '../lib/storage';

/**
 * Picks the UI language on first load: a saved choice wins, then an Arabic
 * browser gets Arabic, and everyone else gets English.
 *
 * `public/theme-init.js` applies the same rule before React mounts, and cannot
 * import this module. `resolveLang.test.js` runs both and fails if they drift.
 */
export function resolveInitialLang() {
  const stored = getItem(STORAGE_KEYS.lang);
  if (stored === 'ar' || stored === 'en') return stored;
  if (
    typeof navigator !== 'undefined' &&
    navigator.language?.toLowerCase().startsWith('ar')
  ) {
    return 'ar';
  }
  return 'en';
}
