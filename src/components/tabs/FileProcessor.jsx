import { useCallback, useRef, useState } from 'react';
import { Download, FileCheck2, Play, Upload } from 'lucide-react';
import { TextArea } from '../controls/TextArea';
import { Progress } from '../controls/Progress';
import { useI18n } from '../../i18n/I18nProvider';
import { useToast } from '../../feedback/ToastProvider';
import { MAX_FILE_BYTES, useTabs } from '../../state/TabsProvider';

const MAX_FILE_MB = Math.round(MAX_FILE_BYTES / (1024 * 1024));

export function FileProcessor() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { file, setFile, fileOutput, setFileOutput, runFileTab, busy, progress } =
    useTabs();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (files) => {
      const picked = files?.[0];
      if (!picked) return;

      if (!picked.name.toLowerCase().endsWith('.txt')) {
        showToast(t('toast.invalidFile'), 'error');
        return;
      }
      // A multi-hundred-megabyte "text" file would be read into memory whole
      // and freeze the tab, so refuse it up front with a reason.
      if (picked.size > MAX_FILE_BYTES) {
        showToast(t('toast.fileTooLarge', { max: MAX_FILE_MB }), 'error');
        return;
      }

      setFile(picked);
      setFileOutput('');
      showToast(t('toast.fileSelected'), 'success');
    },
    [setFile, setFileOutput, showToast, t]
  );

  const download = useCallback(() => {
    if (!fileOutput) {
      showToast(t('toast.nothingToDownload'), 'error');
      return;
    }

    const blob = new Blob([fileOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(file?.name || 'output').replace(/\.txt$/i, '')}_converted.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Revoking synchronously right after click() cancels the download in some
    // browsers, so give the download a moment to start first.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(t('toast.fileDownloaded'), 'success');
  }, [fileOutput, file, showToast, t]);

  return (
    <div className="tab-panel">
      {/*
        A label rather than a button: an <input> nested inside a <button> is
        invalid HTML and gives assistive technology two conflicting controls.
      */}
      <label
        className={`file-drop ${dragOver ? 'file-drop--active' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          handleFile(event.dataTransfer.files);
        }}
      >
        <Upload className="file-drop__icon" aria-hidden="true" />
        <div className="file-drop__title">{t('file.dropTitle')}</div>
        <div className="file-drop__hint">{t('file.dropHint', { max: MAX_FILE_MB })}</div>
        <input
          ref={inputRef}
          type="file"
          accept="text/plain,.txt"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files)}
        />
      </label>

      {file && (
        <div className="file-info">
          <FileCheck2 aria-hidden="true" />
          <span>
            <strong>{t('file.selected')}</strong> {file.name}
          </span>
        </div>
      )}

      <div className="button-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={runFileTab}
          disabled={!file || busy}
        >
          <Play />
          {t('file.process')}
        </button>
        <button
          type="button"
          className="btn btn--success"
          onClick={download}
          disabled={!fileOutput}
        >
          <Download />
          {t('file.download')}
        </button>
      </div>

      {busy && <Progress value={progress} label={t('progress.processingFile')} />}

      <TextArea
        id="file-output"
        label={t('file.outputLabel')}
        value={fileOutput}
        readOnly
        placeholder={t('file.outputPlaceholder')}
      />
    </div>
  );
}
