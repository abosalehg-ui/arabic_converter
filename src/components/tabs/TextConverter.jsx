import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { ArrowRight, Copy, Eraser } from 'lucide-react';
import { TextArea } from '../controls/TextArea';
import converter from '../../lib/arabicConverter';
import { useI18n } from '../../i18n/I18nProvider';
import { useToast } from '../../feedback/ToastProvider';
import { useHistory } from '../../history/HistoryProvider';

export const TextConverter = forwardRef(function TextConverter(_, ref) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = useCallback(() => {
    if (!input.trim()) {
      showToast(t('toast.emptyInput'), 'error');
      return;
    }
    const result = converter.convertText(input);
    setOutput(result);
    addEntry({ type: 'text', input, output: result });
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
    convert,
    clear,
    setInput: (v) => setInput(v),
  }), [convert, clear]);

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      convert();
    }
  };

  return (
    <div className="tab-panel">
      <TextArea
        id="text-input"
        label={t('text.inputLabel')}
        value={input}
        onChange={setInput}
        placeholder={t('text.inputPlaceholder')}
        onKeyDown={onKeyDown}
      />

      <div className="button-row">
        <button type="button" className="btn btn--primary" onClick={convert}>
          <ArrowRight />
          {t('actions.convert')}
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
        id="text-output"
        label={t('text.outputLabel')}
        value={output}
        readOnly
        placeholder={t('text.outputPlaceholder')}
      />

      <div className="examples">
        <h3 className="examples__title">{t('text.examplesTitle')}</h3>
        <div className="examples__item">
          <div className="examples__before">{t('text.exampleBefore')}</div>
          <div className="examples__after">{t('text.exampleAfter')}</div>
        </div>
      </div>
    </div>
  );
});
