import { useMemo, useState } from 'react';
import {
  Clock,
  Eraser,
  FileText,
  Languages,
  Palette,
  Play,
  Quote,
  Sun,
  Type,
} from 'lucide-react';
import { Header } from './components/layout/Header';
import { TabBar } from './components/layout/TabBar';
import { tabButtonId, tabPanelId } from './components/layout/tabIds';
import { Footer } from './components/layout/Footer';
import { TextConverter } from './components/tabs/TextConverter';
import { FileProcessor } from './components/tabs/FileProcessor';
import { ColoredTextProcessor } from './components/tabs/ColoredTextProcessor';
import { QuotedTextProcessor } from './components/tabs/QuotedTextProcessor';
import { CommandPalette } from './components/palette/CommandPalette';
import { HistoryDrawer } from './components/history/HistoryDrawer';
import { useTheme } from './theme/ThemeProvider';
import { useI18n } from './i18n/I18nProvider';
import { useHotkeys } from './hooks/useHotkeys';
import { TAB_IDS, useTabs } from './state/TabsProvider';

const PANELS = {
  text: TextConverter,
  file: FileProcessor,
  color: ColoredTextProcessor,
  quoted: QuotedTextProcessor,
};

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { t } = useI18n();
  const { toggleTheme } = useTheme();
  const { toggleLang } = useI18n();
  const { active, setActive, runActive, clearActive } = useTabs();

  const commands = useMemo(
    () => [
      {
        id: 'tab.text',
        label: t('palette.cmd.tabText'),
        icon: Type,
        action: () => setActive('text'),
      },
      {
        id: 'tab.file',
        label: t('palette.cmd.tabFile'),
        icon: FileText,
        action: () => setActive('file'),
      },
      {
        id: 'tab.color',
        label: t('palette.cmd.tabColor'),
        icon: Palette,
        action: () => setActive('color'),
      },
      {
        id: 'tab.quoted',
        label: t('palette.cmd.tabQuoted'),
        icon: Quote,
        action: () => setActive('quoted'),
      },
      {
        id: 'theme',
        label: t('palette.cmd.toggleTheme'),
        icon: Sun,
        action: toggleTheme,
      },
      {
        id: 'lang',
        label: t('palette.cmd.toggleLang'),
        icon: Languages,
        action: toggleLang,
      },
      {
        id: 'history',
        label: t('palette.cmd.openHistory'),
        icon: Clock,
        action: () => setHistoryOpen(true),
      },
      { id: 'convert', label: t('actions.convert'), icon: Play, action: runActive },
      {
        id: 'clear',
        label: t('palette.cmd.clearInput'),
        icon: Eraser,
        action: clearActive,
      },
    ],
    [t, toggleTheme, toggleLang, setActive, runActive, clearActive]
  );

  useHotkeys([
    { ctrl: true, code: 'KeyK', handler: () => setPaletteOpen((open) => !open) },
  ]);

  return (
    <div className="app">
      <div className="container">
        <Header
          onOpenHistory={() => setHistoryOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <main className="main">
          <TabBar active={active} onChange={setActive} />

          {TAB_IDS.map((id) => {
            const Panel = PANELS[id];
            return (
              <div
                key={id}
                id={tabPanelId(id)}
                role="tabpanel"
                aria-labelledby={tabButtonId(id)}
                hidden={active !== id}
              >
                {active === id && <Panel />}
              </div>
            );
          })}
        </main>

        <Footer />
      </div>

      {/* Mounted only while open so their internal state starts fresh. */}
      {paletteOpen && (
        <CommandPalette onClose={() => setPaletteOpen(false)} commands={commands} />
      )}

      {historyOpen && <HistoryDrawer onClose={() => setHistoryOpen(false)} />}
    </div>
  );
}
