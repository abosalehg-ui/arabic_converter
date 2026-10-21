import { Copy, Eraser } from 'lucide-react';
import { TextArea } from '../controls/TextArea';
import { Progress } from '../controls/Progress';
import { useI18n } from '../../i18n/I18nProvider';
import { useTabs } from '../../state/TabsProvider';
import { useClipboard } from '../../hooks/useClipboard';

/**
 * The shared body of every text-based tab.
 *
 * The three text tabs used to be near-identical 100-line components; the copy,
 * clear and Ctrl+Enter handlers were duplicated verbatim in each, so a fix in
 * one never reached the other two. They now differ only by configuration.
 *
 * @param {object} props
 * @param {'text'|'color'|'quoted'} props.id which tab this is
 * @param {React.ComponentType} props.primaryIcon icon for the primary action
 * @param {string} props.primaryLabel translation key for the primary action
 * @param {React.ReactNode} [props.before] content above the input
 * @param {React.ReactNode} [props.after] content below the output
 * @param {(api: {setInput: (value: string) => void}) => React.ReactNode} [props.extraActions]
 */
export function ProcessorTab({
  id,
  primaryIcon: PrimaryIcon,
  primaryLabel,
  before,
  after,
  extraActions,
}) {
  const { t } = useI18n();
  const copy = useClipboard();
  const { tabs, setInput, clearTab, runTextTab, busy, progress } = useTabs();

  const { input, output } = tabs[id];

  const onKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      runTextTab(id);
    }
  };

  return (
    <div className="tab-panel">
      {before}

      <TextArea
        id={`${id}-input`}
        label={t(`${id}.inputLabel`)}
        value={input}
        onChange={(value) => setInput(id, value)}
        placeholder={t(`${id}.inputPlaceholder`)}
        onKeyDown={onKeyDown}
      />

      <div className="button-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => runTextTab(id)}
          disabled={busy}
        >
          <PrimaryIcon />
          {t(primaryLabel)}
        </button>

        {extraActions?.({ setInput: (value) => setInput(id, value) })}

        <button type="button" className="btn btn--secondary" onClick={() => clearTab(id)}>
          <Eraser />
          {t('actions.clear')}
        </button>

        <button
          type="button"
          className="btn btn--success"
          onClick={() => copy(output)}
          disabled={!output}
        >
          <Copy />
          {t('actions.copy')}
        </button>

        <span className="btn-hint">
          <span className="kbd">Ctrl</span>
          <span className="kbd">↵</span>
          {t('actions.shortcutHint')}
        </span>
      </div>

      {busy && <Progress value={progress} label={t('progress.converting')} />}

      <TextArea
        id={`${id}-output`}
        label={t(`${id}.outputLabel`)}
        value={output}
        readOnly
        placeholder={t(`${id}.outputPlaceholder`)}
      />

      {after}
    </div>
  );
}

/** The worked example shown under the text and colour tabs. */
export function TabExamples({ id }) {
  const { t } = useI18n();
  return (
    <div className="examples">
      <h3 className="examples__title">{t(`${id}.examplesTitle`)}</h3>
      <div className="examples__item">
        <div className="examples__before">{t(`${id}.exampleBefore`)}</div>
        <div className="examples__after">{t(`${id}.exampleAfter`)}</div>
      </div>
    </div>
  );
}
