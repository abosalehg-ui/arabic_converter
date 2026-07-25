import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { useToast } from '../feedback/ToastProvider';
import { useHistory } from '../history/HistoryProvider';
import { useConverterWorker } from '../hooks/useConverterWorker';

/**
 * Owns the state of every tab.
 *
 * Previously each tab kept its own state and App reached into it through refs
 * and `useImperativeHandle`. That made the command palette depend on an
 * undocumented per-tab contract, and restoring a history entry silently did
 * nothing whenever a tab did not happen to implement `setInput`. Holding the
 * state here means the palette, the history drawer and the tabs all read and
 * write the same place.
 */

const TabsContext = createContext(null);

export const TEXT_TABS = ['text', 'color', 'quoted'];
export const TAB_IDS = ['text', 'file', 'color', 'quoted'];

/** Files larger than this are rejected before they can freeze the tab. */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

const emptyTab = () => ({ input: '', output: '' });

export function TabsProvider({ children }) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { addEntry } = useHistory();
  const { run, busy, progress } = useConverterWorker();

  const [active, setActive] = useState('text');
  const [tabs, setTabs] = useState(() => ({
    text: emptyTab(),
    color: emptyTab(),
    quoted: emptyTab(),
  }));
  const [file, setFile] = useState(null);
  const [fileOutput, setFileOutput] = useState('');

  const setInput = useCallback((id, value) => {
    setTabs((previous) => ({ ...previous, [id]: { ...previous[id], input: value } }));
  }, []);

  const clearTab = useCallback((id) => {
    if (id === 'file') {
      setFile(null);
      setFileOutput('');
      return;
    }
    setTabs((previous) => ({ ...previous, [id]: emptyTab() }));
  }, []);

  /** Converts the given text tab's input and records the result in history. */
  const runTextTab = useCallback(
    async (id) => {
      const input = tabs[id]?.input ?? '';
      if (!input.trim()) {
        showToast(t('toast.emptyInput'), 'error');
        return;
      }

      try {
        const output = await run(input, id);
        setTabs((previous) => ({ ...previous, [id]: { ...previous[id], output } }));
        addEntry({ type: id, input, output });
        showToast(t('toast.convertSuccess'), 'success');
      } catch {
        showToast(t('toast.convertFailed'), 'error');
      }
    },
    [tabs, run, addEntry, showToast, t]
  );

  /** Reads the selected file and converts its contents. */
  const runFileTab = useCallback(async () => {
    if (!file) {
      showToast(t('toast.noFile'), 'error');
      return;
    }

    let content;
    try {
      content = await file.text();
    } catch {
      showToast(t('toast.fileReadError'), 'error');
      return;
    }

    try {
      // Colour-tagged game files must keep their tags, so pick the processor
      // from the content rather than converting the markup along with the text.
      const mode = content.includes('<clr:') ? 'color' : 'text';
      const output = await run(content, mode);
      setFileOutput(output);
      addEntry({ type: 'file', input: content, output, meta: { filename: file.name } });
      showToast(t('toast.fileProcessed'), 'success');
    } catch {
      showToast(t('toast.convertFailed'), 'error');
    }
  }, [file, run, addEntry, showToast, t]);

  const runActive = useCallback(
    () => (active === 'file' ? runFileTab() : runTextTab(active)),
    [active, runFileTab, runTextTab]
  );

  const clearActive = useCallback(() => clearTab(active), [active, clearTab]);

  /**
   * Restores a history entry into its tab. File entries carry only the text
   * that was read, not the File itself, so they are not restorable — the
   * history drawer hides the action for them rather than failing silently.
   */
  const restoreEntry = useCallback((entry) => {
    if (!TEXT_TABS.includes(entry.type)) return false;
    setActive(entry.type);
    setTabs((previous) => ({
      ...previous,
      [entry.type]: { input: entry.input, output: '' },
    }));
    return true;
  }, []);

  const value = useMemo(
    () => ({
      active,
      setActive,
      tabs,
      setInput,
      clearTab,
      clearActive,
      runTextTab,
      runActive,
      restoreEntry,
      file,
      setFile,
      fileOutput,
      setFileOutput,
      runFileTab,
      busy,
      progress,
    }),
    [
      active,
      tabs,
      setInput,
      clearTab,
      clearActive,
      runTextTab,
      runActive,
      restoreEntry,
      file,
      fileOutput,
      runFileTab,
      busy,
      progress,
    ]
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('useTabs must be used inside TabsProvider');
  return context;
}
