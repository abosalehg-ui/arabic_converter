import { Type, FileText, Palette, Quote } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

const TABS = [
  { id: 'text', icon: Type, key: 'tabs.text' },
  { id: 'file', icon: FileText, key: 'tabs.file' },
  { id: 'color', icon: Palette, key: 'tabs.color' },
  { id: 'quoted', icon: Quote, key: 'tabs.quoted' },
];

export function TabBar({ active, onChange }) {
  const { t } = useI18n();
  return (
    <div className="tabs" role="tablist">
      {TABS.map(({ id, icon: Icon, key }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={`tab ${active === id ? 'tab--active' : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon className="tab__icon" />
          <span className="tab__label">{t(key)}</span>
        </button>
      ))}
    </div>
  );
}
