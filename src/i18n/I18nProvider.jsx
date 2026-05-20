import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';
import ar from './ar.json';
import en from './en.json';

const LOCALES = { ar, en };
const DEFAULT_LANG = 'ar';

const I18nContext = createContext(null);

function resolveInitialLang() {
  const stored = getItem(STORAGE_KEYS.lang);
  if (stored === 'ar' || stored === 'en') return stored;
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('ar')) {
    return 'ar';
  }
  return DEFAULT_LANG;
}

function interpolate(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(resolveInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    setItem(STORAGE_KEYS.lang, next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }, [lang, setLang]);

  const t = useCallback(
    (key, params) => {
      const dict = LOCALES[lang] || LOCALES[DEFAULT_LANG];
      const template = dict[key] ?? key;
      return interpolate(template, params);
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t }),
    [lang, setLang, toggleLang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
