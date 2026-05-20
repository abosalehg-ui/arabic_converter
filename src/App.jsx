import { useCallback, useMemo, useRef, useState } from 'react';
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

export default function App() {
  const [active, setActive] = useState('text');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { t } = useI18n();
  const { toggleTheme } = useTheme();
  const { toggleLang } = useI18n();

  const textRef = useRef(null);
  const fileRef = useRef(null);
  const colorRef = useRef(null);
  const quotedRef = useRef(null);

  const refs = { text: textRef, file: fileRef, color: colorRef, quoted: quotedRef };

  const restoreEntry = useCallback((entry) => {
    setActive(entry.type);
    requestAnimationFrame(() => {
      const ref = refs[entry.type];
      ref?.current?.setInput?.(entry.input);
    });
  }, []);

  const commands = useMemo(
    () => [
      { id: 'tab.text', label: t('palette.cmd.tabText'), icon: Type, action: () => setActive('text') },
      { id: 'tab.file', label: t('palette.cmd.tabFile'), icon: FileText, action: () => setActive('file') },
      { id: 'tab.color', label: t('palette.cmd.tabColor'), icon: Palette, action: () => setActive('color') },
      { id: 'tab.quoted', label: t('palette.cmd.tabQuoted'), icon: Quote, action: () => setActive('quoted') },
      { id: 'theme', label: t('palette.cmd.toggleTheme'), icon: Sun, action: toggleTheme },
      { id: 'lang', label: t('palette.cmd.toggleLang'), icon: Languages, action: toggleLang },
      { id: 'history', label: t('palette.cmd.openHistory'), icon: Clock, action: () => setHistoryOpen(true) },
      {
        id: 'convert',
        label: t('actions.convert'),
        icon: Play,
        action: () => refs[active]?.current?.convert?.(),
      },
      {
        id: 'clear',
        label: t('palette.cmd.clearInput'),
        icon: Eraser,
        action: () => refs[active]?.current?.clear?.(),
      },
    ],
    [t, toggleTheme, toggleLang, active]
  );

  useHotkeys([
    { ctrl: true, key: 'k', handler: () => setPaletteOpen((v) => !v) },
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
          <div style={{ display: active === 'text' ? 'block' : 'none' }}>
            <TextConverter ref={textRef} />
          </div>
          <div style={{ display: active === 'file' ? 'block' : 'none' }}>
            <FileProcessor ref={fileRef} />
          </div>
          <div style={{ display: active === 'color' ? 'block' : 'none' }}>
            <ColoredTextProcessor ref={colorRef} />
          </div>
          <div style={{ display: active === 'quoted' ? 'block' : 'none' }}>
            <QuotedTextProcessor ref={quotedRef} />
          </div>
        </main>
        <Footer />
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={restoreEntry}
      />
    </div>
  );
}
