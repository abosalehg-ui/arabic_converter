import { useI18n } from '../../i18n/I18nProvider';

export function LanguageSwitcher() {
  const { toggleLang, t } = useI18n();

  return (
    <button
      type="button"
      className="icon-btn lang-toggle"
      onClick={toggleLang}
      /*
       * The label describes what the button *does*, in the current UI language,
       * matching the visible target-language text. It used to be hard-coded
       * English describing the current state, which contradicted the label.
       */
      aria-label={t('header.switchLanguage')}
      title={t('header.switchLanguage')}
    >
      {t('header.toggleLanguage')}
    </button>
  );
}
