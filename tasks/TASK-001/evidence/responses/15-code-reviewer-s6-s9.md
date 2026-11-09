Ревью диапазона e23e4f7..3d98cd5 (S6–S9). Файлы в tasks/ и evidence/ не смотрел, foundation не пересматривал.

Роль code-reviewer, только чтение. Отдельный skill-инструмент мне недоступен, поэтому ревью выполнено напрямую по описанию роли. Код, документы и git не менял. Запускал только проверки без записи: `npx vitest run` дал 5 файлов и 21 тест, все прошли. `npx tsc -p tsconfig.app.json --noEmit` ошибок не показал. `npx oxlint` ничего не вывел. `git status` показывает только `M tasks/TASK-001/workflow-log.md`, это было до ревью.

## Вердикт: PASS

Blocker и major не найдено. Ниже 6 minor и 7 nit, их стоит поправить или принять как ограничения. Всё, что требует реального браузера, вынесено в список browser-verify в конце.

## Findings

### Blocker
Нет.

### Major
Нет.

### Minor

**M-1. Нет запасного варианта рамки фокуса строки там, где нет `:has()`.**
- Подтверждено: `src/App.css:194-200`. Ссылка получает `.session-link:focus-visible { outline: none; }`, а рамку рисует только `.session-row:has(.session-link:focus-visible)`.
- Последствие: в движках без `:has()` (например, Firefox до 121) у ссылки остаётся только подчёркивание, а в ui-design 8 запрещён `outline: none` без замены (AC-7.2).
- Исправление: обернуть `outline: none` в `@supports selector(:has(*))` или оставить на ссылке запасной outline.

**M-2. Устаревший `justCleared` даёт ложное сообщение в live-регионе.**
- Подтверждено: `SessionsPage.tsx:153,177,185,206-207`. Флаг сбрасывается только при вводе в поиск и смене статуса.
- Сценарий: «Clear filters», затем «Назад» в браузере к отфильтрованному URL. Список с фильтрами при `justCleared===true` озвучится как «Filters cleared. N sessions.».
- Исправление: сбрасывать флаг при смене `search` (по `seenQuery` и статусу) или выводить его из истории.

**M-3. Debounce-таймер поиска не отменяется при внешней навигации.**
- Подтверждено: `SessionsPage.tsx:174-180`. Таймер чистится только при вводе, очистке и размонтировании.
- Сценарий: ввод и «Назад» в течение 300 мс. Таймер срабатывает и через `replace` перезаписывает URL, который выбрал пользователь, а AC-1.11 требует, чтобы список всегда соответствовал URL.
- Исправление: при смене `pathname`/`search` не от нашего же `replace` сбрасывать таймер, либо в колбэке сверять, что `search` ещё тот, что был при вводе.
- Это пограничный случай, но формально это гонка из пункта 4 задания.

**M-4. Пустая область списка на время перезапроса, если прежние данные пусты.**
- Подтверждено: `SessionsPage.tsx:290` требует `status === "success"` для empty/no-match, а `:310` требует `rows.length > 0`. `useSessions.ts:111-112` при `loading` отдаёт прежние данные.
- Сценарий: в состоянии no-match или empty нажать «Clear filters», либо создать сессию в сценарии `empty`. Пока идёт запрос, area пуста (нет ни скелетона, ни сообщения), потом идёт скачок вёрстки.
- Исправление: при `isRefreshing` и пустых прежних данных показывать скелетон либо приглушённое прежнее состояние. Ui-design 9 обещает «высота не скачет».

**M-5. 404 деталей не озвучивается.**
- Подтверждено: `SessionDetailsDialog.tsx:447-452`. Блок «Session not found» без `role`, а загрузочный `role="status"` уже удалён. Фокус стоит на h2 с названием «Session details» (эффект на `:366-372`).
- Скринридер не услышит причину. Для `error` есть `role="alert"` (`:438`), и в ui-design 9 он тоже сказан только для error.
- Исправление: добавить `role="status"` или `role="alert"` на not-found, либо включить заголовок состояния в фокус.

**M-6. Пробелы в essential-тестах S6–S8 (по риску).**
- Не покрыты:
  - Назад/Вперёд по истории фильтров (AC-1.11 помечен A);
  - подтверждение закрытия грязной формы (Esc, «×», «Cancel», «Keep editing»/«Discard», refetch после неопределённого исхода POST);
  - «Clear filters» на экране успеха, включая сообщение «Filters cleared.»;
  - 404 и error деталей (retry), `details-error`;
  - граничные значения AC-3.1–3.8 (2/3 и 80/81 символов, 29/30/240/241, 0/1/100/101, notes 500/501) и предел описания A-13;
  - text ошибок сети/malformed для POST;
  - гонки: быстрая смена фильтров с отменой запроса, один `AbortController` на GET и отсутствие `signal` у POST (проверено только чтением).
- Для AC-9.1 набор в целом достаточен: loading, empty/no-match, list-error, validation, 500/400, coaches-error, навигация деталей. AC-9.2 допускает «больше при оправданном риске».
- Хрупкое или слабое место: `create-session.test.tsx:85` жёстко ждёт «8 fields need attention», это число полей формы. `:122` проверяет `startsAt` регэкспом `1[45]T…:00Z`, то есть конверсия local→UTC на конкретном часовом поясе не проверяется.
- Побочных эффектов между тестами не нашёл. Слушатели `server.events` снимаются в `afterEach`, `resetStore`/`setMockLatency` и `useFakeTimers({toFake:["Date"]})` сбрасываются в `setup.ts`, `activateScenario` внутри теста гасится `resetHandlers`. Допускаю, но не проверял, что `posts.push(await request.clone().json())` в `request:start` асинхронный. Сейчас гонку страхует ожидание заголовка «Session created».
- Исправление: добавить 2–3 компактных теста: Back/Forward и 404; таблично-параметризованные границы валидатора (чистая функция `validate`, без UI); confirm-закрытие.

### Nit

- **N-1. Мёртвый код.**
  - `formatDetailsDateTime` в `shared/lib/datetime.ts:92` нигде не используется. Это из foundation, S7 использует `formatDetailsSchedule`. Удалить, либо принять.
  - `SessionsStatus` содержит `"idle"` (`useSessions.ts:5`), хук его не возвращает.
  - Ветка `result.cancelled` в `useCreateSession.ts:390-393` недостижима: у POST нет `signal` (решение 10=A). Оставить с комментарием или сузить тип.
- **N-2. Дубли.**
  - `formatSummaryDateTime` и `formatListDateTimeCompact` (`datetime.ts:160-186`) отличаются одним разделителем (` at ` и ` · `). Вынести общие части.
  - `isStatus` продублирован в `SessionsPage.tsx:135` и `filters.ts:18`.
  - Шаблон `Settled + key + abort` повторён в `useSessions`, `useSessionDetails`, `useCoaches`. Общий хук-ресурс сократил бы код. Для S6–S8 это допустимо.
  - Новые форматтеры не покрыты тестами.
- **N-3. Размер `CreateSessionDialog.tsx`, 640 строк.** Граница слоёв соблюдена (features не лезут в mocks/fetch). Ниже примерное разбиение, чтобы файл читался: ① хук фокуса, подтверждения и закрытия (`:150-241`, около 90 строк эффектов и ref-ов, больше 10 штук); ② поля формы в отдельные компоненты (`DateTimeFields`, `CoachField`, `VisibilityFieldset`); ③ `ariaFor` + `Field` уже вынесены, но блоки `ariaFor(...)` повторяются 12 раз.
- **N-4. Счётчик символов и валидация расходятся.** `descriptionLength`/`notesLength` считают длину без trim (`CreateSessionDialog.tsx:295-296`), валидатор считает после trim. Показ «1001 / 1000» при отсутствии ошибки возможен.
- **N-5. Дубль заголовка при загрузке деталей.** Видимая метка `details-label` и h2 одновременно дают «Session details» (`SessionDetailsDialog.tsx:407-410`, `copy.details.label`). Скринридер прочитает название диалога дважды.
- **N-6. Клик по backdrop деталей.** `handleBackdropClick` закрывает при `target === currentTarget` (`:389-391`), поэтому выделение текста с отпусканием за пределами рамки закроет диалог. Мелочь.
- **N-7. `viewport-fit=cover` в `index.html` не задан.** `env(safe-area-inset-*)` на `App.css:764` без него равны 0 на iOS, правило ничего не делает. Не дефект, а то, что стоит проверить в browser-verify. Повтор prefers-reduced-motion (`App.css:291-294`, `333-336`) дублирует глобальный блок `index.css:90-96`, оставлять оба необязательно. `src/App.css` лежит вне `app/`, но подключается из `app/App.tsx`.

## Что проверено по коду и соответствует документам

**Фильтры и список (AC-1.x, 4.x, ui-design 4, 9):**
- Фильтры только в URL через `readFilters`/`writeFilters`/`clearFilters` (`filters.ts`). Невалидный `status` трактуется как «все» и на сервер не уходит, пустой или пробельный `query` не пишется, посторонние параметры сохраняются. Тест `?status=bogus&query=%20%20` проверяет пустой запрос.
- `replace` без роста истории, debounce `SEARCH_DEBOUNCE_MS = 300` (`SessionsPage.tsx:124,179`). Поле поиска синхронизируется с URL во время рендера (`:149-152`). Тест проверяет `history.length`.
- AbortController на GET (`useSessions.ts:88-97`, `useSessionDetails.ts:212-221`, `useCoaches.ts:303-312`). Устаревший ответ отбрасывается проверкой `aborted` плюс ключом запроса. Состояние `loading` выводится при рендере, без setState в эффекте. У POST нет `signal`.
- Состояния списка: skeleton из 5 строк, empty с «Create session», no-match с тремя текстами и «Clear filters», error (api, network, malformed) с «Try again», сохранение фильтров. Фокус после «Clear filters» на поле поиска, live-регион вне списка, `aria-busy`. Все тексты совпадают с ui-design 10 дословно.
- Детали: loading, success, error, 404 (`isApiError(..., "SESSION_NOT_FOUND")`, без «Try again», кнопка «Back to sessions»), `null` в описании и заметках не рисуются, сводка вместимости по Q-4. Данные другого `id` не показываются (`key={detailsId}` + `data: null` при несовпадении ключа). Закрытие: `cameFromList()` → `history.back()`, иначе `replace` на `/sessions` + search. Возврат фокуса на ссылку строки или `h1`.
- Статусы не только цветом: иконка `aria-hidden` + текст (`StatusBadge.tsx`).

**Форма (AC-3.x, A-13, ui-design 6–7):**
- `validate` — чистая функция по trim-значениям, лимиты `LIMITS` соответствуют AC-3.1–3.8 и A-13, тексты ошибок дословно из 6.3. Дата и время собираются через `localToIsoUtc`, ошибки «в прошлом» и «несуществующее время» различаются. Тренер проверяется по id из последнего успешного `GET /api/coaches`.
- Guard в `useCreateSession`: флаг `pending` через `useRef` (синхронно, `:375`), `createSession` не вызывается без валидного `coachId`, `blocked` → фокус на Coach. Двойной клик в тесте даёт один POST.
- `fieldErrors` разделяются на поля и «без поля» (`splitServerErrors`), серверная ошибка снимается при редактировании поля. 500/400/сеть-malformed дают три разных текста. При неопределённом исходе `outcomeUnknown` → refetch при закрытии.
- Связь: `aria-invalid` и `aria-describedby` через `ariaFor`, id совпадают с `Field` (`-hint`, `-counter`, `-error`). У пары Date/Start time общая ошибка `cs-starts-at-error` описывает оба контрола, оба помечены invalid. У `fieldset` видимости `aria-describedby` на ошибку. Polite-статус «N fields need attention» всегда в DOM. Блок ошибки формы `role="alert"`, `tabIndex=-1`, получает фокус.
- Pending: кнопка с `aria-disabled`, «Cancel»/«×» disabled, Esc игнорируется, `aria-busy`. Подтверждение закрытия: `isDirty` → подвал заменяется на «Discard this session? …», фокус на «Keep editing» и возвращается туда, где был. Backdrop-клик форму не закрывает. Экран успеха: `role="status"`, фокус на h2, «Open session»/«Create another»/«Close», «Clear filters» только при активных фильтрах, фокус на «Open session» до исчезновения кнопки, сообщение «Filters cleared.». `skipRestore` при «Open session» избегает конфликта фокуса с деталями.
- `coaches-error`: на месте select сообщение `role="alert"` и «Try loading coaches again», остальная форма доступна, сброс выбранного тренера, который пропал после повтора, фокус после повтора по 6.4.

**Запреты проекта:** `new Date`, `Intl`, `toLocale*` только в `shared/lib/datetime.ts` (grep по `src` вне тестов и datetime пуст). Единственный `fetch` в `shared/api/client.ts:56`. Фикстуры вне `src/mocks` не импортируются (единственный внешний импорт `./mocks/browser.ts` динамический и только в dev, `main.tsx:9`). Прямого доступа к бэкенду нет. Слои architecture.md соблюдены: `shared/router` не знает про `query/status`, `features/sessions` владеет ими, `app` только композиция.

**Адаптив в коде (проверено чтением):**
- `.start-wide` и `.start-narrow` скрываются через `display: none` (`App.css:172-180`, `686-692`), то есть вне дерева доступности, дубля даты для скринридера нет. Брейкпоинт 720px: строки стеком, область `"status capacity" / session / start / coach` совпадает с ui-design 4.3, поля 44px и 16px применяются и к форме. 640px: полноэкранные диалоги с `100dvh` и `env(safe-area-inset-*)`, `field-row` в одну колонку. В диапазоне 641–720px список мобильный, диалог обычного размера с мобильными полями. Это совпадает с формулировкой задания.
- `body:has(dialog[open]) { overflow: hidden }`, `overscroll-behavior: contain` на теле диалога, `touch-action: manipulation`, 44px для «×» и radio на мобильном. UA-ограничение `max-width` диалога переопределено на `100vw`. Reduced motion: глобальный блок в `index.css` плюс локальные.

**Тесты:** 21 из 21 проходят, поведенческие запросы наблюдаются на HTTP-границе (msw), не на реализации.

## Остаётся для browser-verify (по коду вывода сделать нельзя, это не дефекты)

1. Реальный `showModal()`: фон инертен, фокус на h2 деталей и на Title формы (десктоп) или h2 (coarse pointer), возврат фокуса на ссылку строки и на «Create session», в том числе когда открыватель исчез (кнопка пустого состояния), «Open session» → h2 деталей.
2. Esc на деталях и на форме (чистой, грязной, на confirm, на pending). Повторный Esc при отменённом `cancel`: ветка `handleNativeClose` (`CreateSessionDialog.tsx:234-241`) есть только у формы. У деталей аналогичной защиты нет, но закрытие там идёт через навигацию. Хватает проверить, что при быстром двойном Esc диалог деталей не остаётся закрытым при смонтированном маршруте. Полифил `close` в тестах синхронный (N-7 прошлого ревью).
3. Видимость рамки фокуса строки (`:has()`) и ссылки в строке, фокус внутри полей формы и на «×», контраст приглушённого списка при `is-refreshing` (opacity 0.55), `prefers-reduced-motion` для диалога и скелетона.
4. Брейкпоинты 390×844, 641–720px и 1440×900: отсутствие горизонтальной прокрутки, высота строки 64px и 44px цели, поведение на 641–720px (две колонки `field-row` в диалоге около 609px), перенос длинных названий и адресов, `100dvh` и safe-area на iOS (при отсутствии `viewport-fit=cover` правило безвредно, но неактивно), шрифт 16px против zoom.
5. Поведение нативных `type=date` и `type=time` в разных браузерах и на touch, пустой ввод при частично введённой дате, `type=number` с «e».
6. Клавиатура: Tab-порядок в диалогах, активация радио и select, скринридер: читаемость строки списка (подписи Starts/Duration/Coach/Location/Status), live-регионы списка и формы, не-озвучивание 404 (M-5).
7. Консоль и сеть на основных сценариях, отмена GET при быстром вводе в Network-панели, один POST при двойном клике, поведение сценариев `empty`, `list-error`, `details-error` (ses_101), `coaches-error`, `create-error` вживую.

Запись в `tasks/TASK-001/review.md` сделает разработчик; следующую роль не запускал. STOP.