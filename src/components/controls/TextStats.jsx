import { useI18n } from '../../i18n/I18nProvider';
import { useTextStats } from '../../hooks/useTextStats';

export function TextStats({ text }) {
  const { t } = useI18n();
  const { chars, words, lines } = useTextStats(text);
  return (
    <div className="field__stats" aria-live="polite">
      <span>{t('stats.chars', { n: chars })}</span>
      <span>{t('stats.words', { n: words })}</span>
      <span>{t('stats.lines', { n: lines })}</span>
    </div>
  );
}
