import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Frontend-Fehler:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" className="mx-auto max-w-2xl p-8 text-slate-900">
          <h1 className="text-2xl font-semibold">Die Ansicht konnte nicht angezeigt werden.</h1>
          <p className="mt-2">Bitte lade die Seite neu oder versuche es später erneut.</p>
          <button type="button" className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-white" onClick={() => window.location.reload()}>
            Seite neu laden
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
