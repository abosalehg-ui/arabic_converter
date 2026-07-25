import { useRef } from 'react';
import { FileText, Palette, Quote, Type } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { TAB_IDS } from '../../state/TabsProvider';
import { tabButtonId, tabPanelId } from './tabIds';

const ICONS = { text: Type, file: FileText, color: Palette, quoted: Quote };

export function TabBar({ active, onChange }) {
  const { t } = useI18n();
  const listRef = useRef(null);

  /** Arrow-key navigation, as required by the ARIA tabs pattern. */
  const onKeyDown = (event) => {
    const offset = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' }[
      event.key
    ];
    if (offset === undefined) return;

    event.preventDefault();
    const index = TAB_IDS.indexOf(active);
    let next;
    if (offset === 'first') next = 0;
    else if (offset === 'last') next = TAB_IDS.length - 1;
    // In RTL the right arrow moves towards the previous tab.
    else {
      const direction = document.documentElement.dir === 'rtl' ? -offset : offset;
      next = (index + direction + TAB_IDS.length) % TAB_IDS.length;
    }

    onChange(TAB_IDS[next]);
    listRef.current?.querySelector(`#${tabButtonId(TAB_IDS[next])}`)?.focus();
  };

  return (
    <div className="tabs" role="tablist" ref={listRef} onKeyDown={onKeyDown}>
      {TAB_IDS.map((id) => {
        const Icon = ICONS[id];
        const selected = active === id;
        const label = t(`tabs.${id}`);

        return (
          <button
            key={id}
            id={tabButtonId(id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={tabPanelId(id)}
            /* The visible label is hidden below 480px, so name the button too. */
            aria-label={label}
            tabIndex={selected ? 0 : -1}
            className={`tab ${selected ? 'tab--active' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon className="tab__icon" aria-hidden="true" />
            <span className="tab__label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
