import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './theme/ThemeProvider';
import { I18nProvider } from './i18n/I18nProvider';
import { ToastProvider } from './feedback/ToastProvider';
import { HistoryProvider } from './history/HistoryProvider';
import { TabsProvider } from './state/TabsProvider';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Outermost, so a failure inside any provider still renders a message. */}
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>
            <HistoryProvider>
              <TabsProvider>
                <App />
              </TabsProvider>
            </HistoryProvider>
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
