### Context Summary
Исправлены находки ревью S6–S9: M-1…M-5 и nit 6–8 (в review это N-1, N-4, N-7). Правки сделаны только через Edit. Зависимости, конфиги, tasks/ и workflow-log.md не тронуты (workflow-log.md уже был изменён до меня). Коммитов нет. Новых тестов нет, существующие не менялись. Skill `coder` отдельным инструментом мне недоступен, работал напрямую по описанию роли.

### Evidence
Запуски (фактический вывод):
- `npm run lint`: oxlint, без замечаний, EXIT 0.
- `npm run build`: `tsc -b && vite build`, 43 модуля, built in 112ms, EXIT 0.
- `npm run test`: vitest, Test Files 5 passed (5), Tests 21 passed (21), EXIT 0.

Изменённые файлы (все в /home/user/Work/Current/accelerator/react-test):
- index.html
- src/App.css
- src/features/sessions/SessionsPage.tsx
- src/features/sessions/useSessions.ts
- src/features/sessions/SessionDetailsDialog.tsx
- src/features/create-session/CreateSessionDialog.tsx
- src/features/create-session/useCreateSession.ts
- src/shared/lib/datetime.ts

**Что подтверждено запуском, а что чтением.** Запуск (lint, tsc, 21 тест) подтверждает только то, что ничего не сломалось. Новое поведение M-1…M-4 ни один тест не проверяет, оно реализовано по документам и подтверждено чтением кода. Фокус, озвучка и вёрстка в браузере не проверялись.

**M-1 (App.css).**
- Сделано: `outline: none` на `.session-link:focus-visible` и рамка строки через `:has` вынесены в `@supports selector(:has(*))`. Без `:has()` остаётся outline на самой ссылке.
- Подтверждено: чтением кода и успешной сборкой.
- Для browser-verify: видимость рамки строки в браузерах с `:has()` и в браузерах без него.

**M-2 (SessionsPage.tsx).**
- Сделано: введён `seenFiltersKey` (по query+status) со сбросом `justCleared` во время рендера при любом изменении фильтров из URL, включая Back/Forward. `handleClear` сразу ставит ключ сброшенных фильтров, поэтому сам сброс флаг не обнуляет (URL и флаг обновляются в одном батче).
- Подтверждено: чтением кода; существующие тесты проходят. Отдельный тест не писал: проверка Back после Clear относится к пробелам M-6 для test-generator.
- Для browser-verify: сценарий Clear filters, затем «Назад», и live-регион при этом.

**M-3 (SessionsPage.tsx).**
- Сделано: эффект на `[pathname, search]` отменяет debounce-таймер при внешней навигации. Собственные `replace` помечаются `ownNavigation`, поэтому ввод текста плюс смена статуса в окне 300 мс по-прежнему записывают query. Если таймер был отменён, поле поиска возвращается к значению из URL. После срабатывания таймера `timer.current` обнуляется.
- Подтверждено: чтением кода; тесты проходят. Теста на гонку нет, потому что это пограничный случай, в M-6 он описан как пробел.
- Для browser-verify: ввод и «Назад» в течение 300 мс.

**M-4 (SessionsPage.tsx, useSessions.ts, App.css).**
- Вариант определён в ui-design: раздел 9 («прежние данные остаются на экране, приглушены, `aria-busy`, высота не скачет», скелетон только при первичной загрузке) и матрица 13 («при смене фильтров прежние данные приглушены»). Документы вариант задают, поэтому я не останавливался. Выбрал «прежнее содержимое приглушённо», скелетон не использовал.
- Сделано: empty и no-match теперь рисуются и при `loading` с прежними пустыми данными (класс `state-message is-refreshing`, `opacity 0.55`). Хук возвращает `shownFilters`, то есть фильтры показанных данных. Иначе прежний no-match после «Clear filters» превратился бы в «No sessions yet» или показал бы текст новых фильтров.
- Подтверждено: чтением кода и тестами, которые остались зелёными.
- Для browser-verify: что высота не скачет, и контраст приглушённого состояния.
- Расширение сверх буквы документа: CSS-правило приглушения `.state-message.is-refreshing` (в документах `opacity` назван только для данных списка).

**M-5 (SessionDetailsDialog.tsx).**
- Сделано: блок «Session not found» получил `role="alert"`, как у состояния error деталей (там уже `role="alert"`). В ui-design 9 для 404 отдельная роль не задана, поэтому образец взят у error.
- Подтверждено: чтением кода.
- Для browser-verify: озвучка скринридером при том, что фокус стоит на h2.

**Nit 6 (viewport-fit).**
- Сделано: в index.html добавлено `viewport-fit=cover`.
- Подтверждено: чтением кода.
- Для browser-verify: `env(safe-area-inset-*)` на iOS.

**Nit 7 (мёртвый код).** Перед удалением искал по src и тестам.
- Удалена `formatDetailsDateTime` (`datetime.ts`): использований нет, S7 использует `formatDetailsSchedule`.
- Из `SessionsStatus` убран `"idle"` (`useSessions.ts`): хук его не возвращал. Одноимённый `"idle"` в `SessionDetailsStatus` и `CreateStatus` не трогал, они используются.
- Ветка `result.cancelled` в `useCreateSession.ts` оставлена с комментарием, потому что тип `ApiResult` клиента (публичный контракт shared/api) включает `cancelled`.
- Подтверждено: поиском, `tsc` и тестами.
- Оставлено как есть (формулировка пункта пришла искажённой, трактовал по N-1): `formatSummaryDateTime` и `formatListDateTimeCompact`, `isStatus` и прочие дубли (N-2).

**Nit 8 (счётчик).**
- Сделано: `descriptionLength` и `notesLength` в `CreateSessionDialog.tsx` считаются по `trim()`, как в `validate`. Порядок показа счётчика не менялся, AC-3.x и A-13 не затронуты.
- Выбран именно этот вариант: он единственный из возможных, который не меняет валидатор и не требует изменений требований.
- Подтверждено: чтением кода.
- Для browser-verify: счётчик при вводе пробелов в конце.

Правки существующих тестов: нет.

### Next Step
Основной шаг: `/test-generator` для закрытия M-6 (Back/Forward по истории и сценарий M-2/M-3, 404 и error деталей, границы валидации, confirm-закрытие). Затем `/browser-verify` по пунктам «Для browser-verify» выше. Решение за пользователем. Дальше не иду.