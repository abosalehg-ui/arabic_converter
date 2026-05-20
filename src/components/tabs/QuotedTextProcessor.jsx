import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { Copy, Eraser, FileInput, Wand2 } from 'lucide-react';
import { TextArea } from '../controls/TextArea';
import converter from '../../lib/arabicConverter';
import { useI18n } from '../../i18n/I18nProvider';
import { useToast } from '../../feedback/ToastProvider';
import { useHistory } from '../../history/HistoryProvider';

const EXAMPLE =
  '"ep_02.reb_basesaved05" "انطلق يا حمد!"\n"ep_02.reb_basesaved06" "ها هو قادم! ها هو حمد قادم!"';

export const QuotedTextProcessor = forwardRef(function QuotedTextProcessor(_, ref) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const process = useCallback(() => {
    if (!input.trim()) {
      showToast(t('toast.emptyInput'), 'error');
      return;
    }
    const result = converter.processQuotedText(input);
    setOutput(result);
    addEntry({ type: 'quoted', input, output: result });
    showToast(t('toast.convertSuccess'), 'success');
  }, [input, t, showToast, addEntry]);

  const clear = useCallback(() => {
    setInput('');
    setOutput('');
  }, []);

  const copy = useCallback(async () => {
    if (!output.trim()) {
      showToast(t('toast.nothingToCopy'), 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      showToast(t('toast.copySuccess'), 'success');
    } catch {
      showToast(t('toast.nothingToCopy'), 'error');
    }
  }, [output, t, showToast]);

  const insertExample = useCallback(() => {
    setInput(EXAMPLE);
    showToast(t('toast.exampleInserted'), 'success');
  }, [showToast, t]);

  useImperativeHandle(ref, () => ({
    convert: process,
    clear,
    setInput: (v) => setInput(v),
  }), [process, clear]);

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      process();
    }
  };

  return (
    <div className="tab-panel">
      <div className="instructions">
        <div className="instructions__title">{t('quoted.instructionsTitle')}</div>
        <div style={{ marginBottom: 8 }}>{t('quoted.instructionsIntro')}</div>
        <ul className="instructions__list">
          <li>{t('quoted.pattern1')}</li>
          <li>{t('quoted.pattern2')}</li>
          <li>{t('quoted.pattern3')}</li>
        </ul>
      </div>

      <TextArea
        id="quoted-input"
        label={t('quoted.inputLabel')}
        value={input}
        onChange={setInput}
        placeholder={t('quoted.inputPlaceholder')}
        onKeyDown={onKeyDown}
      />

      <div className="button-row">
        <button type="button" className="btn btn--primary" onClick={process}>
          <Wand2 />
          {t('quoted.process')}
        </button>
        <button type="button" className="btn btn--secondary" onClick={insertExample}>
          <FileInput />
          {t('quoted.insertExample')}
        </button>
        <button type="button" className="btn btn--secondary" onClick={clear}>
          <Eraser />
          {t('actions.clear')}
        </button>
        <button type="button" className="btn btn--success" onClick={copy} disabled={!output}>
          <Copy />
          {t('actions.copy')}
        </button>
      </div>

      <TextArea
        id="quoted-output"
        label={t('quoted.outputLabel')}
        value={output}
        readOnly
        placeholder={t('quoted.outputPlaceholder')}
      />
    </div>
  );
});
