import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { useFocusTrap } from '../../hooks/useFocusTrap';

/**
 * Mounted only while open (see App.jsx), so the query and selection reset
 * naturally instead of being cleared by an effect on every open.
 */
export function CommandPalette({ onClose, commands }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const paletteRef = useRef(null);

  useFocusTrap(paletteRef, true);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) => command.label.toLowerCase().includes(needle));
  }, [commands, query]);

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // Keep the selected item in view.
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, filtered.length]);

  const onQueryChange = (event) => {
    setQuery(event.target.value);
    setActive(0);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (filtered.length === 0 ? 0 : (index + 1) % filtered.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) =>
        filtered.length === 0 ? 0 : (index - 1 + filtered.length) % filtered.length
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const command = filtered[active];
      if (command) {
        command.action();
        onClose();
      }
    }
  };

  const activeId = filtered[active] ? `command-${filtered[active].id}` : undefined;

  return (
    <div className="overlay overlay--centered" role="presentation" onClick={onClose}>
      <div
        ref={paletteRef}
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label={t('header.openPalette')}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette__search">
          <Search aria-hidden="true" />
          <input
            ref={inputRef}
            className="palette__input"
            value={query}
            onChange={onQueryChange}
            placeholder={t('palette.placeholder')}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={activeId}
            aria-autocomplete="list"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="palette__empty">{t('palette.empty')}</div>
        ) : (
          <ul className="palette__list" id="command-list" ref={listRef} role="listbox">
            {filtered.map((command, index) => {
              const Icon = command.icon;
              return (
                <li
                  key={command.id}
                  id={`command-${command.id}`}
                  role="option"
                  aria-selected={index === active}
                  className={`palette__item ${index === active ? 'palette__item--active' : ''}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    command.action();
                    onClose();
                  }}
                >
                  {Icon && <Icon aria-hidden="true" />}
                  <span>{command.label}</span>
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
