import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const next = theme === 'dark' ? 'toLight' : 'toDark';

  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      onClick={toggleTheme}
      aria-label={t(`header.toggleTheme.${next}`)}
      title={t(`header.toggleTheme.${next}`)}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
