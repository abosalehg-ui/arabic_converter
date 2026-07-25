import { FileInput, Wand2 } from 'lucide-react';
import { ProcessorTab } from './ProcessorTab';
import { useI18n } from '../../i18n/I18nProvider';
import { useToast } from '../../feedback/ToastProvider';

const EXAMPLE =
  '"ep_02.reb_basesaved05" "انطلق يا حمد!"\n"ep_02.reb_basesaved06" "ها هو قادم! ها هو حمد قادم!"';

function Instructions() {
  const { t } = useI18n();
  return (
    <div className="instructions">
      <div className="instructions__title">{t('quoted.instructionsTitle')}</div>
      <div className="instructions__intro">{t('quoted.instructionsIntro')}</div>
      <ul className="instructions__list">
        <li>{t('quoted.pattern1')}</li>
        <li>{t('quoted.pattern2')}</li>
        <li>{t('quoted.pattern3')}</li>
      </ul>
    </div>
  );
}

export function QuotedTextProcessor() {
  const { t } = useI18n();
  const { showToast } = useToast();

  return (
    <ProcessorTab
      id="quoted"
      primaryIcon={Wand2}
      primaryLabel="quoted.process"
      before={<Instructions />}
      extraActions={({ setInput }) => (
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            setInput(EXAMPLE);
            showToast(t('toast.exampleInserted'), 'success');
          }}
        >
          <FileInput />
          {t('quoted.insertExample')}
        </button>
      )}
    />
  );
}
