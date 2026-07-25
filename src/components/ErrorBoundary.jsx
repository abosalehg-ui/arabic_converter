import { Component } from 'react';

/**
 * Catches render-time crashes so an unexpected error shows a recoverable
 * message instead of a blank page.
 *
 * The fallback deliberately uses hard-coded bilingual text and inline-free
 * styling from `components.css`: it has to work even when the failure is in the
 * i18n or theme providers themselves.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error in the app:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="crash" dir="auto">
        <h1>حدث خطأ غير متوقع · Something went wrong</h1>
        <p>يمكنك إعادة تحميل الصفحة للمتابعة. بياناتك المحفوظة لم تتأثر.</p>
        <p>Reloading the page should fix it. Your saved data is untouched.</p>
        <button type="button" onClick={() => window.location.reload()}>
          إعادة التحميل · Reload
        </button>
      </div>
    );
  }
}
