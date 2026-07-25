import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';

const ThemeContext = createContext(null);

function getSystemPreference() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveInitialTheme() {
  const stored = getItem(STORAGE_KEYS.theme);
  if (stored === 'light' || stored === 'dark') return { theme: stored, fromUser: true };
  return { theme: getSystemPreference(), fromUser: false };
}

export function ThemeProvider({ children }) {
  const [{ theme, fromUser }, setState] = useState(resolveInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Follow system changes while the user has not made an explicit choice
  useEffect(() => {
    if (fromUser || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) =>
      setState({ theme: e.matches ? 'dark' : 'light', fromUser: false });
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [fromUser]);

  const setTheme = useCallback((next) => {
    setState({ theme: next, fromUser: true });
    setItem(STORAGE_KEYS.theme, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setState((prev) => {
      const next = prev.theme === 'dark' ? 'light' : 'dark';
      setItem(STORAGE_KEYS.theme, next);
      return { theme: next, fromUser: true };
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
