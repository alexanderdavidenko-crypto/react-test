import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function bootstrap(): Promise<void> {
  // Мок только в dev: условный динамический import исключает его из прод-бандла.
  if (import.meta.env.DEV) {
    const { startBrowserMock } = await import('./mocks/browser.ts')
    await startBrowserMock()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
