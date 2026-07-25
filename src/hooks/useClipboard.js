import { useCallback } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { useToast } from '../feedback/ToastProvider';

/**
 * Copies text to the clipboard and reports the real outcome.
 *
 * The previous per-tab copies all reported "nothing to copy" when the clipboard
 * write itself failed — which happens on an insecure origin or when the user
 * denies permission, and has nothing to do with the text being empty.
 *
 * @returns {(text: string) => Promise<boolean>}
 */
export function useClipboard() {
  const { t } = useI18n();
  const { showToast } = useToast();

  return useCallback(
    async (text) => {
      if (!text?.trim()) {
        showToast(t('toast.nothingToCopy'), 'error');
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        showToast(t('toast.copySuccess'), 'success');
        return true;
      } catch {
        showToast(t('toast.copyFailed'), 'error');
        return false;
      }
    },
    [t, showToast]
  );
}
