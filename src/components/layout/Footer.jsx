import { useI18n } from '../../i18n/I18nProvider';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <p>
        {t('footer.credit')} ·{' '}
        <a href="mailto:abo.saleh.g@gmail.com">abo.saleh.g@gmail.com</a>
      </p>
      <p>{t('footer.copyright')}</p>
    </footer>
  );
}
