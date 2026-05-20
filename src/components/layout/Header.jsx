import { Clock, Command } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { ThemeToggle } from '../controls/ThemeToggle';
import { LanguageSwitcher } from '../controls/LanguageSwitcher';

export function Header({ onOpenHistory, onOpenPalette }) {
  const { t } = useI18n();
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__titles">
          <h1 className="header__title">{t('header.title')}</h1>
          <p className="header__subtitle">{t('header.subtitle')}</p>
        </div>
        <div className="header__actions">
          <button
            type="button"
            className="icon-btn"
            onClick={onOpenPalette}
            aria-label={t('header.openPalette')}
            title={t('header.openPalette')}
          >
            <Command />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onOpenHistory}
            aria-label={t('header.openHistory')}
            title={t('header.openHistory')}
          >
            <Clock />
          </button>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
