import { useI18n } from '../../i18n/I18nProvider';

export function LanguageSwitcher() {
  const { toggleLang, t, lang } = useI18n();
  return (
    <button
      type="button"
      className="icon-btn lang-toggle"
      onClick={toggleLang}
      aria-label={`Language: ${lang === 'ar' ? 'Arabic' : 'English'}`}
      title={t('header.toggleLanguage')}
    >
      {t('header.toggleLanguage')}
    </button>
  );
}
