# Training Sessions Workspace

Рабочее пространство тренерского бизнеса: список тренировочных сессий с поиском и фильтром по статусу, детали сессии и форма создания. Интерфейс на английском. Бэкенда нет: API мокается через MSW (`msw@2.14.6`), данные берутся из `frontend-accelerator-assessment/fixtures/`.

Стек: React 19, TypeScript, Vite, npm.

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес, который напечатает Vite (обычно `http://localhost:5173/`); приложение перенаправит на `/sessions`.

Мок включается только в режиме разработки (`npm run dev`): при `import.meta.env.DEV` в браузере регистрируется service worker MSW (`public/mockServiceWorker.js`). В сборке `npm run build` / `npm run preview` мок не запускается, запросы к `/api` пойдут на настоящий сервер, которого в репозитории нет. Данные мока живут в памяти страницы и сбрасываются при перезагрузке.

## Сценарии мока

Сценарий выбирается один раз при старте приложения. Приоритет:

1. параметр `?scenario=` в адресе, например `http://localhost:5173/sessions?scenario=empty`;
2. переменная окружения `VITE_MOCK_SCENARIO`, например `VITE_MOCK_SCENARIO=list-error npm run dev` (или строка `VITE_MOCK_SCENARIO=list-error` в `.env.local`);
3. `normal` по умолчанию.

Неизвестное имя игнорируется с предупреждением в консоли (`console.warn`), берётся следующий источник (пустое значение `?scenario=` тоже даёт предупреждение; пустая `VITE_MOCK_SCENARIO` пропускается без предупреждения). Выбранный сценарий пишется в консоль (`[mock] scenario: ...`). После смены сценария перезагрузите страницу.

Допустимые названия (`src/mocks/scenarios.ts`):

| Сценарий | Поведение |
| --- | --- |
| `normal` | обычные данные из фикстур |
| `empty` | список без сессий |
| `list-error` | ошибка запроса списка сессий |
| `details-error` | ошибка запроса деталей одной сессии |
| `coaches-error` | ошибка запроса списка тренеров (форма создания) |
| `create-error` | ошибка создания сессии |

Параметры ошибок (статус, код, сообщение) берутся из `frontend-accelerator-assessment/fixtures/mock-scenarios.json`.

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | dev-сервер Vite с моком |
| `npm run lint` | Oxlint (`oxlint`) |
| `npm run build` | проверка типов (`tsc -b`) и сборка (`vite build`) |
| `npm run test` | разовый запуск тестов (`vitest run`, jsdom, MSW в Node) |
| `npm run preview` | предпросмотр собранного бандла (без мока) |
