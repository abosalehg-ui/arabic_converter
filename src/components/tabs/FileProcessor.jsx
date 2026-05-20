import { useCallback, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Download, Play, Upload, FileCheck2 } from 'lucide-react';
import { TextArea } from '../controls/TextArea';
import converter from '../../lib/arabicConverter';
import { useI18n } from '../../i18n/I18nProvider';
import { useToast } from '../../feedback/ToastProvider';
import { useHistory } from '../../history/HistoryProvider';

export const FileProcessor = forwardRef(function FileProcessor(_, ref) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { addEntry } = useHistory();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const picked = files[0];
      if (!picked.name.toLowerCase().endsWith('.txt')) {
        showToast(t('toast.invalidFile'), 'error');
        return;
      }
      setFile(picked);
      setOutput('');
      showToast(t('toast.fileSelected'), 'success');
    },
    [showToast, t]
  );

  const process = useCallback(() => {
    if (!file) {
      showToast(t('toast.noFile'), 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target.result || '');
      const processed = content.includes('<clr:')
        ? converter.processColorTags(content)
        : converter.convertText(content);
      setOutput(processed);
      addEntry({
        type: 'file',
        input: content,
        output: processed,
        meta: { filename: file.name },
      });
      showToast(t('toast.fileProcessed'), 'success');
    };
    reader.onerror = () => showToast(t('toast.fileReadError'), 'error');
    reader.readAsText(file, 'utf-8');
  }, [file, addEntry, showToast, t]);

  const download = useCallback(() => {
    if (!output) {
      showToast(t('toast.nothingToDownload'), 'error');
      return;
    }
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const original = (file?.name || 'output').replace(/\.txt$/i, '');
    a.href = url;
    a.download = `${original}_converted.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('toast.fileDownloaded'), 'success');
  }, [output, file, showToast, t]);

  useImperativeHandle(ref, () => ({
    convert: process,
    clear: () => {
      setFile(null);
      setOutput('');
      if (inputRef.current) inputRef.current.value = '';
    },
  }), [process]);

  return (
    <div className="tab-panel">
      <button
        type="button"
        className={`file-drop ${dragOver ? 'file-drop--active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files);
        }}
      >
        <Upload className="file-drop__icon" />
        <div className="file-drop__title">{t('file.dropTitle')}</div>
        <div className="file-drop__hint">{t('file.dropHint')}</div>
        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          hidden
          onChange={(e) => handleFile(e.target.files)}
        />
      </button>

      {file && (
        <div className="file-info">
          <FileCheck2 />
          <span>
            <strong>{t('file.selected')}</strong> {file.name}
          </span>
        </div>
      )}

      <div className="button-row">
        <button type="button" className="btn btn--primary" onClick={process} disabled={!file}>
          <Play />
          {t('file.process')}
        </button>
        <button type="button" className="btn btn--success" onClick={download} disabled={!output}>
          <Download />
          {t('file.download')}
        </button>
      </div>

      <TextArea
        id="file-output"
        label={t('file.outputLabel')}
        value={output}
        readOnly
        placeholder={t('file.outputPlaceholder')}
      />
    </div>
  );
});
