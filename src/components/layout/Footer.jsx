import { useI18n } from '../../i18n/I18nProvider';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="footer">
      <p>
        {t('footer.credit')} ·{' '}
        <a href="https://github.com/abosalehg-ui/arabic_converter">
          {t('footer.repoLink')}
        </a>
      </p>
      {/* Derived rather than hard-coded, so it stops going stale every January. */}
      <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
