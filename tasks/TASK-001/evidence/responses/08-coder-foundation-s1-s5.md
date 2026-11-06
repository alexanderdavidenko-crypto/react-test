## Контекст
Реализованы шаги S1-S5 плана TASK-001. S6-S9 не трогал: App.tsx и стили остались шаблонными. Все три проверки (lint, build, test) завершились с кодом 0.

Роль: coder. Загружены rulesets common/coder (typescript-and-project-fit, essential-behavior-tests) и framework/coder INDEX. Секции project нет. Web-interface-guidelines не читал, UI не менялся.

Остановок из-за конфигов не было: пользователь уже внёс `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, секцию `test` в `vite.config.ts` (jsdom + `setupFiles: ./src/test/setup.ts`) и скрипт `test`. Зависимости и конфиги я не менял. `src/` я не коммитил и не добавлял в индекс (git add не делал). `tasks/` и `workflow-log.md` не трогал. Ранее изменённый `workflow-log.md` (M) к моей работе не относится.

## Изменённые и созданные файлы (все в /home/user/Work/Current/accelerator/react-test)
Изменён: `src/main.tsx`.

Созданы:
- `src/shared/lib/datetime.ts`
- `src/shared/api/{types,errors,mappers,client}.ts`
- `src/shared/router/index.ts`
- `src/mocks/{clock,store,handlers,scenarios,browser,node}.ts`
- `src/test/{setup.ts,constants.ts,render.tsx,infrastructure.test.ts}`

## Реализовано по шагам
**S1 datetime**
- `parseIso` принимает ISO UTC с `Z`, с миллисекундами и без.
- `formatIsoUtc` и `shiftIso` выдают строку без миллисекунд.
- Форматы: `formatListDateTime` ("Aug 3, 18:00"), `formatDetailsDateTime` (с коротким именем пояса), `formatTimestamp`.
- `localToIsoUtc(date, time)` возвращает `{ok:true, iso}` или `{ok:false, reason}`. Причины: `invalid-date`, `invalid-time`, `nonexistent-time`. Несуществующее время (переход на летнее) ловится обратным разбором.
- `isFuture`, `currentTime`.
- Форматтерам можно передать `timeZone` для детерминизма.

**S2 api**
- `types.ts` повторяет контракт.
- `errors.ts`: `ApiError`, `NetworkError`, `ResponseShapeError` с `kind`, без enum и parameter properties. Есть `isApiError(e, code?)`.
- `mappers.ts`: строгая проверка формы. Неизвестный enum, неверный тип и не-ISO дата дают malformed. Лишние поля игнорируются.
- `client.ts`: единственный `fetch`. Результат `{ok:true,data} | {ok:false,cancelled:false,error} | {ok:false,cancelled:true}`.
- Разбор ответа по разделу 4 api-integration:
  - не 2xx с контрактным телом даёт `ApiError`, без него `ResponseShapeError` с HTTP-статусом;
  - неожиданный 2xx и не-JSON дают malformed.
- Запрос списка: `query` после trim, пустые значения не уходят, `scenario` не передаётся, id кодируется через `encodeURIComponent`.
- GET отменяются. `createSession(request)` не принимает signal (решение 10=A).

**S3 router**
- `navigate(to, {replace, state})`, `readHistoryState`, `useLocation` (`useSyncExternalStore`, `popstate` и собственное событие).
- `matchPath("/sessions/:id", path)`, `getSearchParam`, `updateSearch(search, updates)` (чужие параметры сохраняются), `useRedirectUnknown(patterns, fallback)` (`replace` с сохранением search).
- Доменных имён слой не знает.

**S4 mocks**
- `clock.ts`: `computeDelta`, рекурсивный `shiftTimestamps` по `timestampFields` (включая `cancelledAt`).
- `store.ts`: фикстуры идут через маппер и сдвиг. `resetStore({empty?, now?})`. Новые сессии добавляются в конец, id `ses_<max+1>`, без усечения.
- `handlers.ts`: четыре эндпоинта.
  - Список: фильтры применяются до `meta.total`; поиск по title, coach, location.name и location.address; `400 INVALID_FILTER` для неизвестного `status`.
  - Детали: `404 SESSION_NOT_FOUND` с текстом из `unknown-session`.
  - POST: `400 VALIDATION_FAILED` с `fieldErrors`, `201` с trim и пустыми необязательными полями как `null`.
  - Задержка 250 мс из JSON, `setMockLatency(0)` для тестов.
- `scenarios.ts`:
  - ровно шесть имён;
  - `resolveScenario`: `?scenario=`, затем `VITE_MOCK_SCENARIO`, затем `normal`; неверное имя даёт `console.warn` и откат;
  - `activateScenario(name)` делает сброс store (для `empty` пустой) и возвращает переопределяющие обработчики, тексты из `mock-scenarios.json`;
  - `details-error` действует только на `ses_101`, `create-error` на любой POST.
- `browser.ts`: `setupWorker`, лог сценария и источника, `await worker.start`. `onUnhandledRequest` даёт ошибку только для `/api`, остальное идёт мимо (bypass). `node.ts`: `setupServer`.
- `main.tsx`: `if (import.meta.env.DEV)` с динамическим `import('./mocks/browser.ts')`, `await startBrowserMock()` до `createRoot().render`.

**S5 test**
- `setup.ts`: `server.listen({onUnhandledRequest:"error"})`. В `beforeEach` подменяется только `Date` (`vi.useFakeTimers({toFake:["Date"]})`, время `2026-08-01T10:00:00Z`), задержка 0, `resetStore()`. В `afterEach` `cleanup`, `resetHandlers`, `useRealTimers`, сброс URL. Полифил `showModal/close` включается только при отсутствии метода.
- `render.tsx`: `renderAt(ui, url)` ставит URL и возвращает RTL-результат плюс `userEvent`. Компонент `App` в него не вшит, потому что `src/app/App.tsx` появится в S6.
- `constants.ts`: `FROZEN_NOW`.

## Тесты
Один инфраструктурный тест, `src/test/infrastructure.test.ts`. Он оформлен как `it.each([1,2])`, то есть один тест выполняется два раза. Проверяет:
- раннер находит тесты;
- `msw/node` перехватывает `/api` через `getSessions` и `createSession`;
- время заморожено;
- сдвиг фикстур: `ses_101` получает `2026-08-08T14:00:00Z`;
- store сброшен между тестами: после POST в первом прогоне второй видит `total=5`.

Так сделано потому, что сброс между тестами нельзя доказать одним прогоном; формально это 2 исполнения. Если нужен буквально один `it`, пункт про сброс store придётся убрать из теста.

Тесты поведения S6-S8 и risk-тесты раздела 8 не писал.

## Проверки (рабочая директория — корень репозитория)
| Команда | Код выхода | Ключевой вывод |
|---|---|---|
| `npm run lint` | 0 | oxlint, замечаний нет |
| `npm run build` (`tsc -b && vite build`) | 0 | `✓ 21 modules transformed`, `✓ built in 104ms` |
| `npm run test` | 0 | `Test Files 1 passed (1)`, `Tests 2 passed (2)` |

## Проверка непроверенного из раздела 7
- **Импорт JSON вне `src/` под tsc**: `tsc -b` проходит без правки `tsconfig.app.json` (код 0). Импорты `frontend-accelerator-assessment/fixtures/*.json` из `src/mocks` типизируются. Правка конфига не нужна, расхождение 13 снято.
- **`showModal` в jsdom 31**: метода `showModal` и `close` нет (`typeof` равен `undefined`, вызов даёт `TypeError: d.showModal is not a function`). Добавлен условный полифил в `setup.ts`. Он только ставит и снимает `open`, `close` шлёт событие `close`, проверено scratch-тестом (`[true,false,1]`). Фокус, инертность фона, Esc и событие `cancel` не моделируются, они остаются на browser-verify.
- **Фейковые таймеры и MSW**: при `toFake:["Date"]` и задержке мока 250 мс запрос выполняется реально (`Date` заморожен всё время ожидания). Полный `vi.useFakeTimers()` с задержкой 250 мс: ответ не пришёл за 5 с, тест упал по таймауту, пока таймеры не продвинуты вручную. Принято решение подменять только `Date`. Совместимость с debounce 300 мс и `userEvent` проверится на S6, на уровне инфраструктуры не проверялась.
- **Мок и фикстуры в `dist`**: после `npm run build` в `dist` нет строк `SESSIONS_UNAVAILABLE`, `U14 Shooting`, `setupWorker`, `referenceNow`, `VITE_MOCK`, `coach_01` (grep по `dist`: совпадений нет). Динамический import под `DEV` исключает мок. Оговорка: код `shared/api` в бандл тоже не попал, потому что пока нигде не используется, поэтому «чистоту» от мока подтверждает именно отсутствие мок-строк. `public/mockServiceWorker.js` скопирован в `dist` как статика (как и ожидалось).
- **`VITE_MOCK_SCENARIO`**: запускал `VITE_MOCK_SCENARIO=list-error npx vite --port 5199 --strictPort`. Трансформированный `src/mocks/browser.ts` содержит `import.meta.env = {..., "VITE_MOCK_SCENARIO": "list-error"}`, то есть переменная окружения процесса подхватывается. Сервер остановил (порт 5199 свободен, процесс завершён).
- **Порядок чтения scenario**: `resolveScenario` проверен юнит-проверкой: URL приоритетнее env, неверное имя в URL откатывается на env, неверное имя и в URL, и в env даёт `normal`. Выдаётся 3 `console.warn` на 3 неверных значения. Мок стартует в `main.tsx` до `render`, а редирект роутера (`useRedirectUnknown`) работает в компонентах, так что `search` читается раньше. Реальный запуск в браузере с редиректом не проверялся, потому что редирект появится в S6.
- **Не проверено** (нет браузера и запуска worker): реальный старт `setupWorker`, `onUnhandledRequest` в браузере, консольные сообщения в браузере, `npm run dev` с UI. Нужен browser-verify или ручной запуск.

Scratch-проверки (убраны, в репозитории не остались) подтвердили:
- `ApiError` и `fieldErrors`;
- HTML со статусом 200 даёт `malformed`;
- `HttpResponse.error()` даёт `network`;
- abort даёт `{cancelled:true}`;
- 404 на деталях;
- POST в `empty` добавляет сессию и она видна в списке;
- `400` с набором ошибок по полям;
- ошибка календарной даты (30 февраля).

Они не заменяют risk-тесты раздела 8, их по плану пишет следующая роль.

## Оставшиеся риски
- Поведение debounce, `userEvent` и MSW вместе проверится на S6.
- Полифил `<dialog>` минимален.
- Формат `ses_<n>` и порядок "новые в конец" остаются допущениями (B-8, B-10).
- Мок-код и фикстуры исключены из прод-бандла проверкой `dist`; `npm run preview` не запускал.
- Если часовой пояс браузера имеет переход на летнее время, `localToIsoUtc` проверялся только на невалидной дате. Случай несуществующего локального времени не проверялся ни в какой зоне.

## Вопросы к пользователю
1. Достаточно ли `it.each([1,2])` как "одного" инфраструктурного теста или нужен буквально один `it`?
2. `createSession` не принимает `signal` (в плане `opts`). Это сделано по решению 10=A. Подтвердить.

## Расхождения плана с реальностью
- Раздел 3 плана: `npm run test` появился после S0, и скрипт действительно есть; `vite.config.ts` уже содержит `test`.
- Расхождение 13 снято (`resolveJsonModule` не нужен).
- `render.tsx` не рендерит `App` напрямую: `src/app/App.tsx` пока нет, поэтому `renderAt(ui, url)` принимает любой элемент. В S6 нужно будет передавать `<App />`.
- Я добавил `src/test/constants.ts`, которого нет в плане: общий `FROZEN_NOW` без повторного импорта `setup.ts` из теста.
- `sessions.json` используется только для порядка id (данные берутся из `session-details/*.json`).

## Следующий шаг
Основной: S6 (срез «список и фильтры») тем же coder. Альтернативы по ситуации: code-reviewer или test-generator после S5, если нужна независимая проверка фундамента до продолжения. Выбор за пользователем, следующую роль не запускал.
