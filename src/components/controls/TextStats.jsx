import { useI18n } from '../../i18n/I18nProvider';
import { useTextStats } from '../../hooks/useTextStats';

/**
 * Live character/word/line counters.
 *
 * Deliberately not an aria-live region: it used to announce a new count on
 * every keystroke, which drowns out everything else in a screen reader. The
 * numbers stay readable on demand.
 */
export function TextStats({ text }) {
  const { t } = useI18n();
  const { chars, words, lines } = useTextStats(text);

  return (
    <div className="field__stats">
      <span>{t('stats.chars', { n: chars })}</span>
      <span>{t('stats.words', { n: words })}</span>
      <span>{t('stats.lines', { n: lines })}</span>
    </div>
  );
}
