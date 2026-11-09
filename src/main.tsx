import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'

async function bootstrap(): Promise<void> {
  // Мок только в dev: условный динамический import исключает его из прод-бандла.
  if (import.meta.env.DEV) {
    const { startBrowserMock } = await import('./mocks/browser.ts')
    try {
      await startBrowserMock()
    } catch (error) {
      // Мок не поднялся (например, не зарегистрировался service worker): приложение всё равно рендерим.
      console.error('Не удалось запустить браузерный мок (MSW); приложение запущено без него.', error)
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
