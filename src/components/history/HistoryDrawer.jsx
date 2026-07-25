import { useEffect, useRef } from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { useHistory } from '../../history/HistoryProvider';
import { useToast } from '../../feedback/ToastProvider';
import { useClipboard } from '../../hooks/useClipboard';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { TEXT_TABS, useTabs } from '../../state/TabsProvider';

function relative(ts, t) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return t('history.justNow');
  if (diff < 3_600_000) return t('history.minutesAgo', { n: Math.floor(diff / 60_000) });
  if (diff < 86_400_000)
    return t('history.hoursAgo', { n: Math.floor(diff / 3_600_000) });
  return t('history.daysAgo', { n: Math.floor(diff / 86_400_000) });
}

/** Mounted only while open (see App.jsx). */
export function HistoryDrawer({ onClose }) {
  const { t } = useI18n();
  const { entries, removeEntry, clearAll, persist, setPersist, storageFailed } =
    useHistory();
  const { showToast } = useToast();
  const copy = useClipboard();
  const { restoreEntry } = useTabs();
  const drawerRef = useRef(null);

  useFocusTrap(drawerRef, true);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleClearAll = () => {
    if (entries.length === 0) return;
    if (window.confirm(t('history.confirmClear'))) {
      clearAll();
      showToast(t('toast.historyCleared'), 'success');
    }
  };

  const handleRestore = (entry) => {
    if (restoreEntry(entry)) {
      showToast(t('toast.historyRestored'), 'success');
      onClose();
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose} aria-hidden="true" />
      <aside
        ref={drawerRef}
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
            aria-label={t('actions.close')}
          >
            <X />
          </button>
        </div>

        <label className="drawer__toggle">
          <input
            type="checkbox"
            checked={persist}
            onChange={(event) => setPersist(event.target.checked)}
          />
          <span>{t('history.persistLabel')}</span>
        </label>

        {storageFailed && (
          <div className="drawer__toggle" role="status">
            <AlertCircle aria-hidden="true" width={16} height={16} />
            <span>{t('history.storageFailed')}</span>
          </div>
        )}

        <div className="drawer__body">
          {entries.length === 0 ? (
            <div className="drawer__empty">{t('history.empty')}</div>
          ) : (
            entries.map((entry) => {
              const restorable = TEXT_TABS.includes(entry.type);
              return (
                <div className="history-item" key={entry.id}>
                  <div className="history-item__meta">
                    <span className="badge">{t(`tabs.${entry.type}`)}</span>
                    <span>{relative(entry.ts, t)}</span>
                  </div>
                  <div className="history-item__text" dir="auto">
                    {entry.input}
                  </div>
                  <div className="history-item__actions">
                    {/*
                      A file entry only stores the text that was read, not the
                      File itself, so there is nothing to restore it into.
                    */}
                    {restorable && (
                      <button
                        type="button"
                        className="history-item__btn"
                        onClick={() => handleRestore(entry)}
                      >
                        {t('history.restore')}
                      </button>
                    )}
                    <button
                      type="button"
                      className="history-item__btn"
                      onClick={() => copy(entry.output)}
                    >
                      {t('history.copyOutput')}
                    </button>
                    <button
                      type="button"
                      className="history-item__btn history-item__btn--danger"
                      onClick={() => removeEntry(entry.id)}
                    >
                      {t('history.delete')}
                    </button>
                  </div>
                </div>
              );
            })
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
            <Trash2 size={14} style={{ marginInlineEnd: 4 }} aria-hidden="true" />
            {t('history.clearAll')}
          </button>
        </div>
      </aside>
    </>
  );
}
