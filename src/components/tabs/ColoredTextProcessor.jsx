import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { Copy, Eraser, Wand2 } from 'lucide-react';
import { TextArea } from '../controls/TextArea';
import converter from '../../lib/arabicConverter';
import { useI18n } from '../../i18n/I18nProvider';
import { useToast } from '../../feedback/ToastProvider';
import { useHistory } from '../../history/HistoryProvider';

export const ColoredTextProcessor = forwardRef(function ColoredTextProcessor(_, ref) {
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
    const result = converter.processColorTags(input);
    setOutput(result);
    addEntry({ type: 'color', input, output: result });
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
      <TextArea
        id="color-input"
        label={t('color.inputLabel')}
        value={input}
        onChange={setInput}
        placeholder={t('color.inputPlaceholder')}
        onKeyDown={onKeyDown}
      />

      <div className="button-row">
        <button type="button" className="btn btn--primary" onClick={process}>
          <Wand2 />
          {t('color.process')}
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
        id="color-output"
        label={t('color.outputLabel')}
        value={output}
        readOnly
        placeholder={t('color.outputPlaceholder')}
      />

      <div className="examples">
        <h3 className="examples__title">{t('color.examplesTitle')}</h3>
        <div className="examples__item">
          <div className="examples__before">{t('color.exampleBefore')}</div>
          <div className="examples__after">{t('color.exampleAfter')}</div>
        </div>
      </div>
    </div>
  );
});
