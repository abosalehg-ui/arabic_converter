import { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { useHistory } from '../../history/HistoryProvider';
import { useToast } from '../../feedback/ToastProvider';

function relative(ts, t) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return t('history.justNow');
  if (diff < 3_600_000) return t('history.minutesAgo', { n: Math.floor(diff / 60_000) });
  if (diff < 86_400_000) return t('history.hoursAgo', { n: Math.floor(diff / 3_600_000) });
  return t('history.daysAgo', { n: Math.floor(diff / 86_400_000) });
}

export function HistoryDrawer({ open, onClose, onRestore }) {
  const { t } = useI18n();
  const { entries, removeEntry, clearAll } = useHistory();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(t('toast.copySuccess'), 'success');
    } catch {
      showToast(t('toast.nothingToCopy'), 'error');
    }
  };

  const handleClearAll = () => {
    if (entries.length === 0) return;
    if (window.confirm(t('history.confirmClear'))) {
      clearAll();
      showToast(t('toast.historyCleared'), 'success');
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose} aria-hidden="true" />
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t('history.title')}
      >
        <div className="drawer__header">
          <h2 className="drawer__title">{t('history.title')}</h2>
          <button
            type="button"
            className="icon-btn icon-btn--ghost"
            onClick={onClose}
            aria-label={t('palette.hintClose')}
          >
            <X />
          </button>
        </div>

        <div className="drawer__body">
          {entries.length === 0 ? (
            <div className="drawer__empty">{t('history.empty')}</div>
          ) : (
            entries.map((e) => (
              <div className="history-item" key={e.id}>
                <div className="history-item__meta">
                  <span className="badge">{t(`tabs.${e.type}`)}</span>
                  <span>{relative(e.ts, t)}</span>
                </div>
                <div className="history-item__text" dir="auto">
                  {e.input}
                </div>
                <div className="history-item__actions">
                  <button
                    type="button"
                    className="history-item__btn"
                    onClick={() => {
                      onRestore(e);
                      onClose();
                    }}
                  >
                    {t('history.restore')}
                  </button>
                  <button
                    type="button"
                    className="history-item__btn"
                    onClick={() => handleCopy(e.output)}
                  >
                    {t('history.copyOutput')}
                  </button>
                  <button
                    type="button"
                    className="history-item__btn history-item__btn--danger"
                    onClick={() => removeEntry(e.id)}
                  >
                    {t('history.delete')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer__footer">
          <span>{t('history.count', { n: entries.length })}</span>
          <button
            type="button"
            className="history-item__btn history-item__btn--danger"
            onClick={handleClearAll}
            disabled={entries.length === 0}
          >
            <Trash2 size={14} style={{ marginInlineEnd: 4 }} />
            {t('history.clearAll')}
          </button>
        </div>
      </aside>
    </>
  );
}
