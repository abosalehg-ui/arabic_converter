import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './theme/ThemeProvider';
import { I18nProvider } from './i18n/I18nProvider';
import { ToastProvider } from './feedback/ToastProvider';
import { HistoryProvider } from './history/HistoryProvider';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <HistoryProvider>
            <App />
          </HistoryProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>
);
