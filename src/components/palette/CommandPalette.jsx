import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

export function CommandPalette({ open, onClose, commands }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  // Keep selected item in view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[active];
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, filtered.length]);

  if (!open) return null;

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((p) => (filtered.length === 0 ? 0 : (p + 1) % filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((p) =>
        filtered.length === 0 ? 0 : (p - 1 + filtered.length) % filtered.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) {
        cmd.action();
        onClose();
      }
    }
  };

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label={t('header.openPalette')}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette__search">
          <Search />
          <input
            ref={inputRef}
            className="palette__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('palette.placeholder')}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="palette__empty">{t('palette.empty')}</div>
        ) : (
          <ul className="palette__list" ref={listRef} role="listbox">
            {filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <li
                  key={cmd.id}
                  role="option"
                  aria-selected={idx === active}
                  className={`palette__item ${idx === active ? 'palette__item--active' : ''}`}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                >
                  {Icon && <Icon />}
                  <span>{cmd.label}</span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="palette__hint">
          <span>
            <span className="kbd">↑</span> <span className="kbd">↓</span>{' '}
            {t('palette.hintNavigate')}
          </span>
          <span>
            <span className="kbd">↵</span> {t('palette.hintRun')}
          </span>
          <span>
            <span className="kbd">Esc</span> {t('palette.hintClose')}
          </span>
        </div>
      </div>
    </div>
  );
}
