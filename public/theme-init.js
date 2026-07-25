/*
 * Applies the saved theme and language before React mounts, so the page never
 * flashes the wrong colours or text direction.
 *
 * This lives in its own file rather than inline so the Content-Security-Policy
 * can keep `script-src 'self'` without needing 'unsafe-inline' or a hash that
 * would silently break whenever this code changes.
 *
 * Keep the resolution rules here in sync with ThemeProvider.jsx and
 * I18nProvider.jsx.
 */
(function () {
  try {
    var saved = localStorage.getItem('ac-theme');
    var theme =
      saved === 'light' || saved === 'dark'
        ? saved
        : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    document.documentElement.setAttribute('data-theme', theme);

    var storedLang = localStorage.getItem('ac-lang');
    var lang =
      storedLang === 'ar' || storedLang === 'en'
        ? storedLang
        : String(navigator.language || '')
              .toLowerCase()
              .indexOf('ar') === 0
          ? 'ar'
          : 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  } catch {
    /* Private mode or blocked storage: fall back to the markup defaults. */
  }
})();
