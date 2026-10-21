import { vi } from './shared/i18n/vi';

export function App() {
  return (
    <main>
      <h1>{vi.app.name}</h1>
      <p>{vi.app.tagline}</p>
      <p>{vi.app.comingSoon}</p>
    </main>
  );
}
