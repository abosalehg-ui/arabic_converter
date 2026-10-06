// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveInitialLang } from './resolveLang';

const themeInit = readFileSync(resolve(process.cwd(), 'public/theme-init.js'), 'utf8');

/** Runs public/theme-init.js the way the browser does and reports its language. */
function runThemeInit() {
  document.documentElement.removeAttribute('lang');
  new Function(themeInit)();
  return document.documentElement.lang;
}

describe('initial language: theme-init.js and resolveLang.js agree', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  const cases = [
    { stored: null, browser: 'ar-SA' },
    { stored: null, browser: 'AR' },
    { stored: null, browser: 'en-US' },
    { stored: null, browser: 'fr' },
    { stored: null, browser: '' },
    { stored: 'en', browser: 'ar-SA' },
    { stored: 'ar', browser: 'en-US' },
    { stored: 'xx', browser: 'ar-EG' },
  ];

  for (const { stored, browser } of cases) {
    it(`stored=${stored} browser=${JSON.stringify(browser)}`, () => {
      if (stored !== null) localStorage.setItem('ac-lang', stored);
      vi.stubGlobal('navigator', { ...navigator, language: browser });

      const fromReact = resolveInitialLang();
      expect(runThemeInit()).toBe(fromReact);
      expect(document.documentElement.dir).toBe(fromReact === 'ar' ? 'rtl' : 'ltr');
    });
  }
});
