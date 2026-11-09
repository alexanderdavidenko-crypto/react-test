# Workflow log — TASK-001

Лог ведётся по ходу работы. Промпты записаны ровно так, как отправлены разработчиком; ответы ролей — дословно из транскриптов (длинные в `evidence/responses/`). Время переписано из слов/файлов разработчика, агенты его не вычисляли.

## Шапка

| Поле | Значение |
| --- | --- |
| Задача | TASK-001 (номер назвала роль requirements-analyst) |
| Стартовый коммит | `c2bc6b7696400c944683f4aba2c52abed7617bab` (c2bc6b7, 2026-11-06T09:53:19+01:00) |
| Автор коммитов | alexander.davidenko@innowise.com (`git config --local`, настроено до первого коммита) |
| Runtime | Claude Code 2.1.318 |
| Акселератор | frontend-accelerator-toolset 0.1.0, локальная папка `~/Downloads/frontend-accelerator-toolset-main` (распакованный архив, git-ревизии нет), Runtime Toolchain Manifest `7e9501102f9b` |
| Установка | `npx --package <путь> frontend-accelerator install` (сначала превью, затем `--yes`); `setup --yes` (browser и docs взяты из кэша, REUSED) |
| Doctor | `DEGRADED`; `claude hooks: ACTIVE`; `codex hooks: PENDING_ACTIVATION` (Codex не используется); не BLOCKED. Вывод: `doctor-output.txt`, `doctor-output.json`, коммит `7905cf2` |
| Хеш чекпоинта (планирование до coder) | `6a0019e333041eb2197a73bff3236054f200d2e5` (6a0019e, 2026-11-06T15:49:09+01:00, «docs: implementation plan for TASK-001 (planning checkpoint)»). Содержит все артефакты планирования: requirements, architecture, api-integration, ui-design, implementation-plan. Зависимости и конфиги ещё не менялись |
| Время: начало | 2026-11-06 09:52:41 CET (из `~/Work/assessment-time.txt`; запись сделана командой `date` по ходу подготовки, разработчик подтвердил оставить как есть) |
| Время: перерывы | Перерывов дольше 15 минут пока не записано. Время между действиями идёт на обдумывание, написание промптов и перекуры, оно входит в активное. |
| Время: окончание / активное / календарное | _будут записаны разработчиком в конце_ |

## Таблица ролей

Время запуска роли — из транскрипта (UTC → CET = UTC+1).

| Время (CET) | Роль | Промпт (кратко) | Ответ / артефакт | STOP | Следующий выбор разработчика |
| --- | --- | --- | --- | --- | --- |
| 11:22:05 | `/requirements-analyst` | Прочитать FRONTEND_ASSESSMENT_SPEC.md, составить критерии приёмки, не-цели, допущения, открытые вопросы, завести tasks/TASK-XXX, назвать номер, код и архитектуру не трогать, опциональное не включать, следующую роль не запускать | `requirements.md` (219 строк): AC-1.1–AC-11.9, A-1–A-8, Q-1–Q-9; номер TASK-001. Ответ: `evidence/responses/01-requirements-analyst.md` | Да, следующую роль не запускала; блокирующих вопросов не было | `/architect` |
| 11:50:32 | `/architect` | Запустить изолированного агента architect через Task/Agent tool; закрыть Q-1, Q-2, Q-3 и архитектурные вопросы (роутинг, тесты, папки, серверное состояние, даты и ошибки); спорное выносить мне с вариантами | `architecture.md` (180 строк): D-1…D-9, Q-1/Q-2/Q-3 закрыты, раздел 9 с правками requirements.md. Ответы: `evidence/responses/02-architect.md`. Агент вернул три сообщения (развилки → разбор Q-1 → запись файла) | Да, следующую роль не запускал; агент ждал моих решений, файл записал только после них | _`/requirements-analyst` (обновить требования по разделу 9), затем `/api-integration`, `/ui-designer` — подтвердить_ |
| 12:38:26 | `/requirements-analyst` (повторный запуск, причина: решение архитектора включить URL-синхронизацию фильтров) | Обновить существующий `TASK-001/requirements.md` по разделу 9 `architecture.md`, новую папку не создавать, архитектуру и код не трогать | `requirements.md` версии 2: AC-1.9…AC-1.14, AC-9.4/9.5, AC-10.8, A-9…A-12, Q-1/Q-2/Q-3 закрыты, раздел 10 «Изменения в этой версии». Ответ: `evidence/responses/03-requirements-analyst-update.md` | Да, следующую роль не запускал, блокирующих вопросов не было | _`/api-integration`, затем `/ui-designer` — подтвердить_ |
| 13:01:43 | `/api-integration` | Изолированный агент; граница клиента, матрица «запрос → состояние → ошибка» (список, детали, тренеры, создание), даты и ошибки, сценарии мока; закрыть детали Q-3 и API-часть Q-6; ответ про build/preview; предложения по контракту отдельно | `api-integration.md` (224 строки): 10 развилок решены (все по рекомендации агента), Q-3 и Q-6 (API) закрыты, раздел «Предложения по контракту» пуст, вопросы владельцу бэкенда В-1…В-12 помечены assumed. Ответы: `evidence/responses/04-api-integration.md` | Да, следующую роль не запускал; файл записан только после моих ответов | _`/ui-designer` — подтвердить_ |
| 13:23:51 | `/ui-designer` | Изолированный агент; адаптив 1440×900 и 390×844, список на мобильном, детали, форма и валидация, фокус, live-регионы, признаки статуса не только цветом, тексты состояний; закрыть Q-4…Q-7 и вопросы из раздела 12 api-integration | `ui-design.md` (418 строк): 7 развилок решены (все по рекомендации агента), Q-4, Q-5, Q-6 (UI), Q-7 закрыты; контрасты помечены «НЕ ИЗМЕРЕНО». Ответы: `evidence/responses/05-ui-designer.md` | Да, следующую роль не запускал; файл записан только после моих ответов | _`/writing-plans` — подтвердить_ |
| 15:34:08 | `/requirements-analyst` (третий запуск, короткая синхронизация с `ui-design.md`) | Изолированный агент; Q-4…Q-7 закрыть со ссылками на `ui-design.md`, допущение про 1000 символов описания, запись в «Изменения», без новых AC, прочие документы не трогать | `requirements.md` версия 3: Q-4…Q-7 закрыты, A-13, подраздел «Версия 3»; открыты Q-8, Q-9. Ответ: `evidence/responses/06-requirements-analyst-sync.md` | Да, следующую роль не запускал | _`/writing-plans` — подтвердить_ |
| 15:40:15 | `/writing-plans` | Изолированный агент; пофайловый план по requirements v3, architecture, api-integration, ui-design; раздел расхождений документов; список ручных зависимостей и правок конфига; спорное — вариантами | `implementation-plan.md` (393 строки): шаги S0…S9, таблица AC → шаг/тест/проверка, 14 расхождений с позицией плана, зависимости vitest/RTL/user-event/jsdom, раздел risk-тестов. 7 развилок (0–6), все по рекомендации агента. Ответы: `evidence/responses/07-writing-plans.md` | Да, следующую роль не запускал; файл записан только после моих ответов | _чекпоинт-коммит, хеш в лог, ручная установка (S0), затем `/coder` — подтвердить_ |
| 16:12:40 | `/coder` (часть 1: foundation S1–S5) | Изолированный агент; shared/lib/datetime, shared/api, shared/router, src/mocks с dev-bootstrap, src/test (setup, render, один инфраструктурный тест); S6–S9 не делать; без новых зависимостей и правок конфигов; запуск lint, build, test с выводом и кодами; без коммитов | Файлы `src/shared/*`, `src/mocks/*`, `src/test/*`, правка `src/main.tsx` (~1216 строк кода); lint, build, test — код 0. Ответ: `evidence/responses/08-coder-foundation-s1-s5.md` | Да, следующую роль не запускал; два вопроса к разработчику | _ревью foundation или `/coder` часть 2 (S6–S9) — подтвердить_ |
| 16:21:39 | `/code-reviewer` (foundation, `c921fba..a53becc`) | Изолированный агент; ревью только диапазона коммита; клиент и контракт, отмена, мапперы, сценарии мока, fixture clock, даты и DST, роутер, прод-бандл, тестовая инфраструктура, импорты фикстур; вердикт PASS/NEEDS-CHANGES; ничего не править | Вердикт NEEDS-CHANGES: 0 blocking, 1 should-fix (S-1 `parseIso` и календарные даты), 7 nit. Ответ: `evidence/responses/09-code-reviewer-foundation.md`; `review.md` (записан не агентом, у роли нет Write) | Да, следующую роль не запускал | _`/coder` узкая правка S-1 (и решение по nit), затем часть 2 S6–S9_ |
| 16:27:23 | `/coder` (исправление по ревью: S-1 и N-1) | Изолированный агент; узкая правка `parseIso` (календарные даты) и `main.tsx` (перехват ошибки мока); регрессионный тест только на S-1; остальные находки не трогать; lint, build, test с выводом | `datetime.ts` (+14/−3), `main.tsx` (+6/−1), новый `datetime.parse-iso.test.ts` (6 кейсов); lint, build, test — код 0, 8 тестов. Ответ: `evidence/responses/10-coder-fix-s1-n1.md` | Да, следующую роль не запускал | _`/test-generator` (risk-тесты) или `/coder` часть 2 (S6–S9) — подтвердить_ |
| 16:30:51 | `/coder` (срез S6: список и фильтры) | Изолированный агент; маршрут `/sessions`, `features/sessions`, фильтры только в URL (replace, debounce 300 мс), Clear filters, состояния списка, essential-тесты 1–4 и 7a; без деталей и формы; lint, build, test | `src/app/App.tsx`, `src/features/sessions/*` (7 файлов), `sessions-list.test.tsx` (205 строк, 8 `it`), правки `index.css`, `App.css`, `main.tsx`, удалён шаблонный `App.tsx`; lint, build, test — код 0, 16 тестов. Ответ: `evidence/responses/11-coder-s6-list.md` | Да, следующую роль не запускал | _ревью S6 или `/coder` S7 — подтвердить_ |
| 08:54:38 (CET, 2026-11-09) | `/coder` (срез S7: детали) | Изолированный агент; диалог `<dialog>` на `/sessions/:id`, `useSessionDetails`, `CapacitySummary`, закрытие через навигацию, флаг «из списка» в router, essential-тест 7b (1–2 теста), risk-тесты не писать | `SessionDetailsDialog.tsx` (236), `useSessionDetails.ts`, `CapacitySummary.tsx`, `session-details.test.tsx` (2 теста), правки `SessionRow`, `copy.ts`, `shared/router` (+14), `App.css`, `app/App.tsx`; lint, build, test — код 0, 18 тестов. Ответ: `evidence/responses/12-coder-s7-details.md` | Да, следующую роль не запускал; два вопроса к разработчику | _ревью S6+S7, `/coder` S8 — подтвердить_ |
| 09:03:21 (CET, 2026-11-09) | `/coder` (срез S8: создание) | Изолированный агент; `features/create-session` (форма во втором `<dialog>`, валидация AC-3.x, guard по `coachId`, ошибки полей и формы, coaches-error, экран успеха, подтверждение закрытия), перезапрос списка; essential-тесты 5 и 6, минимум `it`; risk-тесты не писать; спорные UI-решения не принимать самому | `src/features/create-session/*` (9 файлов, ~1200 строк, `CreateSessionDialog.tsx` 640), `create-session.test.tsx` (3 теста), правки `app/App.tsx`, `SessionsPage.tsx`, `datetime.ts` (+17), `App.css` (+174); lint, build, test — код 0, 21 тест. Ответ: `evidence/responses/13-coder-s8-create.md` | Да, следующую роль не запускал; 3 вопроса к разработчику | _ревью S6–S8, `/coder` S9 или `/test-generator` — подтвердить_ |
| 11:14:22 (CET, 2026-11-09, старт агента) | `/coder` (срез S9: адаптив, доступность, README, полировка) | Изолированный агент; CSS адаптива и фокуса, форматы даты в `datetime`, переименование `details-*`, колонки в `copy`, README | [`evidence/responses/14-coder-s9-polish.md`](evidence/responses/14-coder-s9-polish.md) | да | следующий шаг выбирает разработчик |
| 13:30:12 (UTC; 14:30:12 CET, 2026-11-09, старт агента) | `/code-reviewer` (S6–S9, `e23e4f7..3d98cd5`) | Изолированный агент; семь направлений: AC и документы, запреты проекта, доступность, гонки, адаптив в коде, качество, тесты | [`evidence/responses/15-code-reviewer-s6-s9.md`](evidence/responses/15-code-reviewer-s6-s9.md), [`review.md`](review.md) | да | исправления по находкам |
| 14:42:04 (CET, 2026-11-09, старт агента) | `/coder` (правки ревью S6–S9: M-1…M-5, nit) | Изолированный агент; узкая правка по `review.md` | [`evidence/responses/16-coder-review-fixes.md`](evidence/responses/16-coder-review-fixes.md) | да | `/test-generator` |
| 14:50:08 (CET, 2026-11-09, старт агента) | `/test-generator` (risk-тесты раздела 8 и M-6) | Изолированный агент; шесть файлов `*.risk.test.*`, правка двух проверок в `create-session.test.tsx` | [`evidence/responses/17-test-generator-risk.md`](evidence/responses/17-test-generator-risk.md) | да | `/browser-verify` |
| 15:18:53 (CET, 2026-11-09) | `/browser-verify` (попытка 1) | Изолированный агент; проверка приложения в реальном браузере через `agent-browser.mjs` | [`evidence/responses/18-browser-verify-blocked.md`](evidence/responses/18-browser-verify-blocked.md) | да (BLOCKED) | разблокировать запуск браузера и повторить |
| 15:25:06 (CET, 2026-11-09) | `/browser-verify` (попытка 2, вариант A) | Изолированный агент; то же задание, запуск адаптера вне песочницы | [`evidence/responses/19-browser-verify-blocked-2.md`](evidence/responses/19-browser-verify-blocked-2.md) | да (BLOCKED) | найти причину на хосте |
| 15:37:53 (CET, 2026-11-09) | `/browser-verify` (попытка 3, запуск из сессии-помощника по просьбе разработчика) | Изолированный агент; то же задание, `AGENT_BROWSER_EXECUTABLE_PATH` в окружении | [`evidence/responses/20-browser-verify-blocked-3.md`](evidence/responses/20-browser-verify-blocked-3.md) | да (BLOCKED) | `--executable-path` в каждой команде адаптера |
| 15:48:48 (CET, 2026-11-09) | `/browser-verify` (попытка 4, с `--executable-path`) | Изолированный агент; полная проверка в реальном браузере через `agent-browser.mjs` | [`evidence/responses/21-browser-verify.md`](evidence/responses/21-browser-verify.md), [`evidence/browser-verification.md`](evidence/browser-verification.md) | да (FAIL, 4 minor) | правки D-1…D-4 |
| 16:15:3x (CET, 2026-11-09; команда 15:15:37 UTC) | `/coder` (правки D-1…D-4 и `document.title` по browser-verify) | Изолированный агент; узкая правка | [`evidence/responses/22-coder-bv-fixes.md`](evidence/responses/22-coder-bv-fixes.md) | да | повторный `/browser-verify` |
| 16:26:43 (CET, 2026-11-09) | `/browser-verify` (повтор по D-1…D-4, с `--executable-path`) | Изолированный агент; выборочная проверка затронутых пунктов | [`evidence/responses/23-browser-verify-recheck.md`](evidence/responses/23-browser-verify-recheck.md), [`evidence/browser-verification.md`](evidence/browser-verification.md) | да (PASS) | `/verify` |

### Промпт роли 1 (дословно, как отправлен)

```text
/requirements-analyst открой frontend-accelerator-assessment/FRONTEND_ASSESSMENT_SPEC.md и составь по нему требования: критерии приёмки, которые можно проверить, чего мф с тобой делать не буду, что мы допускаем и открытые вопросы. Так же заведи папку для задачи в tasks/TASK-XXX, положи результат в requirements.md и скажи мне, какой номер таски получился. Код, зависимости, конфигурации, архитектуру пока что не трогай, мы потом их настроим. Не выбирай технологии и архитектуру. Так же там будут опциональные пункты и спеки, их мы в требования не включаем. Если вдруг будут вопросы, то остановись и задай их мне. Следующую роль не запускай (хотя, я вроде бы настраивал так, чтобы ты по дефолту не запускал следующую роль)
```

### Ответ роли 1

Дословно в [`evidence/responses/01-requirements-analyst.md`](evidence/responses/01-requirements-analyst.md). Артефакт: [`requirements.md`](requirements.md). Роль записала файл в 2026-11-06T10:23:02Z (11:23:02 CET), финальное сообщение — 10:23:08Z.

Коммит после роли: `74edfc0` (2026-11-06T11:40:39+01:00, «docs: requirements for TASK-001 and workflow log»): `requirements.md`, `workflow-log.md`, `evidence/responses/01-requirements-analyst.md`.

Проверка разработчиком/ассистентом: требования сверены со спецификацией, API_CONTRACT.md и MOCKING_GUIDE.md (серверная фильтрация, сценарии мока, 5 фикстурных сессий). Блок спеки не пропущен.

### Роль 2 `/architect`

Промпт (дословно, как отправлен; запуск 2026-11-06T10:50:32Z = 11:50:32 CET):

```text
/architect запусти изолированного агента architect через Task/Agent tool, а саму работу роли в основной сессии не делай. Требования лежат в созданной до этого тпапке таски в tasks/TASK-001/requirements.md. Реши только то, что нужно для этой задачи, т.е. роутинг и формат страницы деталей, набор тестов, структура и границы папок, кто отвечает за серверное состояние, так же, где нормализуются даты и обрабатываются и выводятся ошибки. Так же отдельно закрой открытые вопросы Q1, Q-2, Q-3. Решения запиши в первую же таску в ее архитектуру tasks/TASK-001/architecture.md. если у тебя будут какие-то сомнения, то не принимай решения сам, а спроси меня, может быть с предосталением вариантов (так будет даже лучше), рекомендаций, причин и следствий, и только после моих ответов запиши выбранное. Код опять же мы не меняем, новые библиотеки и зависимости ни от куда не тащим в репозиторий и пока что не предлагаем
```

Ответ: [`evidence/responses/02-architect.md`](evidence/responses/02-architect.md) (три возврата агента). Что основная сессия передала агенту и в каких сообщениях: [`evidence/responses/02-architect-relayed-by-main-session.md`](evidence/responses/02-architect-relayed-by-main-session.md). Артефакт: [`architecture.md`](architecture.md).

Решения разработчика по развилкам (через вопросы основной сессии, по транскрипту):
- Q-1: модальное окно на маршруте `/sessions/:id` (M1).
- Q-2: поиск и статус хранятся в query string.
- Серверное состояние: хуки `useState`/`useEffect` + `AbortController`, по одному на ресурс.
- Тесты: vitest + @testing-library/react + @testing-library/user-event + jsdom (4 dev-зависимости), `@testing-library/jest-dom` не добавлять.
- Q-3: `?scenario=<name>` читается один раз при старте в `src/mocks`, `VITE_MOCK_SCENARIO` по умолчанию, только в dev.
- Синхронизацию фильтров с URL включить в требования (раньше она была опциональной). Это расширение объёма; `requirements.md` пока не обновлён, правки перечислены в разделе 9 `architecture.md`.

Коммит после роли: `d7b971b` («docs: architecture for TASK-001»): `architecture.md`, ответы агента в `evidence/responses/`, обновление лога.

Проверка по файлу: изменённых файлов вне `tasks/` нет (`git status`); код, зависимости и конфигурация не менялись.

### Роль 3 (повторный запуск) `/requirements-analyst`

Промпт (дословно, как отправлен; запуск 2026-11-06T11:38:26Z = 12:38:26 CET):

```text
/requirements-analyst запусти изолированного агента requirements-analyst через Task/Agent tool, а саму работу рои в основной сессии не делай. Имей ввиду, что это повторный запуск, а не новая задача - новую папку не создавай, обнови существующие реквайременты: tasks/TASK-001/requirements.md. Мы так делаем потому что вместе с архитектором мы решили включить синхронизацию фильтров с юрл в требования, а сейчас она числится как опциональная. Внеси правки, перечисленные в разделе 9 architecture.md: убери пункт из исключённого опционального, добавь критерии приёмки по URL и по кнопкам Назад и Вперёд, уточни критерии про возврат из деталей и deep link, дополни критерии по тестам и зависимостям, добавь допущения и риски, пометь Q-1, Q-2 и Q-3 как закрытые. Остальные вопросы Q-4–Q-9 оставь открытыми. Нумерацию существующих критериев не ломай, новые добавляй с новыми номерами. В конце файла добавь короткий раздел «Изменения в этой версии» со списком того, что поменялось. Остальные опциональные пункты (фильтр по типу, пагинация, отмена сессии и т.д.) по-прежнему не включай. Код, зависимости, конфиги и architecture.md не трогай. Если по правкам есть сомнения, остановись и спроси меня
```

Ответ: [`evidence/responses/03-requirements-analyst-update.md`](evidence/responses/03-requirements-analyst-update.md). Что основная сессия передала агенту: [`evidence/responses/03-requirements-analyst-update-relayed-by-main-session.md`](evidence/responses/03-requirements-analyst-update-relayed-by-main-session.md). Артефакт: [`requirements.md`](requirements.md) (версия 2).

Коммит после роли: `6e8c11c` (2026-11-06T14:11:47+01:00, «docs: update requirements for TASK-001 (URL filter sync)»): `requirements.md` v2 и ответы агента `evidence/responses/03-*`.

Проверка по диффу `git diff requirements.md`: нумерация прежних AC сохранена, изменены только AC-1.8, AC-2.4, AC-2.5, AC-9.2; добавлены новые AC/допущения/риски и раздел 10; пункт про URL убран из исключённого опционального; прочие опциональные пункты остались исключёнными. `architecture.md`, код и конфигурация не менялись (`git status`).

### Роль 4 `/api-integration`

Промпт (дословно, как отправлен; запуск 2026-11-06T12:01:43.222Z):

```text
/api-integration Запусти отдельного агента api-integration через Task/Agent tool. Важно, чтобы именно он занимался этой задачей, а не ты в основной сессии. Пусть сначала разберётся с документацией: frontend-accelerator-assessment/API_CONTRACT.md, frontend-accelerator-assessment/MOCKING_GUIDE.md, tasks/TASK-001/requirements.md (версия 2) и tasks/TASK-001/architecture.md. В архитектуре особенно внимательно посмотри D-4, D-6, D-7, D-8 и пункт 11. Нужно разобраться и описать, как фронтенд будет работать с API: где должна проходить граница API-клиента, какие состояния интерфейса возникают при запросах и ошибках для списка, деталей тренировки, тренеров (coaches) и создания новой тренировки. Также опиши, как обрабатывать даты и ошибки, чтобы всё было единообразно. Отдельно разберись с моками и всеми предусмотренными сценариями: normal, empty, list-error, details-error, coaches-error и create-error. Посмотри, как выбирается сценарий через ?scenario= и VITE_MOCK_SCENARIO (особенно вопрос Q-3 и детали реализации), какой командой запускать приложение с моками и что произойдёт при npm run build и последующем preview, если моки подключены только в dev-режиме. Ещё нужно разобраться с вопросом Q-6: что должно происходить с точки зрения API, если не удалось загрузить список тренеров, а пользователь пытается создать тренировку. Поведение самой формы и интерфейса оставь агенту ui-designer, здесь нужна только API-часть. Не придумывай новые эндпоинты и не меняй форматы ответов API. Если увидишь, что в существующем контракте что-то стоит изменить, вынеси это отдельно в виде предложений, с объяснением зачем. Результат оформи в tasks/TASK-001/api-integration.md. Если в документации чего-то не хватает или есть несколько вариантов решения, не выбирай самостоятельно. Сначала покажи мне варианты, объясни последствия каждого и порекомендуй наиболее подходящий. Дождись моего ответа и только после согласования записывай решение в документ. Никаких изменений в коде, зависимостях и конфигурации не делай. Файлы architecture.md и requirements.md тоже не трогай.
```

Ответы: [`evidence/responses/04-api-integration.md`](evidence/responses/04-api-integration.md) (два возврата агента). Что основная сессия передала агенту: [`evidence/responses/04-api-integration-relayed-by-main-session.md`](evidence/responses/04-api-integration-relayed-by-main-session.md). Артефакт: [`api-integration.md`](api-integration.md).

Коммит после роли: `62e432b` (2026-11-06T14:12:31+01:00, «docs: api-integration for TASK-001»): `api-integration.md` и ответы агента `evidence/responses/04-*`.

Решения разработчика (10 развилок, все по рекомендации агента): моки только в dev + README + тест «HTML 200 → ошибка формы» (1=C); неверный `?scenario=` → warn и откат на env, затем `normal` (2=A); сценарии ошибок статичны (3=A); гарантия «POST не уходит без валидного тренера» в `useCreateSession` + блокировка в UI (4=A); клиент возвращает `{ok, data} | {ok:false, error}` (5=B); неизвестный enum = ошибка формы ответа (6=A); `startsAt` без миллисекунд (7=B); список не усекается, новые в конец (8=A); `create-error`: любой POST → 500 (9a=A); `empty` = стартовое состояние, POST добавляет (9b=B); POST не отменяется, только GET (10=A).

Проверка по файлу: вне `tasks/` ничего не изменено; агент не предлагает изменений контракта; непроверенное запуском перечислено в разделе 15 (импорт JSON вне `src/`, удаление мока из прод-бандла, поведение `preview`, `VITE_MOCK_SCENARIO`, порядок чтения `scenario` и редиректа).

### Роль 5 `/ui-designer`

Промпт (дословно, как отправлен; запуск 2026-11-06T12:23:51.587Z):

```text
/ui-designer запусти изолированного агента ui-designer через Task/Agent tool, а саму работу роли в основной сессии не делай. Опирайся на tasks/TASK-001/requirements.md (версия 2), tasks/TASK-001/architecture.md (раздел 10 «Передаётся ui-designer»), tasks/TASK-001/api-integration.md (раздел 12 «Передаётся ui-designer») и на референсы в frontend-accelerator-assessment/designs: DESIGN_TOKENS.md и sessions-dashboard-reference.svg. Опиши интерфейс: адаптивность для 1440x900 и 390x844 без горизонтальной прокрутки страницы; как выглядит список на мобильном; детали сессии в модальном окне (на мобильном: полный экран или шторка, прокрутка внутри); форму создания и её валидацию; управление фокусом (начальный фокус, возврат на строку списка при закрытии, фокус при прямом заходе на /sessions/:id); живые регионы для статусов, успеха и ошибок; несколько признаков статуса помимо цвета; тексты состояний (загрузка, пусто, нет совпадений, ошибки списка, деталей, тренеров, создания). Отдельно закрой открытые вопросы Q-4, Q-5, Q-6, Q-7, а также вопросы из раздела 12 api-integration. Результат запиши в tasks/TASK-001/ui-design.md. Если решение спорное, не принимай его сам, а покажи мне варианты с рекомендацией и последствиями и запиши только после моего ответа. Код, зависимости и конфиги не трогай, architecture.md, api-integration.md и requirements.md не меняй
```

Ответы: [`evidence/responses/05-ui-designer.md`](evidence/responses/05-ui-designer.md) (два возврата агента). Что основная сессия передала агенту: [`evidence/responses/05-ui-designer-relayed-by-main-session.md`](evidence/responses/05-ui-designer-relayed-by-main-session.md). Артефакт: [`ui-design.md`](ui-design.md).

Коммит после роли: `b64ffb7` (2026-11-06T14:13:07+01:00, «docs: ui-design for TASK-001»): `ui-design.md`, ответы агента `evidence/responses/05-*`, обновление лога. Коммиты ролей 3, 4 и 5 сделаны последовательно в 14:11–14:13 (после завершения ролей 13:09–13:32), а не сразу после каждой роли; порядок содержимого соответствует порядку ролей.

Решения разработчика (7 развилок, все по рекомендации агента): форма создания во втором нативном `<dialog>` без URL, после успеха экран «Session created» с «Open session», «Create another», «Close» и подсказкой про фильтры (1=A); на мобильном обе модалки на весь экран (2=A); список как `<ul>/<li>` на CSS grid (3=A); язык интерфейса английский (4=A); при `coaches-error` блокируется только поле Coach, отправка активна, но `POST` не уходит (5=A); закрытие формы с изменениями — подтверждение «Discard?» внутри диалога, клик по фону форму не закрывает (6=A); Type=Training, Visibility=Public, описание до 1000 символов (7=A).

Наблюдение: лимит описания 1000 символов — допущение дизайнера, в `requirements.md` его не было; Q-4…Q-7 числились открытыми. Закрыто ролью 6 (см. ниже). Расчётные контрасты бейджей `scheduled` и `full` около 4.5:1, на границе порога; подтверждает `browser-verify`.

Проверка по файлу: вне `tasks/` ничего не изменено; `architecture.md`, `api-integration.md`, `requirements.md` этой ролью не менялись.

### Роль 6 `/requirements-analyst` (синхронизация, третий запуск)

Промпт (дословно, как отправлен; запуск 2026-11-06T14:34:08Z):

```text
Нужно коротко синхронизировать требования по TASK-001 с тем, что появилось после них в дизайне. Запусти для этого изолированного агента requirements-analyst через Task/Agent tool. Саму работу в основной сессии не делай, только передай задачу агенту и верни его ответ как есть.

Что сделать агенту:
1. Прочитать tasks/TASK-001/requirements.md, ui-design.md, architecture.md и api-integration.md.
2. В requirements.md пометить закрытыми вопросы Q-4, Q-5, Q-6 и Q-7. Для каждого указать, как он решён в ui-design.md.
3. Добавить допущение про максимальную длину описания сессии (1000 символов), как в ui-design.md. Отметить, что владелец бэкенда его не подтверждал.
4. Добавить запись в раздел «Изменения» (раздел 10) про эту синхронизацию.
5. В конце перечислить вопросы, которые остаются открытыми.

Ограничения:
- Новые критерии приёмки (AC) не добавлять и существующие не менять. Нужны только правки статусов вопросов и одно допущение.
- Другие документы (architecture.md, api-integration.md, ui-design.md) и код не трогать.
- Если найдёшь другие расхождения между документами, не правь их, а перечисли в ответе.
- После обновления requirements.md остановись. Следующую роль не запускай и ничего не планируй.
```

Ответ: [`evidence/responses/06-requirements-analyst-sync.md`](evidence/responses/06-requirements-analyst-sync.md) (возврат агента). Что основная сессия передала агенту: [`evidence/responses/06-requirements-analyst-sync-relayed-by-main-session.md`](evidence/responses/06-requirements-analyst-sync-relayed-by-main-session.md). Артефакт: [`requirements.md`](requirements.md) (версия 3).

Проверка: в транскрипте основной сессии есть вызов Agent (`subagent_type: requirements-analyst`, 14:34:15Z), в `subagents/` лежит транскрипт агента (Read, Edit, SubagentHandback). `git diff` затрагивает только `requirements.md` (18 строк): Q-4…Q-7 закрыты, добавлен A-13, подраздел «Версия 3», AC не менялись. Ответ, вставленный в терминал, обрезан и содержит комментарии основной сессии; дословный текст взят из возврата агента.

Расхождения документов, найденные агентом и НЕ исправленные (передаются в `writing-plans`): шапка `requirements.md` («версия 2»), раздел 9 «Готовность» и раздел 8 (Q-5, Q-7) устарели; A-7 («значения по умолчанию определяются на этапе UI») устарело; AC-3.14 и D-7 («отправка заблокирована») против `ui-design.md` 6.4 (кнопка активна, блокируется поле Coach, guard в `useCreateSession`); поведение дизайна сверх AC: ошибка несуществующего локального времени (DST), цели касания 44px и шрифт 16px; лимит описания (A-13) только в UI.

Коммит после роли: `56edab6` (2026-11-06T15:37:18+01:00, «docs: sync requirements with ui-design for TASK-001»): `requirements.md`, ответы агента `evidence/responses/06-*`, обновление лога. Правка лога с хешами `6e8c11c`, `62e432b`, `b64ffb7` вошла в этот же коммит.

### Роль 7 `/writing-plans`

Промпт (дословно, как отправлен; запуск 2026-11-06T14:40:15Z):

```text
Запусти изолированного агента writing-plans через Task/Agent tool, а саму работу роли в основной сессии не делай. Опирайся на tasks/TASK-001/requirements.md (версия 3), architecture.md, api-integration.md и ui-design.md, а также на задание в frontend-accelerator-assessment (FRONTEND_ASSESSMENT_SPEC.md, API_CONTRACT.md, MOCKING_GUIDE.md). Составь пофайловый план реализации в tasks/TASK-001/plan.md: какие файлы создаются и меняются, контракты между модулями, порядок шагов, тесты (какие именно и что проверяют), команды проверки для каждого шага, критерии завершения. Нужно покрыть список, детали, форму создания, все состояния, мок-слой на MSW, адаптив 1440×900 и 390×844, доступность и клавиатуру, и сопоставить шаги с AC из requirements.md.
Отдельный раздел «Расхождения документов»: агент requirements-analyst уже нашёл несколько (AC-3.14 и D-7 против ui-design 6.4, устаревшие шапка, раздел 8, раздел 9 и A-7 в requirements.md, правила сверх AC: DST, цели касания 44px, шрифт 16px, лимит описания A-13). Для каждого укажи, как план с этим поступает. Сам расхождения в документах не исправляй.
Отдельно перечисли, какие зависимости нужно поставить вручную для тестов (vitest, @testing-library/react, @testing-library/user-event, jsdom; msw уже стоит), и какие скрипты и правки конфигурации понадобятся, но сам ничего не устанавливай и не меняй.
Если решение спорное или в документах есть пробел, не выбирай сам: покажи варианты с последствиями и рекомендацией и запиши только после моего ответа.
Код, зависимости, конфиги и остальные документы не трогай, пиши только plan.md
```

Ответы: [`evidence/responses/07-writing-plans.md`](evidence/responses/07-writing-plans.md) (три возврата агента; первые два по тексту совпадают: первый возврат с развилками повторился после дополнительного сообщения). Что основная сессия передала агенту и мои ответы на развилки: [`evidence/responses/07-writing-plans-relayed-by-main-session.md`](evidence/responses/07-writing-plans-relayed-by-main-session.md). Артефакт: [`implementation-plan.md`](implementation-plan.md).

Проверка: вызов Agent (`subagent_type: writing-plans`, 14:40:31Z), транскрипт в `subagents/` (Read 40, Glob 10, Grep 2, Write 2 — оба раза в `implementation-plan.md`, SubagentHandback 3; Bash не использовался). Вне `tasks/` ничего не изменено. Ответы на развилки давались через `AskUserQuestion` (14:44:21Z — развилки 0–3, 14:45:19Z — развилки 4–6).

Отклонение (моя неточность): в промпте я назвал файл `plan.md`, а протокол и AC-11.5 требуют `implementation-plan.md`; агент обнаружил это и вынес развилкой 0, выбрано протокольное имя.

Решения (все по рекомендации агента): 0=A имя `implementation-plan.md`; 1=C гибрид (foundation, затем срезы list/details/create/polish); 2=A статус в URL через `replace`; 3=B модуль `copy` на фичу; 4=A Q-9 команда запуска `npm run dev`; 5=C Q-8 коммит артефактов до coder, затем отдельный коммит с хешем в лог, плюс история сессии; 6=B 7 essential-тестов плюс отдельный небольшой файл граничных тестов API-клиента (risk-based).

Непроверенное, названное планом: `showModal` в jsdom, фейковые таймеры с MSW/userEvent/debounce, импорт JSON вне `src/` при `resolveJsonModule`, состав `dist`, подхват `VITE_MOCK_SCENARIO`, порядок чтения `?scenario=` и редиректа роутера. Устаревшие места `requirements.md` (расхождение 2) план не правит.

Коммит после роли (чекпоинт): `6a0019e` (2026-11-06T15:49:09+01:00): `implementation-plan.md`, ответы агента `evidence/responses/07-*`, обновление лога. Хеш записан отдельным следующим коммитом (решение 5=C).

### Роль 8 `/coder` (часть 1: foundation S1–S5)

Промпт (дословно, как отправлен; запуск 2026-11-06T15:12:40Z):

```text
Запусти изолированного агента coder через Task/Agent tool, а саму работу роли в основной сессии не делай. Реализуй первую часть плана из tasks/TASK-001/implementation-plan.md: шаги S1–S5 (shared/lib/datetime, shared/api, shared/router, src/mocks с подключением мока в dev через main.tsx, тестовая инфраструктура src/test/setup.ts и src/test/render.tsx). Опирайся на план, а также на requirements.md (версия 3), architecture.md, api-integration.md и ui-design.md там, где план на них ссылается. Контракт и сценарии мока бери из frontend-accelerator-assessment (API_CONTRACT.md, MOCKING_GUIDE.md, fixtures), без бэкенда и без прямого импорта фикстур в код приложения.
Срезы S6–S9 (список, детали, форма, адаптив, README) в этот запуск не входят, не делай их. Приложение пока может оставаться шаблонным Vite, главное, чтобы foundation был готов.
Тесты: по этому запуску нужен только минимум для проверки инфраструктуры S5 (один простой тест, что раннер находит тесты, msw/node перехватывает /api, store сбрасывается, время заморожено). Тесты поведения из S6–S8 и risk-тесты из раздела 8 плана пока не пиши.
Зависимости уже поставлены вручную (vitest, @testing-library/react, @testing-library/user-event, jsdom). Новые зависимости не ставь, конфигурационные файлы не меняй без согласования: если что-то понадобится (например, resolveJsonModule для импорта JSON-фикстур), остановись и покажи мне варианты с рекомендацией. Не принимай спорные решения сам, а непроверенное из раздела 7 плана (showModal в jsdom, фейковые таймеры, импорт JSON вне src, состав dist, VITE_MOCK_SCENARIO) проверяй запуском и честно записывай результат.
Запусти npm run lint, npm run build и npm run test, в конце покажи фактический вывод и код выхода каждой команды. Документы в tasks/ и workflow-log.md не трогай. Не делай git-коммиты
```

Ответ: [`evidence/responses/08-coder-foundation-s1-s5.md`](evidence/responses/08-coder-foundation-s1-s5.md) (один возврат агента). Что основная сессия передала агенту: [`evidence/responses/08-coder-foundation-s1-s5-relayed-by-main-session.md`](evidence/responses/08-coder-foundation-s1-s5-relayed-by-main-session.md).

Проверка (моя, не по отчёту агента): вызов Agent (`subagent_type: coder`, 15:12:56Z), транскрипт в `subagents/` (Read 10, Bash 38, SubagentHandback 1; файлы создавались через Bash heredoc, а не Write/Edit). `git status`: изменён `src/main.tsx`, новые `src/shared/`, `src/mocks/`, `src/test/`; `tasks/`, конфиги, зависимости и `frontend-accelerator-assessment/` не менялись. Повторный запуск: `npm run lint` — 0, `npm run build` — 0, `npm run test` — 0 (1 файл, 2 теста). Проверки критериев плана поиском: единственный `fetch` в `src/shared/api/client.ts`; `new Date`, `toLocale*`, `Intl` вне `shared/lib/datetime.ts` — только в инфраструктурном тесте (утверждение о замороженном времени); JSON-фикстуры импортируются только в `src/mocks/*`, в код приложения не попадают. Временные тесты агента (`zz*.test.ts`) удалены, посторонних процессов нет (агент запускал `vite --port 5199` для проверки `VITE_MOCK_SCENARIO` и остановил).

Результаты проверки непроверенного из раздела 7 плана (по отчёту агента): `resolveJsonModule` не нужен, `tsc -b` проходит; `showModal` в jsdom 31 отсутствует, добавлен минимальный полифил в `setup.ts` (фокус, инертность и Esc не моделирует — на browser-verify); полный `useFakeTimers` с MSW завис на 5 с, поэтому фейкается только `Date`, совместимость с debounce и userEvent проверится на S6; `VITE_MOCK_SCENARIO` подхватывается; в `dist` строк мока и фикстур нет (код `shared/api` пока тоже не попал, он нигде не используется). Не проверено: реальный старт `setupWorker` и `onUnhandledRequest` в браузере, поведение `localToIsoUtc` на переходе на летнее время.

Две ошибки в пересказе основной сессии (я их исправляю в логе): она написала, что чекпоинт до coder не сделан и хеша нет. Это неверно: чекпоинт `6a0019e` (15:49 CET) и коммит установки тестового стека `c921fba` (16:11 CET) сделаны до запуска coder (16:12 CET), хеш записан выше. Основная сессия не видела git-историю заново.

Два вопроса агента и ответы разработчика: _ответы будут записаны_ (рекомендации: 1 — оставить `it.each([1,2])`, второй прогон доказывает сброс store, тест помечен как инфраструктурный и не входит в 7 essential; 2 — да, `createSession` без `signal`, это решение 10=A из `api-integration.md`).

Коммит после роли: `a53becc` (2026-11-06T16:20:19+01:00, «feat: foundation (datetime, api client, router, msw mocks, test infra)»): `src/main.tsx`, `src/shared/*`, `src/mocks/*`, `src/test/*`, ответы агента `evidence/responses/08-*`, обновление лога. Родитель — `c921fba`.

### Роль 9 `/code-reviewer` (foundation)

Промпт (дословно, как отправлен; запуск 2026-11-06T15:21:39.610Z):

```text
Запусти изолированного агента code-reviewer через Task/Agent tool, а саму работу роли в основной сессии не делай. Проверь только один коммит: диапазон c921fba..a53becc (foundation: shared/lib/datetime, shared/api, shared/router, src/mocks, src/test, правка src/main.tsx). Весь репозиторий не ревьюй. Опирайся на tasks/TASK-001/implementation-plan.md (шаги S1–S5), requirements.md (версия 3), architecture.md, api-integration.md и на frontend-accelerator-assessment (API_CONTRACT.md, MOCKING_GUIDE.md, fixtures).
Особое внимание: соответствие клиента контракту и разбору ответов из api-integration (раздел 4); корректность отмены запросов и результата отмены; хрупкость строгих мапперов; поведение мока по сценариям (normal, empty, list-error, details-error, coaches-error, create-error), выбор сценария через ?scenario= и VITE_MOCK_SCENARIO, статичность ошибок; сдвиг дат по fixture clock; правила работы с датами (только через shared/lib/datetime, обработка несуществующего локального времени); слой роутера (сохранение чужих параметров, replace/push, редирект неизвестного пути); то, что мок и фикстуры не попадают в прод-бандл; надёжность тестовой инфраструктуры (подмена только Date, полифил showModal, сброс store, перехват msw/node); отсутствие прямого импорта фикстур в код приложения и отсутствие бэкенда.
Отчёт: сначала находки по убыванию серьёзности, у каждой точная ссылка на файл и строку и конкретный сценарий сбоя; различай правила репозитория и личные предпочтения; в конце вердикт PASS или NEEDS-CHANGES и перечисление того, что не проверено запуском. Если для вывода нужен запуск команд, используй только то, что разрешено роли (git diff, git log), остальное помечай как непроверенное. Ничего не правь: ни код, ни тесты, ни документы
```

Ответ: [`evidence/responses/09-code-reviewer-foundation.md`](evidence/responses/09-code-reviewer-foundation.md) (один возврат). Что основная сессия передала агенту: [`evidence/responses/09-code-reviewer-foundation-relayed-by-main-session.md`](evidence/responses/09-code-reviewer-foundation-relayed-by-main-session.md). Артефакт: [`review.md`](review.md) (дословный ответ плюс таблица решений; записан не агентом, у роли нет права записи).

Проверка: вызов Agent (`subagent_type: code-reviewer`, 2026-11-06T15:21:54.041Z), транскрипт в `subagents/` (Read 2, Bash 28, SubagentHandback 1). Файлы не менялись: `git status` показывает только артефакты процесса. Наблюдение: у роли разрешён только `Bash(git diff*)` и `Bash(git log*)`, но агент выполнял `cat`, `sed`, `grep`, `find`, `ls` (режим разрешений `auto`); все эти команды чтение, правок и записи не было, но это шире заявленного. Находка S-1 подтверждена мной запуском на Node 24.20.0 (`Date.parse("2026-02-30T10:00:00Z")` даёт 2 марта); N-1 подтверждена чтением `main.tsx`. Агент тесты, lint и build не запускал (помечено «НЕПРОВЕРЕНО»); эти три команды я запускал сам при проверке роли 8, до ревью.

Статусы находок (resolved / accepted limitation / disputed / unresolved): _в таблице `review.md`, будут обновлены после решений разработчика_.

Коммит после роли: `7a7d69a` (2026-11-06T16:26:40+01:00, «docs: code review of foundation (S1-S5)»): `review.md`, ответы агента `evidence/responses/09-*`, обновление лога.

### Роль 10 `/coder` (исправление по ревью foundation: S-1, N-1)

Промпт (дословно, как отправлен; запуск 2026-11-06T15:27:23Z):

```text
Запусти изолированного агента coder через Task/Agent tool, а саму работу роли в основной сессии не делай. Нужна узкая правка по двум находкам из tasks/TASK-001/review.md (ревью foundation, диапазон c921fba..a53becc). Больше ничего не меняй.

1. S-1 (should-fix). В src/shared/lib/datetime.ts функция parseIso принимает календарно невалидные даты: Date.parse("2026-02-30T10:00:00Z") даёт 2 марта, "2026-04-31T10:00:00Z" даёт 1 мая, "2026-01-01T24:00:00Z" даёт 2 января 00:00. По api-integration (раздел 4 п.5 и раздел 6) такая строка должна считаться невалидной (в мапперах это ResponseShapeError, в моке POST это 400 VALIDATION_FAILED). Исправь parseIso так, чтобы эти строки возвращали null, а валидные ISO UTC с Z, с миллисекундами и без них, продолжали разбираться как раньше. Подход выбери сам, самый простой и надёжный (например, круговое сравнение разобранной даты с исходными компонентами), без новых зависимостей. Остальные функции datetime.ts не переписывай. Добавь минимальный регрессионный тест только на это поведение (строки выше и один валидный пример, включая високосный день 2028-02-29) в отдельный небольшой файл рядом с модулем или в src/test. Остальные risk-тесты по датам, клиенту и мок-слою не пиши: их делает test-generator.

2. N-1 (nit). В src/main.tsx, если startBrowserMock() бросает исключение (например, service worker не зарегистрировался), bootstrap падает и страница остаётся пустой без сообщения. Перехвати ошибку, запиши в console.error понятное сообщение (что мок не запустился и по какой причине) и всё равно отрисуй приложение. Поведение в обычном режиме и в проде менять нельзя, динамический import под import.meta.env.DEV остаётся.

Ограничения: остальные находки ревью (N-2…N-7) не трогай; зависимости, конфиги и документы в tasks/ не меняй; workflow-log.md и review.md не трогай; коммиты не делай. Если для исправления понадобится что-то вне этого списка, остановись и покажи варианты.
Запусти npm run lint, npm run build и npm run test и покажи фактический вывод и код выхода каждой. В конце перечисли изменённые файлы и по каждой находке коротко напиши, что именно изменено
```

Ответ: [`evidence/responses/10-coder-fix-s1-n1.md`](evidence/responses/10-coder-fix-s1-n1.md). Что основная сессия передала агенту: [`evidence/responses/10-coder-fix-s1-n1-relayed-by-main-session.md`](evidence/responses/10-coder-fix-s1-n1-relayed-by-main-session.md).

Проверка (моя): вызов Agent (`subagent_type: coder`, 15:27:31Z), транскрипт в `subagents/` (Read 6, Bash 8, SubagentHandback 1; правки через Bash). `git diff`: только `src/main.tsx`, `src/shared/lib/datetime.ts` и новый `src/shared/lib/datetime.parse-iso.test.ts`; зависимости, конфиги и документы не менялись. Повторный запуск: `npm run lint` — 0, `npm run build` — 0, `npm run test` — 0 (2 файла, 8 тестов). Правка S-1: шаблон ISO с группами захвата и круговая сверка компонентов после `Date.parse`; `2026-02-30`, `2026-04-31`, `T24:00:00Z` отклоняются, високосный `2028-02-29` и миллисекунды принимаются. Правка N-1: `await startBrowserMock()` в `try/catch`, `console.error` и рендер приложения в любом случае. Не проверено запуском: ветка `catch` (например, заблокированный service worker), потребители `parseIso` (mappers, handlers, clock, store) отдельными тестами. Пересказ основной сессии содержит неточность: «`review.md` я не создавал» — файл создан и закоммичен (`7a7d69a`) до запуска этой роли; агент о нём не знал, находки взял из промпта.

Статусы находок в `review.md`: S-1 и N-1 — resolved (`e23e4f7`); N-2…N-7 — accepted limitation по решению разработчика (стиль и низкий риск, на AC не влияют).

Коммит после роли: `e23e4f7` (2026-11-06T16:29:42+01:00, «fix: calendar-valid parseIso and resilient mock bootstrap (review S-1, N-1)»): `datetime.ts`, `main.tsx`, `datetime.parse-iso.test.ts`, `review.md`, ответы агента `evidence/responses/10-*`, обновление лога.

### Роль 11 `/coder` (срез S6: список и фильтры)

Промпт (дословно, как отправлен; запуск 2026-11-06T15:30:51Z):

```text
Запусти изолированного агента coder через Task/Agent tool, а саму работу роли в основной сессии не делай. Реализуй срез S6 «список и фильтры» из tasks/TASK-001/implementation-plan.md. Опирайся на план, requirements.md (версия 3), architecture.md, api-integration.md и особенно ui-design.md (список, поиск, фильтр статуса, состояния загрузки, пустоты, нет совпадений и ошибки списка, тексты интерфейса на английском, адаптивная раскладка списка). Foundation S1–S5 уже готов и проверен ревью: используй shared/api, shared/router, shared/lib/datetime, src/mocks и src/test как есть, без переписывания.
Что нужно: маршрут /sessions в app/App.tsx (с редиректом неизвестного пути, как в плане), features/sessions (filters, copy, useSessions, SessionsPage, SessionRow, StatusBadge, LiveStatus при переиспользовании), фильтры только в URL (query и status; поиск пишется через replace с debounce около 300 мс; статус тоже через replace по решению 2=A), посторонние параметры (включая scenario) не теряются, «Clear filters». Тексты интерфейса хранить в модуле features/sessions/copy.ts (решение 3=B). Начальные стили и замену шаблонных index.css и App.css делай в пределах S6 так, чтобы список был рабочим; полный адаптив и доводка остаются на S9.
Тесты: essential-тесты S6 из плана (1: загрузка и список с полями AC-1.2; 2: поиск и статус уходят в GET /api/sessions параметрами query и status, список сужается, «Clear filters» очищает, scenario при сбросе сохраняется; 3: empty и отдельно фильтры без совпадений; 4: list-error и «Try again», восстановление через server.use; 7a: восстановление фильтров из URL, невалидный status трактуется как «все» и не уходит на сервер, посторонние параметры не ломают приложение). Risk-тесты раздела 8 плана и срезы S7–S9 не делай. Детали сессии и форму создания пока не реализуй: кнопка «Create session» и ссылки на детали могут быть без обработчиков или с заглушкой по плану.
Если непроверенное из раздела 7 плана (debounce с userEvent и реальными таймерами, подмена только Date) потребует решения, прими его запуском и честно запиши результат. Зависимости не ставь, конфигурации не меняй без согласования: если понадобится, остановись и покажи варианты. Спорные решения по UI, которых нет в документах, не принимай сам, а покажи варианты с рекомендацией. Документы в tasks/ и workflow-log.md не трогай, коммиты не делай. Запусти npm run lint, npm run build и npm run test и покажи фактический вывод и код выхода. В конце перечисли изменённые файлы и что из критериев S6 проверено запуском, а что нет.
```

Ответ: [`evidence/responses/11-coder-s6-list.md`](evidence/responses/11-coder-s6-list.md). Что основная сессия передала агенту: [`evidence/responses/11-coder-s6-list-relayed-by-main-session.md`](evidence/responses/11-coder-s6-list-relayed-by-main-session.md).

Проверка (моя, проведена 2026-11-09 по транскрипту и рабочему дереву; ответ агента вы мне в пятницу не присылали, он взят из транскрипта): вызов Agent (`subagent_type: coder`, 15:31:08Z), транскрипт в `subagents/` (Read 6, Bash 34, SubagentHandback 1). Файлы изменены только в `src/` (создан `app/`, `features/sessions/`; изменены `index.css`, `App.css`, `main.tsx`; удалён `App.tsx` с переносом в `app/App.tsx`); зависимости, конфиги, `tasks/` не менялись. Поиск запрещённого: `new Date`, `toLocale*`, `Intl` вне `shared/lib/datetime` — нет; `fetch` вне `client.ts` — нет; импорта фикстур в `app/` и `features/` — нет. Команды `lint`, `build`, `test` я запускал в пятницу 16:35, сразу после завершения агента: все с кодом 0, 3 файла, 16 тестов; после этого файлы в `src/` не менялись.

Неточность в отчёте агента: он пишет «9 существующих плюс 7 новых»; фактически до S6 было 8 тестов (6 в `datetime.parse-iso.test.ts`, 2 из `infrastructure.test.ts`), в `sessions-list.test.tsx` 8 `it`. Предупреждение по AC-9.2 («6–7 содержательных тестов»): только S6 уже даёт 8 `it`; с S7 и S8 обязательный набор превысит ориентир, превышение придётся обосновать в итоговом отчёте или объединить тесты (AC-9.2 допускает больше при оправданном риске).

Отклонения агента от плана (по его отчёту): мобильный формат даты строки (ui-design 4.3) оставлен на S9; заголовки колонок не вынесены в `copy.ts` (нарушение решения 3=B, мелкое); тест 3 использует `resetStore({empty:true})` вместо `server.use`; заголовки колонок и скелетон упрощены. Не проверено запуском: фокус после Clear в реальном браузере, адаптив, контраст, `npm run dev`, Назад/Вперёд, reload.

Коммит после роли: `651fcba` — общий коммит срезов S6 и S7 (см. отклонение процесса в блоке роли 12).

### Роль 12 `/coder` (срез S7: детали)

Промпт (дословно, как отправлен; запуск 2026-11-09T07:54:38.844Z):

```text
Запусти изолированного агента coder через Task/Agent tool, а саму работу роли в основной сессии не делай. Реализуй срез S7 «детали» из tasks/TASK-001/implementation-plan.md. Опирайся на план, requirements.md (версия 3, особенно AC-1.8, AC-2.x, AC-4.x по деталям, A-11), architecture.md (D-1: детали по адресу /sessions/:id поверх списка), api-integration.md (деталь, 404, details-error) и ui-design.md (раздел 5: состав деталей, CapacitySummary, null-значения, отмена из деталей; раздел 8: фокус; мобильный вид диалога). Foundation S1–S5 и срез S6 уже готовы: используй shared/api, shared/router, shared/lib/datetime, src/mocks, src/test и features/sessions как есть. Правь S6 только там, где это необходимо для S7 (например, передача состояния «пришли из списка» при открытии строки), и скажи об этом в отчёте.
Что нужно: features/sessions/useSessionDetails (запрос с AbortController, состояния loading, success, error, not-found), SessionDetailsDialog на нативном <dialog> (обёртка Dialog, если она общая), CapacitySummary, маршрут /sessions/:id в app/App.tsx, флаг «пришли из списка» в shared/router. Закрытие всегда идёт через навигацию: кнопка Close, Esc (перехват события cancel), кнопка Назад. Если пришли из списка, закрытие возвращает на прежний URL списка (history назад); при прямом заходе закрытие ведёт на /sessions с сохранённым query string. Если признак утрачен (reload, другая вкладка), действует поведение прямого захода (A-11). Query string списка и посторонние параметры (включая scenario) сохраняются. Детали показывают все поля по ui-design (null как «не указано» без слова null, отмена с причиной и временем для отменённых), состояния загрузки, ошибки деталей (Try again), 404 (без Try again, есть «Back to sessions»). Тексты хранить в модуле copy рядом с фичей (решение 3=B). Начальные стили диалога сделай в пределах S7, полный адаптив и доводка остаются на S9. Фокус: начальный фокус на заголовок диалога, возврат на ссылку строки при закрытии, при прямом заходе возврат на h1 со страницы (fallback по ui-design 8). Реальное поведение фокуса, инертность фона и Esc в jsdom не проверяются, их проверит browser-verify, но логику напиши.
Тесты: только essential-тест 7b из плана (открытие строки меняет URL на /sessions/:id с сохранённым query; deep link открывает диалог поверх отфильтрованного списка; закрытие кнопкой возвращает на прежний URL списка; при прямом заходе закрытие ведёт на /sessions с сохранённым query; проверка по ролям dialog и заголовку). Старайся уложиться в один-два теста: общий набор обязательных тестов не должен сильно разрастаться (ориентир AC-9.2 6–7, в S6 уже 8 `it`). Risk-тесты раздела 8 плана (details-error, 404, null-значения и т. п.) не пиши, их сделает test-generator. Форму создания (S8) и адаптив (S9) не делай.
Непроверенное из раздела 7 плана (showModal в jsdom через полифил из setup.ts, порядок чтения scenario и редиректа) проверяй запуском и честно записывай результат. Зависимости не ставь, конфигурации не меняй без согласования; спорные UI-решения, которых нет в документах, не принимай сам, а покажи варианты с рекомендацией и дождись ответа. Документы в tasks/ и workflow-log.md не трогай, коммиты не делай. Запусти npm run lint, npm run build и npm run test и покажи фактический вывод и код выхода. В конце перечисли изменённые файлы и что из критериев S7 проверено запуском, а что нет
```

Ответ: [`evidence/responses/12-coder-s7-details.md`](evidence/responses/12-coder-s7-details.md). Что основная сессия передала агенту: [`evidence/responses/12-coder-s7-details-relayed-by-main-session.md`](evidence/responses/12-coder-s7-details-relayed-by-main-session.md).

Проверка (моя): вызов Agent (`subagent_type: coder`, 2026-11-09T07:54:56.837Z), транскрипт в `subagents/` (Read 2, Bash 38, SubagentHandback 1). `git status`: новые файлы деталей в `src/features/sessions/`, правки `src/shared/router/index.ts` (+14: `FROM_LIST_STATE`, `cameFromList`, `goBack`, существующий API не менялся), `SessionRow`, `copy.ts`, `App.css`, `app/App.tsx`, `sessions-list.test.tsx` (хелпер `rowLinks` фильтрует ссылки по `/sessions/`, потому что в диалоге есть mailto-ссылка; ожидания теста не менялись); зависимости, конфиги, документы не менялись. Поиск запрещённого: `new Date`, `toLocale*`, `Intl` вне `datetime` — нет; `fetch` вне клиента — нет; импорт фикстур — нет. Мои запуски: `npm run lint` — 0, `npm run build` — 0, `npm run test` — 0 (4 файла, 18 тестов; новые: 2 теста 7b). Общий набор `it` теперь 8 (S6) + 2 (S7) + 8 (прочие: datetime 6 + инфраструктура 2 из `it.each`); относительно ориентира AC-9.2 («6–7 содержательных тестов») превышение уже есть, решение и обоснование — в итоговом отчёте.

Отклонение процесса (моё и разработчика): срез S6 к моменту запуска S7 не был закоммичен (последний коммит `e23e4f7`), поэтому S6 и S7 попадут в один коммит; границу между ними видно по записям лога и ответам агентов, а не по git.

Не проверено запуском: реальные `showModal`, фокус на заголовок, возврат на строку или `h1`, инертность фона, Esc, «Назад», клик по backdrop, `fromList` при reload; loading, error, 404 диалога, `details-error`, null-значения (логика написана, risk-тесты не писались); мобильный вид, контраст.

Вопросы агента и решения разработчика: _будут записаны_. Рекомендации ассистента: 1 (формат даты в деталях «Monday, Aug 3 at 18:00 (GMT+3)» по ui-design 5.2 п.2, сейчас «Aug 3, 2026, 18:00 GMT+2») — доработать на S9 вместе с мобильным форматом строки списка, нужен новый формат в `datetime`; 2 (строка «Reason» при `reason: null`) — оставить пропуск строки, дизайн требует «Reason» только когда причина есть.

Коммит после роли: `651fcba` — общий с ролью 11 (S6 и S7 в одном коммите).

### Роль 13 `/coder` (срез S8: создание)

Промпт (дословно, как отправлен; запуск 2026-11-09T08:03:21Z):

```text
Запусти изолированного агента coder через Task/Agent tool, а саму работу роли в основной сессии не делай. Реализуй срез S8 «создание» из tasks/TASK-001/implementation-plan.md. Опирайся на план, requirements.md (версия 3: AC-3.x по форме и валидации, AC-4.x, A-13, Q-6), architecture.md (D-4, D-7), api-integration.md (раздел 9: createSession, guard по coachId, ошибки POST, coaches-error) и ui-design.md (форма во втором нативном <dialog> без URL, поля и подписи, значения по умолчанию Type=Training и Visibility=Public, момент показа ошибок, ошибка уровня формы, pending, экран успеха «Session created» с кнопками «Open session», «Create another», «Close» и подсказкой «Clear filters» при активных фильтрах, подтверждение закрытия грязной формы «Keep editing» / «Discard», фокус). Foundation S1–S5 и срезы S6, S7 готовы: используй shared/api, shared/router, shared/lib/datetime, src/mocks, src/test, features/sessions и общую обёртку Dialog как есть. Правки S6 и S7 допускаются только там, где это необходимо для S8 (например, колбэк открытия формы в SessionsPage и перезапрос списка после создания через reloadKey); перечисли их в отчёте.
Что нужно: features/create-session (useCoaches, useCreateSession с guard: createSession не вызывается, пока список тренеров не загружен успешно или coachId не входит в загруженный список; флаг pending блокирует повторный вызов; POST не отменяется), форма с клиентской валидацией по AC-3.1–3.9 (поля, ограничения, дата и время в будущем через shared/lib/datetime, правило несуществующего локального времени, лимит описания 1000 символов как UI-допущение A-13), ошибки полей и формы (в том числе 400 VALIDATION_FAILED с fieldErrors, 500 create-error, сетевые и malformed ответы без утверждения «не создана»), связь aria-invalid и aria-describedby, живые регионы, coaches-error (блокируется только поле Coach с «Try loading coaches again», остальная форма доступна, кнопка отправки активна, но POST не уходит), экран успеха, колбэк «Open session» (открывает детали новой сессии), перезапрос списка после успеха и после закрытия формы при сетевой или malformed-ошибке POST. Кнопки «Create session» в шапке и в пустом состоянии открывают форму. Тексты хранить в features/create-session/copy.ts (решение 3=B). Начальные стили в пределах S8; полный адаптив и доводка остаются на S9.
Тесты: только essential-тесты 5 и 6 из плана (5: ошибки валидации у полей со связью aria-invalid/aria-describedby; успешная отправка с подтверждением; ровно один POST при повторном клике во время ожидания; после успеха список перезапрашивается и «Open session» открывает детали; 6: create-error (500) с сохранением ввода и понятным сообщением, 400 с fieldErrors через server.use, при coaches-error нажатие отправки не порождает POST и виден путь восстановления). Общее число тестов в репозитории уже превышает ориентир AC-9.2: делай как можно меньше `it`, объединяй близкие проверки в сценарные тесты. Risk-тесты раздела 8 плана (empty+POST, активные фильтры и экран успеха, подтверждение закрытия грязной формы, граничные тесты клиента и т. п.) не пиши, их сделает test-generator. Адаптив и README (S9) не делай.
Непроверенное из раздела 7 плана (полифил showModal для второго диалога, фейковые таймеры с userEvent) проверяй запуском и честно записывай результат. Зависимости не ставь, конфигурации не меняй без согласования; спорные UI-решения, которых нет в документах, не принимай сам, а покажи варианты с рекомендацией и дождись ответа. Документы в tasks/ и workflow-log.md не трогай, коммиты не делай. Запусти npm run lint, npm run build и npm run test и покажи фактический вывод и код выхода. В конце перечисли изменённые файлы, что из критериев S8 проверено запуском, а что нет
```

Ответ: [`evidence/responses/13-coder-s8-create.md`](evidence/responses/13-coder-s8-create.md). Что основная сессия передала агенту: [`evidence/responses/13-coder-s8-create-relayed-by-main-session.md`](evidence/responses/13-coder-s8-create-relayed-by-main-session.md).

Проверка (моя): вызов Agent (`subagent_type: coder`, 08:03:42Z), транскрипт в `subagents/` (Read 10, Bash 46, SubagentHandback 1). `git status`: новая папка `src/features/create-session/`, правки `app/App.tsx`, `SessionsPage.tsx` (проп `reloadKey`, `data-create-trigger`), `datetime.ts`, `App.css`; `package.json`, `vite.config.ts`, `tsconfig*`, `.oxlintrc.json`, документы и зависимости не менялись. Поиск запрещённого: `new Date`, `toLocale*`, `Intl` вне `datetime` — нет; `fetch` вне клиента — нет; импорт фикстур — нет. Guard в `useCreateSession`: `createSession` не вызывается, пока `coaches.status !== "success"` или `coachId` не входит в список; флаг pending на `ref` блокирует повторный вызов. Мои запуски: `npm run lint` — 0, `npm run build` — 0, `npm run test` — 0 (5 файлов, 21 тест; новых 3). Агент сообщил, что временно убирал защиту от повторной отправки, тест упал, затем вернул (в транскрипте можно проверить).

Отклонения агента от промпта (по его отчёту, подтверждены чтением): 1) в `datetime.ts` (foundation) добавлены `formatSummaryDateTime` и `formatTimeZoneName`; промпт допускал правки только S6 и S7, но добавление аддитивное, старые функции не менялись; 2) два небольших UI-решения принял сам, хотя промпт требовал остановиться и показать варианты: при 400 с `fieldErrors` показан блок `role=alert` плюс ошибки у полей; после «Keep editing» фокус возвращается туда, где был, при отсутствии элемента на Cancel (документы этого не описывают); 3) каркас формы переиспользует классы диалога деталей `details-*` (вводит в заблуждение, переименование отложено на S9). Вопрос 3 агента: показывать ли серверный `message` для 409 и неизвестного кода (сейчас не показывается).

Не проверено запуском (risk-тесты и browser-verify): границы AC-3.8 (заметки до 500) и A-13 (описание до 1000), несуществующее локальное время (DST), подтверждение закрытия грязной формы, сеть и malformed при POST и перезапрос списка при закрытии, «Clear filters» на экране успеха, `empty` + POST, сброс выбранного тренера после повтора загрузки coaches; реальные `showModal`, фокус, инертность фона, Esc (включая повторный), мобильный вид, озвучка.

Решения разработчика по вопросам агента: _будут записаны_. Рекомендации ассистента: 1 — оставить блок alert плюс ошибки у полей (так пользователь видит общее сообщение и конкретные поля); 2 — оставить; 3 — не показывать серверный `message` (технический текст бэкенда не для пользователя), оставить общий понятный текст.

Коммит после роли: `787d5fb` (`feat: create session form (S8)`).

### Роль 14 `/coder` (срез S9: адаптив, доступность, README, полировка)

Промпт (дословно из транскрипта основной сессии, `<command-args>` команды `/coder`; отправлен 2026-11-09T10:14:13Z = 11:14:13 CET; агент стартовал 10:14:22Z, закончил 10:17:04Z):

```text
Запусти изолированного агента coder через Task/Agent tool, а саму работу роли в основной сессии не делай. Реализуй срез S9 «адаптив, доступность, README, полировка» из tasks/TASK-001/implementation-plan.md. Опирайся на план (раздел S9, раздел 5 про проверки, строки про правила сверх AC: цели касания 44px и шрифт полей 16px на мобильном, `prefers-reduced-motion`, шаблонные index.css и App.css), ui-design.md (раздел про адаптив 1440×900 и 390×844, состояния фокуса, цвета и контраст, форматы даты в строке списка на мобильном и в деталях по п. 5.2), requirements.md (версия 3, AC по адаптиву, доступности и README) и DESIGN_TOKENS из задания. Foundation и срезы S6–S8 готовы и закоммичены: используй код как есть, правь только то, что нужно для S9.

Что нужно:
1. Адаптив: на 1440×900 список колонками, на 390×844 стек строк, оба диалога на весь экран на мобильном, без горизонтальной прокрутки и перекрытий; цели касания не меньше 44px и шрифт полей не меньше 16px на мобильном.
2. Доступность: видимые состояния фокуса у всех интерактивных элементов, учёт `prefers-reduced-motion`, порядок табуляции и подписи не ломать. Контраст по расчёту ui-design 4.4 не измерен: не заявляй, что он проверен, это сделает browser-verify.
3. Форматы даты: в деталях «Monday, Aug 3 at 18:00 (GMT+3)» по ui-design 5.2 п.2 и мобильный формат даты строки списка по ui-design. Новые форматы добавляй только в shared/lib/datetime.ts (там же вся работа с датами и часовыми поясами); это разрешённая аддитивная правка foundation, старые функции не меняй. Если существующие тесты зависят от старого формата, обнови ожидаемые строки в них и перечисли в отчёте, какие именно.
4. Полировка из ревью и отчётов: переименуй классы `details-*`, которые переиспользует форма создания, в нейтральные (общая обёртка диалога); вынеси заголовки колонок списка в features/sessions/copy.ts; в деталях строку «Reason» при reason: null пропускай.
5. Замени шаблонные index.css и App.css там, где они противоречат светлой палитре и раскладке (оговорка к AC-10.3), тёмную тему не вводи.
6. README.md: команда запуска `npm run dev` (мок включается только в dev), описание сценариев через `?scenario=` и `VITE_MOCK_SCENARIO` со списком названий из src/mocks/scenarios.ts, команды `npm run lint`, `npm run build`, `npm run test`. Не выдумывай то, чего нет в коде: названия сверяй с файлами.

Ограничения: новых автотестов не пиши (jsdom не проверяет вёрстку и фокус), risk-тесты сделает test-generator. Зависимости не ставь, конфигурации не меняй без согласования. Спорные UI-решения, которых нет в документах, не принимай сам: покажи варианты с рекомендацией и дождись ответа. Документы в tasks/ и workflow-log.md не трогай, коммиты не делай. Реальный браузер тебе недоступен: не утверждай, что адаптив, фокус, контраст или showModal проверены, только что реализовано по документам. Запусти npm run lint, npm run build и npm run test и покажи фактический вывод и код выхода. В конце перечисли изменённые файлы, что из критериев S9 проверено запуском, а что нет.

Когда придёт ответ, пришлите его. Я проверю так же, как раньше: вызов Agent и транскрипт, объём правок, lint, build и test, поиск запрещённого. Отдельно посмотрю тесты, у которых сменился формат даты.
```

Ответ: [`evidence/responses/14-coder-s9-polish.md`](evidence/responses/14-coder-s9-polish.md) (дословно из SubagentHandback).

Проверка (моя): подтверждён транскрипт агента в `subagents/` (Bash 32, Read 4, SubagentHandback 1; тип `coder`). Правки: README.md, App.css, index.css, datetime.ts, SessionRow, SessionsPage, SessionDetailsDialog, copy.ts, CreateSessionDialog, SuccessScreen (+336/−150); конфигураций, `package.json`, новых тестов нет. Поиск запрещённого (`new Date`, `toLocale*`, `Intl.` вне `datetime`, `fetch` вне клиента): пусто; старых классов `details-dialog|frame|header` в `src` нет. Мои запуски: `lint` — 0, `build` — 0, `test` — 0 (5 файлов, 21 тест). В `datetime.ts` добавлены `formatListDateTimeCompact` и `formatDetailsSchedule`, старые функции не менялись.

Наблюдения и отклонения: 1) агент правил файлы через Bash (python/heredoc), а не через Edit/Write, результат проверен по `git diff`; 2) `formatDetailsDateTime` в `datetime.ts` осталась без использования (мёртвый код, для ревью); 3) в строке списка в DOM два варианта даты (`.start-wide`, `.start-narrow`), в jsdom CSS не применяется, поэтому `getByText` по дате может найти два совпадения (учесть test-generator); 4) брейкпоинты 720px и 640px расходятся по диапазону 641–720px; 5) рамка фокуса строки через `:has()`; 6) строка «Reason» при `reason: null` уже пропускалась (подтверждено чтением), правка не потребовалась; 7) шаблонных стилей в CSS к S9 уже не было, агент их дополнил.

Не проверено (за browser-verify): вёрстка 1440×900 и 390×844, горизонтальная прокрутка, цели 44px, шрифт 16px, фокус, `showModal`, safe-area, reduced-motion, контраст.

Решения разработчика по вопросам S7 и S8: _будут записаны_.

Коммит после роли: `3d98cd5` (S9).

### Роль 15 `/code-reviewer` (S6–S9)

Промпт (дословно из транскрипта основной сессии, `<command-args>` команды `/code-reviewer`; отправлен 2026-11-09T13:30:04Z = 14:30:04 CET; агент стартовал 13:30:12Z, закончил 13:33:45Z):

```text
Запусти изолированного агента code-reviewer через Task/Agent tool, а саму работу роли в основной сессии не делай. Проверь диапазон коммитов e23e4f7..3d98cd5 (git log и git diff по нему): срез S6 «список и фильтры» и S7 «детали» (651fcba), S8 «создание» (787d5fb), S9 «адаптив, доступность, README» (3d98cd5). Foundation S1–S5 уже проверен в прошлом ревью (tasks/TASK-001/review.md), его заново не проверяй, только места, где эти срезы его используют или меняют (например, добавления в shared/lib/datetime.ts). Файлы в tasks/ и evidence/ в диапазоне игнорируй.

Сверяй с requirements.md (версия 3), architecture.md, api-integration.md, ui-design.md и implementation-plan.md. Прежние решения ревью (S-1, N-1 исправлены; N-2…N-7 приняты как ограничения) заново не открывай, если они не проявились в новом коде иначе.

Что искать в первую очередь:
1. Соответствие AC и документам: фильтры в URL (replace, debounce 300 мс), AbortController на GET и отсутствие отмены у POST, все состояния списка и деталей (loading, empty, error, 404, not-found, network, malformed), guard по coachId, правила валидации формы AC-3.x и A-13, текст ошибок, подтверждение закрытия грязной формы, экран успеха и «Clear filters».
2. Запрещённое проектом: new Date, toLocale*, Intl вне shared/lib/datetime; fetch вне shared/api/client.ts; импорты фикстур вне src/mocks; прямой доступ к бэкенду.
3. Доступность: связь aria-invalid и aria-describedby, живые регионы, названия и роли диалогов, фокус при открытии и закрытии, Esc, возврат фокуса, видимый фокус, клавиатура, `prefers-reduced-motion`, дубль даты `.start-wide` и `.start-narrow` в строке списка (скрытый вариант должен быть вне дерева доступности).
4. Гонки и утечки: отмена устаревших запросов, повторные отправки, сброс состояния при переходе между сессиями, подписки и таймеры в хуках.
5. Адаптив в коде: брейкпоинты 720px и 640px против ui-design (диапазон 641–720px, форма с мобильными полями при неполноэкранном диалоге), `:has()` для рамки фокуса строки, safe-area. Помни, что реальный браузер недоступен: отмечай как «не проверено, нужен browser-verify», а не как найденный дефект, если вывод нельзя сделать по коду.
6. Качество: мёртвый код (formatDetailsDateTime в datetime.ts), переиспользование классов и стилей, размер CreateSessionDialog (около 640 строк), дубли, нарушение границ слоёв из architecture.md.
7. Тесты essential S6–S8: пробелы, хрупкие или ложно проходящие проверки (в том числе вносящие побочные эффекты между тестами).

Формат ответа: findings по приоритету (blocker, major, minor, nit), для кажк, чем подтверждено (цитата или ссылка на документ), предложениеисправления. Отдельно: что проверено по коду и что осталось для browser-verify. Код и документы не меняй, коммиты не делай; запись review.md сделает разработчик.
```

Ответ: [`evidence/responses/15-code-reviewer-s6-s9.md`](evidence/responses/15-code-reviewer-s6-s9.md); дословная копия в [`review.md`](review.md) (второй раздел, записано мной, у роли нет права записи).

Проверка (моя): транскрипт агента в `subagents/` (тип `code-reviewer`, Bash 42, Read 8, SubagentHandback 1). Вердикт агента: PASS, blocker и major нет, 6 minor (M-1…M-6), 7 nit. Агент сам прогнал vitest (21 тест), tsc и oxlint без замечаний. Выборочно подтверждено мной чтением: M-1 (`App.css:194-200`, `outline: none` на ссылке без запасного варианта вне `:has()`), nit про `viewport-fit=cover` (в `index.html` его нет). Остальные находки по тексту агента, мной не перепроверялись.

Решения разработчика по находкам: исправить M-1…M-5 и мелкие nit узкой правкой `/coder` (запуск следующий); M-6 передать `/test-generator`; остальные nit принять как ограничения (статусы будут проставлены в `review.md` после правки). Решения по вопросам S7 и S8 разработчик отдельно не подтверждал: записаны рекомендации ассистента.

Коммит после роли: `26e9c37` (запись ревью).

### Роль 16 `/coder` (правки ревью S6–S9)

Промпт (дословно из транскрипта основной сессии, `<command-args>` команды `/coder`; отправлен 2026-11-09T13:41:51Z = 14:41:51 CET; агент стартовал 13:42:04Z, закончил 13:44:06Z):

```text
Запусти изолированного агента coder через Task/Agent tool, а саму работу роли в основной сессии не делай. Исправь находки ревью S6–S9: M-1…M-5 и перечисленные ниже мелкие nit. Опирайся на tasks/TASK-001/review.md (второй раздел, ревью e23e4f7..3d98cd5) и на документы: requirements.md (версия 3), ui-design.md (раздел 8 про фокус, раздел 4.3 про адаптив), api-integration.md, architecture.md. Правь только то, что нужно для этих находок; всё остальное оставь как есть.

Что исправить:
1. M-1 (App.css:194-200): у строки списка не должно оставаться состояния без видимого фокуса там, где нет :has(). Оставь outline на ссылке по умолчанию и снимай его (с рамкой на строке) только внутри @supports selector(:has(*)).
2. M-2 (SessionsPage.tsx): флаг justCleared устаревает, после «Clear filters» и «Назад» live-регион может ложно сказать «Filters cleared». Сбрасывай флаг при любом изменении фильтров из URL, не только при вводе в поиск.
3. M-3 (SessionsPage.tsx): таймер debounce поиска нужно отменять при внешней навигации (Back/Forward, переход по ссылке, Clear filters), чтобы отложенный replace не перезаписывал URL, выбранный пользователем (AC-1.11).
4. M-4 (SessionsPage.tsx, useSessions.ts): в состояниях empty и no-match при перезапросе область списка пуста (нет ни скелетона, ни сообщения) и вёрстка скачет. Покажи на время перезапроса скелетон или прежнее содержимое; выбери вариант, который уже согласуется с ui-design (раздел про состояния списка и повторную загрузку). Если документы не определяют, какой из вариантов, не выбирай сам: покажи варианты с рекомендацией и останперезапроса скелетон или прежнее содержимое; выбери вариант, который уже согласуется с ui-design (раздел про состояния списка и повторную загрузку). Если документы не определяют,
какой из вариантов, не выбирай сам: покажи варианты с рекомендацией и остан
5. M-5 (SessionDetailsDialog.tsx): блок «Session not found» не озвучивается; сделай его live-регионом по принятому в проекте образцу для сообщений диалогов (проверь, как оформлены
другие сообщения об ошибках).

Мелкие nit, которые тоже исправить:
6. Добавить viewport-fit=cover в meta viewport в index.html, чтобы правила
7. Удалить мёртвый код: formatDetailsDateTime в shared/lib/datetime.ts, стаспользуемое в useCreateSession (см. ревью). Перед удалением убедись поискомпо src и тестам, что оно нигде не используется.                                                                                                                                    8. Счётчик символов описания в форме должен считаться так же, как валидатора, чтобы не показывалось «1001 / 1000» без ошибки). Выбери вариант, которыйне меняет AC-3.x и A-13, и укажи его в отчёте.                                                                                                                                     
Не трогай (приняты как ограничения): дубли isStatus и хелперов дат, повторяющийся шаблон «Settled + key + abort» в трёх хуках, размер CreateSessionDialog, закрытие деталей при    выделении текста, дубль заголовка при загрузке деталей, дубль правил preferПробелы в тестах (M-6) не закрывай: их сделает test-generator. Новые тестыне пиши, кроме случая, когда без них нельзя подтвердить исправление M-2 илист и объясни почему); существующие тесты менять только если исправление
этого требует, и перечисли такие правки.

Зависимости не ставь, конфигурации не меняй, документы в tasks/ и workflow-делай. Правки делай инструментами Edit и Write, а не скриптами через Bash.Реального браузера у тебя нет: не утверждай, что фокус, озвучка или вёрстка проверены, говори только, что реализовано по документам. Запусти npm run lint, npm run build и npm run test и покажи фактический вывод и код выхода. В конце перечисли изменённые …M-5 и nit 6–8 скажи, что сделано, чем подтверждено (запуск, тест или только чтение кода) и что осталось для browser-verify.
```

Ответ: [`evidence/responses/16-coder-review-fixes.md`](evidence/responses/16-coder-review-fixes.md). Статусы находок: [`review.md`](review.md).

Проверка (моя): транскрипт агента в `subagents/` (тип `coder`, Edit 36, Bash 30, Read 2, SubagentHandback 1; правки через Edit, как просил промпт). Объём: 8 файлов (index.html, App.css, SessionsPage, useSessions, SessionDetailsDialog, CreateSessionDialog, useCreateSession, datetime.ts), +78/−45; тестов, конфигов и зависимостей нет. Поиск запрещённого пуст; `formatDetailsDateTime` в `src` нет. Мои запуски: `lint` — 0, `build` — 0, `test` — 0 (5 файлов, 21 тест). Чтением diff подтверждены: `@supports` для M-1, сброс `justCleared` по ключу фильтров (M-2), `ownNavigation` и отмена таймера (M-3), `shownFilters` и `.is-refreshing` (M-4), `role="alert"` у блока 404 (M-5), `trim()` в счётчиках.

Отклонения и наблюдения: 1) пункт 7 агент прочитал по тексту ревью; результат совпал с заданием (удалены `formatDetailsDateTime` и `"idle"`, ветка `cancelled` оставлена); 2) M-4: агент не останавливался на согласование, так как нашёл ответ в ui-design (293, 363); приглушение сообщений empty/no-match — небольшое расширение сверх буквы документа; 3) M-2 и M-3 не покрыты тестами (агент отнёс к M-6), логика M-3 нетривиальна и держится на чтении; остаточный риск описан в `review.md`.

Не проверено (за browser-verify): рамка фокуса строки с `:has()` и без, озвучка 404, «Clear filters» + «Назад» и «ввод + Назад» живьём, высота без скачка и контраст приглушённых сообщений, safe-area на iOS.

Коммит после роли: `becc0b8`.

### Роль 17 `/test-generator` (risk-тесты, M-6)

Промпт (дословно из транскрипта основной сессии, `<command-args>` команды `/test-generator`; первая отправка 2026-11-09T13:49:58Z = 14:49:58 CET; агент стартовал 13:50:08Z, закончил 13:57:03Z):

```text
Запусти изолированного агента test-generator через Task/Agent tool, а саму работу роли в основной сессии не делай. Добавь risk-based тесты по разделу 8 tasks/TASK-001/implementation-plan.md и по находке M-6 из tasks/TASK-001/review.md (второй раздел, ревью S6–S9). Опирайся на requirements.md (версия 3, AC-3.x, A-13, AC-1.11), api-integration.md (раздел 14), ui-design.md и на существующие тесты и test-инфраструктуру (src/test/*, src/mocks/*, vitest, RTL, user-event, msw/node, подмена только Date через vi.useFakeTimers({toFake:["Date"]}), полифил showModal в setup.ts). Production-код не меняй. Если для теста нужна правка production-кода или документ противоречит коду, остановись и покажи варианты, а не правь сам.

Что покрыть (по приоритету риска):
1. Граничные тесты shared/api (раздел 8, пункты 1–6): HTML со статусом 200 и не-JSON, HttpResponse.error(), 400 и 500 с телом контракта и без него, неверная форма 200, ровно query и status в запросе списка без пустых значений и без scenario, отмена (ответ отменённого запроса не меняет состояние, в том числе под StrictMode). Отдельный небольшой файл.
2. datetime: несуществующее локальное время, невалидная дата (30 февраля), «в будущем», формат startsAt без миллисекунд, новые форматтеры formatListDateTimeCompact и formatDetailsSchedule (в том числе часовой пояс и экваториальные значения), formatSummaryDateTime, formatTimeZoneName. Часовой пояс задавай явно и не зависящим от машины способом.
3. validate: границы AC-3.1–3.8 и A-13 таблично (в том числе заметки до 500, описание до 1000, trim), если не покрыты существующими тестами.
4. Форма и сценарии: подтверждение закрытия грязной формы («Keep editing», «Discard»), сетевая и malformed-ошибка POST (текст не утверждает «не создана», закрытие формы запускает перезапрос списка), empty + POST показывает созданную сессию, активные фильтры скрывают созданную сессию: экран успеха, «Clear filters», «Open session».
5. Детали: error и 404 (сообщение, «Try again» кроме 404, «Back to sessions», переход ошибка → успех через server.use), null для описания и заметок без слова «null».
6. Список и URL (M-2, M-3 из ревью): после «Clear filters» и «Назад» к отфильтрованному URL live-регион не говорит «Filters cleared»; ввод в поиск и «Назад» в окне 300 мс не перезаписывают URL отложенным replace (AC-1.11). Это нетривиальная логика без тестов, но, если стабильно проверить в jsdom не получается, не пиши хрупкий тест, а скажи об этом в отчёте.
7. Слабые места существующих тестов (M-6): жёсткое «8 fields» в create-session.test.tsx:85 и регэксп `1[45]T…:00Z` вместо проверки конверсии local→UTC в :122. Исправь эти проверки минимально и перечисли правки существующих тестов.

Ограничения и правила:
- AC-9.2 даёт ориентир 6–7 содержательных тестов, в репозитории уже 21. Risфайлах (например, *.risk.test.ts(x)) и помечай в начале каждого файлакомментарием «risk-based, не входят в обязательный набор AC-9.1»; для каждого файла добавь краткое обоснование риска. Не раздувай набор: один сценарный тест вместо нескольких мелких там, где это не снижает диагностику; таблицы для границ.
- В строке списка в DOM две версии даты и длительности (.start-wide и .start-narrow), потому что jsdom не применяет CSS. Ищи дату и длительность через роль, within строки или
getAllBy*, а не getByText, и не опирайся на текст, зависящий от CSS.
- Не проверяй в jsdom то, что он проверить не может: реальный showModal, фокус, инертность фона, вёрстку, контраст. Это за browser-verify; не заявляй такие проверки как
выполненные.
- Не ослабляй и не удаляй существующие проверки. Каждый новый тест должен по поведения; для самых рискованных (отмена запроса, M-3) убедись в этом,
временно сломав поведение и вернув обратно, и честно запиши результат (в pr правки делай только в рабочей копии и обязательно верни; перечисли, что
ломал).
- Зависимости не ставь, конфигурации не меняй без согласования, документы втрогай, коммиты не делай. Правки делай инструментами Edit и Write, а нескриптами через Bash.
- Запусти npm run lint, npm run build и npm run test, покажи фактический вытестов до и после по файлам.

В конце: список новых и изменённых файлов, что покрыто из пунктов 1–7, что е расхождения кода и документов (если они появились, это не повод править
production-код самому), что осталось для browser-verify.

Пришлите ответ. Я проверю объём, прогоню lint, build и test сам и проверю, : git diff не должен показывать ничего вне *.test.*. Также проверю, что
временные поломки ради проверки тестов возвращены, и пройду по разделу 8 пл непокрытым без причины.
```

Повторная отправка той же команды (2026-11-09T13:54:17Z = 14:54:17 CET), пока первый агент ещё работал; второй агент запущен не был, работал первый:

```text
Запусти изолированного агента test-generator через Task/Agent tool, а саму работу роли в основной сессии не делай. Добавь risk-based тесты по разделу 8 tasks/TASK-001/implementation-plan.md и по находке M-6 из tasks/TASK-001/review.md (второй раздел, ревью S6–S9). Опирайся на requirements.md (версия 3, AC-3.x, A-13, AC-1.11), api-integration.md (раздел 14), ui-design.md и на существующие тесты и test-инфраструктуру (src/test/*, src/mocks/*, vitest, RTL, user-event, msw/node, подмена только Date через vi.useFakeTimers({toFake:["Date"]}), полифил showModal в setup.ts). Production-код не меняй. Если для теста нужна правка production-кода или документ противоречит коду, остановись и покажи варианты, а не правь сам. Что покрыть (по приоритету риска): 1. Граничные тесты shared/api (раздел 8, пункты 1–6): HTML со статусом 200 и не-JSON, HttpResponse.error(), 400 и 500 с телом контракта и без него, неверная форма 200, ровно query и status в запросе списка без пустых значений и без scenario, отмена (ответ отменённого запроса не меняет состояние, в том числе под StrictMode). Отдельный небольшой файл. 2. datetime: несуществующее локальное время, невалидная дата (30 февраля), «в будущем», формат startsAt без миллисекунд, новые форматтеры formatListDateTimeCompact и formatDetailsSchedule (в том числе часовой пояс и экваториальные значения), formatSummaryDateTime, formatTimeZoneName. Часовой пояс задавай явно и не зависящим от машины способом. 3. validate: границы AC-3.1–3.8 и A-13 таблично (в том числе заметки до 500, описание до 1000, trim), если не покрыты существующими тестами. 4. Форма и сценарии: подтверждение закрытия грязной формы («Keep editing», «Discard»), сетевая и malformed-ошибка POST (текст не утверждает «не создана», закрытие формы запускает перезапрос списка), empty + POST показывает созданную сессию, активные фильтры скрывают созданную сессию: экран успеха, «Clear filters», «Open session». 5. Детали: error и 404 (сообщение, «Try again» кроме 404, «Back to sessions», переход ошибка → успех через server.use), null для описания и заметок без слова «null». 6. Список и URL (M-2, M-3 из ревью): после «Clear filters» и «Назад» к отфильтрованному URL live-регион не говорит «Filters cleared»; ввод в поиск и «Назад» в окне 300 мс не перезаписывают URL отложенным replace (AC-1.11). Это нетривиальная логика без тестов, но, если стабильно проверить в jsdom не получается, не пиши хрупкий тест, а скажи об этом в отчёте. 7. Слабые места существующих тестов (M-6): жёсткое «8 fields» в create-session.test.tsx:85 и регэксп `1[45]T…:00Z` вместо проверки конверсии local→UTC в :122. Исправь эти проверки минимально и перечисли правки существующих тестов. Ограничения и правила:
- AC-9.2 даёт ориентир 6–7 содержательных тестов, в репозитории уже 21. Risk-тесты размещай в отдельных файлах (например, *.risk.test.ts(x)) и помечай в начале каждого файла комментарием «risk-based, не входят в обязательный набор AC-9.1»; для каждого файла добавь краткое обоснование риска. Не раздувай набор: один сценарный тест вместо нескольких мелких там, где это не снижает диагностику; таблицы для границ.
- В строке списка в DOM две версии даты и длительности (.start-wide и .start-narrow), потому что jsdom не применяет CSS. Ищи дату и длительность через роль, within строки или getAllBy*, а не getByText, и не опирайся на текст, зависящий от CSS. - Не проверяй в jsdom то, что он проверить не может: реальный showModal, фокус, инертность фона, вёрстку, контраст. Это за browser-verify; не заявляй такие проверки как выполненные.
- Не ослабляй и не удаляй существующие проверки. Каждый новый тест должен падать при поломке тестируемого поведения; для самых рискованных (отмена запроса, M-3) убедись в этом, временно сломав поведение и вернув обратно, и честно запиши результат (в production-коде такие временные правки делай только в рабочей копии и обязательно верни; перечисли, что ломал). - Зависимости не ставь, конфигурации не меняй без согласования, документы в tasks/ и workflow-log.md не трогай, коммиты не делай. Правки делай инструментами Edit и Write, а не скриптами через Bash.
- Запусти npm run lint, npm run build и npm run test, покажи фактический вывод и код выхода. Количество тестов до и после по файлам. В конце: список новых и изменённых файлов, что покрыто из пунктов 1–7, что не покрыто и почему, найденные расхождения кода и документов (если они появились, это не повод править production-код самому), что осталось для browser-verify.
```

Ответ: [`evidence/responses/17-test-generator-risk.md`](evidence/responses/17-test-generator-risk.md).

Проверка (моя): транскрипт агента в `subagents/` (тип `test-generator`, Edit 52, Write 12, Bash 70, Read 2, SubagentHandback 1). Объём: шесть новых файлов `client.risk.test.ts`, `datetime.risk.test.ts`, `validate.risk.test.ts`, `create-session.risk.test.tsx`, `session-details.risk.test.tsx`, `sessions-url.risk.test.tsx` и правка `create-session.test.tsx` (+9/−3); вне `*.test.*` и `tasks/` изменений нет, production-код не тронут, конфигов и зависимостей нет, каталога `.vitest/` нет. Мои запуски: `lint` — 0, `build` — 0, `test` — 0 (11 файлов, 184 теста). Я прогнал набор под `TZ=UTC`, `America/Los_Angeles`, `Pacific/Auckland`, `Asia/Kolkata`: везде 184 из 184. Мутация M-3 (убрана отмена таймера в `SessionsPage.tsx`) мной повторена: тест «typing and then Back…» падает, остальные в файле зелёные; файл возвращён, `git status` по `src` без правок вне тестов.

Правки существующих тестов (оба в `create-session.test.tsx`): жёсткое «8 fields» заменено сверкой числа в объявлении с числом контролов `aria-invalid="true"`; регэксп `1[45]T…:00Z` заменён точным `2026-09-15T13:00:00Z` с поясом `Asia/Kolkata` через `vi.stubEnv` и `vi.unstubAllEnvs()` в `afterEach`.

Наблюдения и отклонения: 1) число тестов выросло с 21 до 184 из-за `it.each` (client 50, datetime 43, validate 58, остальные risk 12); ориентир AC-9.2 (6–7) превышен, обоснование: essential-набор отдельно (21 тест в пяти файлах), risk-файлы помечены; таблицы можно сократить, решение за разработчиком; 2) в трёх тестах реальные паузы (`later(30)`, `later(60)`, `later(SEARCH_DEBOUNCE_MS + 150)`): небольшой остаточный риск флейка; 3) мутации агент проверил для отмены запроса (2 теста упали), M-3 и M-2; остальные тесты на мутациях не проверялись; 4) не покрыто: полная матрица Back/Forward AC-1.11, «список не перезапрашивается» после 500/400 при закрытии формы, нормализация адреса в `ownNavigation` (риск M-3 из ревью), отсутствие `signal` у POST только чтением; 5) расхождений кода и документов агент не нашёл.

Не проверено (за browser-verify): реальный `showModal`, Esc, фокус и инертность, озвучка `role="alert"` (M-5), рамка фокуса без `:has()` (M-1), поведение M-2 и M-3 живьём, вёрстка 1440×900 и 390×844, контраст, `preview`.

Решение по размеру набора (AC-9.2): _будет записано разработчиком_.

Коммит после роли: `87f8dda` (`test: risk-based tests, M-6 fixes, verbatim prompts in log`); `becc0b8` — предыдущий коммит (правки ревью, роль 16).

### Роль 18 `/browser-verify` (попытка 1: BLOCKED)

Промпт (дословно из транскрипта основной сессии, `<command-args>` команды `/browser-verify`; отправлен 2026-11-09T14:18:53Z = 15:18:53 CET; агент стартовал 14:19:09Z, закончил 14:19:56Z):

```text
Запусти изолированного агента browser-verify через Task/Agent tool, а саму работу роли в основной сессии не делай. Проверь в реальном браузере приложение TASK-001 (React-приложение со списком сессий, деталями и формой создания) по разделу 5 и строкам «BV» таблицы покрытия tasks/TASK-001/implementation-plan.md, а также по requirements.md (версия 3, AC-1…AC-8) и ui-design.md. Код не меняй, коммиты не делай. Приложение открыто и доступно по адресу http://localhost:5173. Порядок работы:
1. Сначала gate: node toolchain/bin/doctor.mjs --json. Статус DEGRADED только из-за hooks:codex (PENDING_ACTIVATION) не блокер, блокер только если не готов capability:browser или конфликтуют хуки или Node не поддерживается. Используй только node toolchain/bin/agent-browser.mjs; никакого Playwright, global agent-browser или других браузерных инструментов. Первая команда адаптера для сессии: open <URL>. 2. Запусти приложение командой npm run dev (мок включается только в dev, README: ?scenario= и VITE_MOCK_SCENARIO; список названий сценариев возьми из src/mocks/scenarios.ts, не выдумывай). Запусти dev-сервер в фоне и по окончании останови именно его; закрой свою сессию адаптера, чужие сессии и браузер пользователя не трогай. Что проверить (viewport 1440×900 и 390×844):
- Список: колонки на 1440, стек строк на 390, без горизонтальной прокрутки и перекрытий; состояния loading, success, empty, no-match, error, network, malformed (сценарии через ?scenario=); фильтры в URL, debounce 300 мс, Back/Forward, «Clear filters» и live-регион после «Clear filters» + «Назад» (M-2), поиск + «Назад» в окне 300 мс (M-3), перезапрос без скачка высоты в empty и no-match (M-4). - Детали: /sessions/:id в нативном dialog, фокус при открытии и возврат при закрытии, Esc (в том числе быстрый двойной), инертность фона, 404 (role=alert, M-5), error с «Try again», формат даты «Monday, Aug 3 at 18:00 (GMT+3)», мобильный формат даты строки списка. - Форма создания: открытие из шапки и из empty, поля, значения по умолчанию, ошибки валидации у полей, связь с подсказками, нативные date/time/number, подтверждение закрытия грязной формы, успех и «Open session», «Create another», «Clear filters» при активных фильтрах, сценарии create-error и coaches-error. - Доступность: клавиатура по всем интерактивным элементам, видимый фокус (в том числе рамка строки списка через :has, M-1), prefers-reduced-motion (эмуляция, если адаптер позволяет), цели касания 44px и шрифт полей 16px на 390, safe-area (viewport-fit=cover). - Контраст: измерь основные пары (текст, приглушённый текст, кнопки, бейджи статусов, фокус) по значениям, которые адаптер реально отдаёт (computed styles), а не по расчёту из ui-design; если измерить нельзя, так и напиши. - Консоль и сеть: ошибки и предупреждения в консоли, запросы (только /api/…, через MSW service worker), отсутствие прямых обращений к бэкенду и «preview». Доказательства: для каждого пункта указывай viewport, URL, команды адаптера и наблюдаемый результат (пример вывода snapshot -i или computed style), а не вывод «проверено». Скриншоты (если адаптер умеет) сохраняй только в tasks/TASK-001/evidence/browser/ с понятными именами. Если что-то не удалось проверить, пиши «не проверено» с причиной. Не заявляй результат, которого не наблюдал. Ограничения: код, документы, конфигурации и зависимости не меняй, ничего не ставь. Найденные дефекты не исправляй, а перечисли с серьёзностью, шагами воспроизведения и ссылкой на AC. В конце: итоговый вердикт PASS, FAIL или BLOCKED, таблица проверок (пункт, viewport, результат, доказательство), список дефектов и список непроверенного с причинами. Запись артефакта сделает разработчик.
```

Ответ: [`evidence/responses/18-browser-verify-blocked.md`](evidence/responses/18-browser-verify-blocked.md) (дословно из SubagentHandback). Вердикт агента: BLOCKED.

Проверка (моя): транскрипт агента в `subagents/` (тип `browser-verify`, Bash 20, Read 2, SubagentHandback 1). Gate агент прошёл так, как требует skill: `node toolchain/bin/doctor.mjs --json` (DEGRADED только из-за `hooks:codex` PENDING_ACTIVATION; `capability:browser` agent-browser@0.32.3 ready, Node 24.20.0, хуки Claude ACTIVE; тот же результат при моём прогоне). Попытка 1: `agent-browser.mjs --session bv-t001 open http://localhost:5173/sessions` внутри песочницы упала с `No usable sandbox!` (Chrome). Попытка 2 (с отключением песочницы, `dangerouslyDisableSandbox`) отклонена механизмом разрешений; агент остановился и `--no-sandbox` не применял. Сессия адаптера не создавалась, скриншотов нет, код и документы не менялись (`git status` на момент проверки: только `workflow-log.md`). Dev-сервер на 5173 уже был запущен до роли; его никто не останавливал.

Диагностика (моя, только чтение): Chrome 157 установлен (`/usr/bin/google-chrome`); `kernel.apparmor_restrict_unprivileged_userns = 1`, `kernel.unprivileged_userns_clone = 1`, `user.max_user_namespaces = 115529`.

Браузерных доказательств по этой попытке нет: ни одно из проверок раздела 5 плана не выполнено, дефектов нет только потому, что проверки не было. Агент заранее заметил по коду (не результат проверки): в `src/mocks/scenarios.ts` шесть сценариев, сценариев `network` и `malformed` в моке нет, их нужно воспроизводить средствами адаптера.

Решение разработчика по разблокировке: _будет записано_.

Коммит после роли: `555e628` (общий коммит записей ролей 18–20, три попытки BLOCKED и найденная причина).

### Роль 19 `/browser-verify` (попытка 2, вариант A: BLOCKED)

Разработчик выбрал вариант A («разрешить запуск адаптера вне песочницы») и попросил повторить. Основная сессия запустила агента с таким заданием (поле `prompt` вызова Agent из транскрипта основной сессии; 2026-11-09T14:25:06Z = 15:25:06 CET; агент 14:25:07Z–14:25:36Z):

```text
Ты — роль browser-verify. Репозиторий: /home/user/Work/Current/accelerator/react-test. Все ответы на русском.

Это повторный запуск. Первый запуск вернул BLOCKED: `open` в песочнице упал с «No usable sandbox!», запрос на запуск вне песочницы был отклонён. Разработчик подтвердил, что Chrome на хосте работает (`google-chrome --headless=new --dump-dom about:blank` отработал), и выбрал вариант: разрешить запуск адаптера вне песочницы. Действуй по правилу skill: сделай `open` в песочнице; если снова упадёт с ошибкой запуска браузера, запроси разрешение на запуск именно этой команды адаптера вне песочницы и повтори один раз. Не используй `--no-sandbox` и другие обходы, не меняй настройки и права. Если разрешение снова не выдано, верни BLOCKED с описанием обеих попыток.

Проверь в реальном браузере приложение TASK-001 (React-приложение со списком сессий, деталями и формой создания) по разделу 5 и строкам «BV» таблицы покрытия tasks/TASK-001/implementation-plan.md, а также по tasks/TASK-001/requirements.md (v3, AC-1…AC-8) и ui-design.md. Код, документы, конфигурации, зависимости не меняй, ничего не ставь, git-коммиты не делай.

Порядок:
1. Gate: node toolchain/bin/doctor.mjs --json. DEGRADED только из-за hooks:codex (PENDING_ACTIVATION) не блокер; блокер только если не готов capability:browser, конфликтуют хуки или Node не поддерживается. Используй только node toolchain/bin/agent-browser.mjs (никакого Playwright, global agent-browser, других браузерных инструментов), не запускай его команду doctor. Первая команда адаптера для сессии: open <URL>, затем set viewport и snapshot -i; везде --session <уникальное имя>.
2. Сервер: приложение доступно по http://localhost:5173 (процесс разработчика). Проверь curl; если отвечает — используй и НЕ останавливай. Если не отвечает — запусти `npm run dev` в фоне (разрешено; мок включается только в dev, README: ?scenario= и VITE_MOCK_SCENARIO; названия сценариев из src/mocks/scenarios.ts: normal, empty, list-error, details-error, coaches-error, create-error — сверь с файлом), используй фактический URL, по окончании останови именно свой процесс. Закрой свою сессию адаптера; чужие сессии и браузер пользователя не трогай.

Что проверить (viewport 1440×900 и 390×844):
- Список: колонки на 1440, стек строк на 390, без горизонтальной прокрутки и перекрытий; состояния loading, success, empty, no-match, error (list-error), network и malformed (в моке таких сценариев нет — воспроизводи средствами адаптера: set offline / network route --abort / --body, если адаптер умеет; иначе «не проверено»); фильтры в URL, debounce 300 мс, Back/Forward, «Clear filters» и live-регион после «Clear filters» + «Назад» (M-2), поиск + «Назад» в окне 300 мс (M-3), перезапрос без скачка высоты в empty и no-match (M-4).
- Детали: /sessions/:id в нативном dialog, фокус при открытии и возврат при закрытии, Esc (в том числе быстрый двойной), инертность фона, 404 (role=alert, M-5), error (details-error, ses_101) с «Try again», формат даты «Monday, Aug 3 at 18:00 (GMT+3)» (пояс — фактический пояс браузера), мобильный формат даты строки списка.
- Форма создания: открытие из шапки и из empty, поля, значения по умолчанию, ошибки валидации у полей, связь с подсказками, нативные date/time/number, подтверждение закрытия грязной формы, успех и «Open session», «Create another», «Clear filters» при активных фильтрах, сценарии create-error и coaches-error.
- Доступность: клавиатура по всем интерактивным элементам, видимый фокус (в том числе рамка строки списка через :has, M-1), prefers-reduced-motion (эмуляция, если адаптер позволяет), цели касания 44px и шрифт полей 16px на 390, safe-area (viewport-fit=cover).
- Контраст: основные пары (текст, приглушённый текст, кнопки, бейджи статусов, фокус) по computed styles, которые реально отдаёт адаптер; если измерить нельзя — напиши.
- Консоль и сеть: ошибки и предупреждения в консоли, page errors, запросы (только /api/…, через MSW service worker), отсутствие прямых обращений к бэкенду, неожиданная навигация.

Доказательства: для каждого пункта — viewport, URL, команды адаптера и наблюдаемый результат (фрагмент snapshot -i или computed style), не «проверено». Скриншоты (если адаптер умеет) сохраняй только в tasks/TASK-001/evidence/browser/ с понятными именами (минимум populated-desktop и populated-mobile); это единственное разрешённое место записи. Что не удалось — «не проверено» с причиной. Не заявляй ненаблюдённого. Дефекты не исправляй: перечисли с серьёзностью, шагами воспроизведения и ссылкой на AC.

В конце: вердикт PASS/FAIL/BLOCKED, таблица проверок (пункт, viewport, результат, доказательство), дефекты, непроверенное с причинами, адрес и владелец сервера, имя закрытой сессии. Запись артефакта сделает разработчик. Затем STOP; следующую роль не запускай.
```

Ответ: [`evidence/responses/19-browser-verify-blocked-2.md`](evidence/responses/19-browser-verify-blocked-2.md) (дословно из SubagentHandback). Вердикт агента: BLOCKED.

Проверка (моя): транскрипт агента в `subagents/` (тип `browser-verify`, Bash 12, SubagentHandback 1). Gate: DEGRADED только из-за `hooks:codex`. Попытка 1 (в песочнице) и попытка 2 (вне песочницы, `dangerouslyDisableSandbox`, на этот раз запуск разрешён) обе закончились `No usable sandbox!`; в тексте ошибки упомянут запрет AppArmor на непривилегированные user namespaces. `close` тоже пытался запустить Chrome. Сессия `bv-task001-r2` не создавалась, `--no-sandbox` не применялся, скриншотов нет, код не менялся.

Диагностика (моя, только чтение): ручной запуск разработчика `google-chrome --headless=new --dump-dom about:blank` отработал, то есть системный Chrome (`/opt/google/chrome/chrome`) исправен. В `/etc/apparmor.d/chrome` есть профиль для `/opt/google/chrome/chrome` с `userns,`. `kernel.apparmor_restrict_unprivileged_userns = 1`. Каталог `~/.agent-browser/browsers` пуст; в системе есть другой Chromium без профиля AppArmor: `~/.codeium/ws-browser/chromium-1155/chrome-linux/chrome`. Адаптер поддерживает `--executable-path` и `AGENT_BROWSER_EXECUTABLE_PATH`. Гипотеза (не проверена): адаптер запускает не профилированный Chrome, поэтому user namespaces для него запрещены.

Решение разработчика: _будет записано_.

Коммит после роли: `555e628` (общий коммит записей ролей 18–20, три попытки BLOCKED и найденная причина).

### Роль 20 `/browser-verify` (попытка 3: BLOCKED)

Запущена не из сессии ролей, а из сессии-помощника по просьбе разработчика («запусти browser-verify ещё раз»); транскрипт агента лежит в `3a138d26…/subagents/agent-a16a9b37fea773b9f.jsonl`. Промпт (поле `prompt` вызова Agent; агент 2026-11-09T14:37:53Z–14:38:19Z = 15:37:53–15:38:19 CET):

```text
Проверь в реальном браузере приложение TASK-001 (React-приложение со списком сессий, деталями и формой создания) по разделу 5 и строкам «BV» таблицы покрытия tasks/TASK-001/implementation-plan.md, а также по tasks/TASK-001/requirements.md (версия 3, AC-1…AC-8) и tasks/TASK-001/ui-design.md. Код, документы, конфигурации и зависимости не меняй, ничего не ставь, коммиты не делай.

Предыстория: две прошлые попытки закончились BLOCKED из-за `No usable sandbox!` при `open`. Причина на хосте: адаптеру нужно использовать системный Chrome с профилем AppArmor. Для этого в `.claude/settings.local.json` задана переменная окружения `AGENT_BROWSER_EXECUTABLE_PATH=/opt/google/chrome/chrome`; в окружении этой сессии она уже присутствует. Не используй `--no-sandbox` и другие обходы защиты. Если `open` снова упадёт, остановись с вердиктом BLOCKED, приведи точный текст ошибки и не пробуй обходы.

Порядок работы:
1. Gate: `node toolchain/bin/doctor.mjs --json`. Статус DEGRADED только из-за hooks:codex (PENDING_ACTIVATION) не блокер; блокер только если не готов capability:browser, конфликтуют хуки или не поддерживается Node. Используй только `node toolchain/bin/agent-browser.mjs`; никакого Playwright, global agent-browser или других браузерных инструментов. Первая команда адаптера для твоей сессии: `open <URL>`. Если первый `open` упадёт в песочнице с ошибкой запуска браузера, запроси одобрение запуска вне песочницы и повтори один раз.
2. Dev-сервер уже запущен разработчиком на http://localhost:5173 (проверено: HTTP 200). Он чужой: не запускай второй и не останавливай этот. Только если он не отвечает, запусти `npm run dev` в фоне и по окончании останови именно свой процесс. Мок MSW работает только в dev; сценарии через `?scenario=` и `VITE_MOCK_SCENARIO`, названия возьми из src/mocks/scenarios.ts (в нём шесть сценариев; сценариев network и malformed в моке нет, их воспроизводи средствами адаптера, например `set offline on` или `network route … --body`). Закрой свою сессию адаптера по окончании; чужие сессии и браузер пользователя не трогай.

Что проверить (viewport 1440×900 и 390×844):
- Список: колонки на 1440, стек строк на 390, без горизонтальной прокрутки и перекрытий; состояния loading, success, empty, no-match, error, network, malformed; фильтры в URL, debounce 300 мс, Back/Forward, «Clear filters» и live-регион после «Clear filters» + «Назад» (M-2), поиск + «Назад» в окне 300 мс (M-3), перезапрос без скачка высоты в empty и no-match (M-4).
- Детали: /sessions/:id в нативном dialog, фокус при открытии и возврат при закрытии, Esc (в том числе быстрый двойной), инертность фона, 404 (role=alert, M-5), error с «Try again», формат даты «Monday, Aug 3 at 18:00 (GMT+3)», мобильный формат даты строки списка.
- Форма создания: открытие из шапки и из empty, поля, значения по умолчанию, ошибки валидации у полей, связь с подсказками, нативные date/time/number, подтверждение закрытия грязной формы, успех и «Open session», «Create another», «Clear filters» при активных фильтрах, сценарии create-error и coaches-error.
- Доступность: клавиатура по всем интерактивным элементам, видимый фокус (в том числе рамка строки списка через :has, M-1), prefers-reduced-motion (эмуляция, если адаптер позволяет), цели касания 44px и шрифт полей 16px на 390, safe-area (viewport-fit=cover).
- Контраст: измерь основные пары (текст, приглушённый текст, кнопки, бейджи статусов, фокус) по значениям, которые адаптер реально отдаёт (computed styles), а не по расчёту из ui-design; если измерить нельзя, так и напиши.
- Консоль и сеть: ошибки и предупреждения в консоли, запросы (только /api/…, через MSW service worker), отсутствие прямых обращений к бэкенду и «preview».

Доказательства: для каждого пункта указывай viewport, URL, команды адаптера и наблюдаемый результат (пример вывода snapshot -i или computed style), а не вывод «проверено». Скриншоты (если адаптер умеет) сохраняй только в tasks/TASK-001/evidence/browser/ с понятными именами; обязательны populated-desktop.png (1440×900) и populated-mobile.png (390×844). Если что-то не удалось проверить, пиши «не проверено» с причиной. Не заявляй результат, которого не наблюдал. Найденные дефекты не исправляй, а перечисли с серьёзностью, шагами воспроизведения и ссылкой на AC.

В конце: итоговый вердикт PASS, FAIL или BLOCKED, таблица проверок (пункт, viewport, результат, доказательство), список дефектов и список непроверенного с причинами. Запись артефакта сделает разработчик.
```

Ответ: [`evidence/responses/20-browser-verify-blocked-3.md`](evidence/responses/20-browser-verify-blocked-3.md) (дословно из SubagentHandback). Вердикт агента: BLOCKED (`open` дважды упал с `No usable sandbox!`, в песочнице и вне её; обходов не применял; сессия адаптера не создавалась, скриншотов нет).

Предшествовало (ручное действие разработчика и ассистента, вне ролей): в `.claude/settings.local.json` добавлено `env.AGENT_BROWSER_EXECUTABLE_PATH=/opt/google/chrome/chrome` (файл в глобальном git-ignore, не коммитится).

Диагностика после попытки (моя, не evidence роли): 1) `/opt/google/chrome/chrome --headless=new --dump-dom about:blank` из шелла сессии отработал (пустой DOM), то же у разработчика через `!`; 2) процессы демона адаптера unconfined, в init-userns, без seccomp, с переменной в окружении: дело не в песочнице Claude Code; 3) `agent-browser.mjs --session diag-probe open about:blank` без флага упал с тем же `No usable sandbox!`; 4) `agent-browser.mjs --session diag-probe2 --executable-path /opt/google/chrome/chrome open about:blank` прошёл (`✓ about:blank`) и был закрыт командой `close` с тем же флагом; `close` без флага пытается запустить Chrome и падает. Вывод: переменная `AGENT_BROWSER_EXECUTABLE_PATH` адаптером фактически не применяется, без явного `--executable-path` он запускает другой Chrome (скорее всего, без профиля AppArmor с `userns`), с флагом работает системный Chrome. Пробные сессии `diag-probe` и `diag-probe2` закрыты, код и документы не менялись.

Решение разработчика: _будет записано_ (рекомендация: передавать `--executable-path /opt/google/chrome/chrome` в каждой команде адаптера, включая `close`, либо зафиксировать путь в конфиге адаптера).

Коммит после роли: `555e628` (общий коммит записей ролей 18–20, три попытки BLOCKED и найденная причина).

### Роль 21 `/browser-verify` (попытка 4: FAIL, 4 minor)

Промпт (дословно из транскрипта основной сессии, `<command-args>` команды `/browser-verify`; отправлен 2026-11-09T14:48:48Z = 15:48:48 CET; агент 14:49:02Z–14:59:36Z):

```text
Запусти изолированного агента browser-verify через Task/Agent tool, а саму работу роли в основной сессии не делай. Проверь в реальном браузере приложение TASK-001 (React-приложение со списком сессий, деталями и формой создания) по разделу 5 и строкам «BV» таблицы покрытия tasks/TASK-001/implementation-plan.md, а также по tasks/TASK-001/requirements.md (версия 3, AC-1…AC-8) и tasks/TASK-001/ui-design.md. Код, документы, конфигурации и зависимости не меняй, ничего не ставь, коммиты не делай. Важно про запуск браузера. Три прошлые попытки закончились BLOCKED с ошибкой `No usable sandbox!`. Причина найдена: адаптер игнорирует переменную AGENT_BROWSER_EXECUTABLE_PATH и без явного флага запускает Chrome без профиля AppArmor. С флагом `--executable-path /opt/google/chrome/chrome` системный Chrome запускается. Поэтому во ВСЕХ командах `node toolchain/bin/agent-browser.mjs` указывай `--executable-path /opt/google/chrome/chrome`, включая первую (`open`) и последнюю (`close`): `close` без флага сам пытается запустить Chrome и падает. Не используй `--no-sandbox` и другие обходы защиты; если запуск с флагом всё же упадёт, остановись с вердиктом BLOCKED и приведи точный текст ошибки. Порядок работы:
1. Gate: `node toolchain/bin/doctor.mjs --json`. DEGRADED только из-за hooks:codex (PENDING_ACTIVATION) не блокер; блокер, если не готов capability:browser, конфликтуют хуки или не поддерживается Node. Используй только `node toolchain/bin/agent-browser.mjs`; никакого Playwright, global agent-browser или других браузерных инструментов. Первая команда адаптера для твоей сессии: `--session <имя> --executable-path /opt/google/chrome/chrome open <URL>`. Если первый запуск упадёт в песочнице с ошибкой запуска браузера, запроси одобрение запуска вне песочницы и повтори один раз. 2. Приложение: на http://localhost:5173 может работать dev-сервер разработчика (проверь curl). Если отвечает, используй его, не запускай второй и не останавливай этот. Если не отвечает, запусти `npm run dev` в фоне и по окончании останови только свой процесс. Мок MSW работает только в dev; сценарии выбираются через `?scenario=` и VITE_MOCK_SCENARIO, названия возьми из src/mocks/scenarios.ts (сценариев network и malformed в моке нет, их воспроизводи средствами адаптера: например `set offline on` или `network route … --body`). Закрой свою сессию адаптера по окончании (с флагом `--executable-path`); чужие сессии и браузер пользователя не трогай. Что проверить (viewport 1440×900 и 390×844):
- Список: колонки на 1440, стек строк на 390, без горизонтальной прокрутки и перекрытий; состояния loading, success, empty, no-match, error, network, malformed; фильтры в URL, debounce 300 мс, Back/Forward, «Clear filters» и live-регион после «Clear filters» + «Назад» (M-2), поиск + «Назад» в окне 300 мс (M-3), перезапрос без скачка высоты в empty и no-match (M-4). - Детали: /sessions/:id в нативном dialog, фокус при открытии и возврат при закрытии, Esc (в том числе быстрый двойной), инертность фона, 404 (role=alert, M-5), error с «Try again», формат даты «Monday, Aug 3 at 18:00 (GMT+3)», мобильный формат даты строки списка.
- Форма создания: открытие из шапки и из empty, поля, значения по умолчанию, ошибки валидации у полей, связь с подсказками, нативные date/time/number, подтверждение закрытия грязной формы, успех и «Open session», «Create another», «Clear filters» при активных фильтрах, сценарии create-error и coaches-error. - Доступность: клавиатура по всем интерактивным элементам, видимый фокус (в том числе рамка строки списка через :has, M-1), prefers-reduced-motion (эмуляция, если адаптер позволяет), цели касания 44px и шрифт полей 16px на 390, safe-area (viewport-fit=cover).
- Контраст: измерь основные пары (текст, приглушённый текст, кнопки, бейджи статусов, фокус) по значениям, которые адаптер реально отдаёт (computed styles), а не по расчёту из ui-design; если измерить нельзя, так и напиши. - Консоль и сеть: ошибки и предупреждения в консоли, запросы (только /api/…, через MSW service worker), отсутствие прямых обращений к бэкенду и «preview». Доказательства: для каждого пункта указывай viewport, URL, команды адаптера и наблюдаемый результат (пример вывода snapshot -i или computed style), а не вывод «проверено». Скриншоты сохраняй только в tasks/TASK-001/evidence/browser/ с понятными именами; обязательны populated-desktop.png (1440×900) и populated-mobile.png (390×844). Если что-то не удалось проверить, пиши «не проверено» с причиной. Не заявляй результат, которого не наблюдал. Найденные дефекты не исправляй, а перечисли с серьёзностью, шагами воспроизведения и ссылкой на AC. В конце: итоговый вердикт PASS, FAIL или BLOCKED, таблица проверок (пункт, viewport, результат, доказательство), список дефектов и список непроверенного с причинами. Запись артефакта сделает разработчик.
```

Ответ: [`evidence/responses/21-browser-verify.md`](evidence/responses/21-browser-verify.md) (дословно из SubagentHandback); артефакт [`evidence/browser-verification.md`](evidence/browser-verification.md) записан мной (у роли нет права записи), скриншоты в [`evidence/browser/`](evidence/browser/) (22 файла, в том числе `populated-desktop.png` и `populated-mobile.png`).

Проверка (моя): транскрипт агента в `subagents/` (тип `browser-verify`, Bash 162, Read 14, SubagentHandback 1). Вызовы адаптера `agent-browser.mjs` все с `--executable-path /opt/google/chrome/chrome` (0 без флага), `--no-sandbox` не встречается, в конце `close` с флагом («Browser closed»). `git status`: изменений в `src`, `index.html`, `package.json` нет; новая папка `evidence/browser/`. Dev-сервер разработчика не трогали. В системе остаются процессы демонов адаптера (старые, от прошлых неудачных попыток и от последней сессии), в логе фиксируется как наблюдение. Сами результаты в браузере мной не перепроверялись.

Вердикт агента: FAIL, критичных и серьёзных дефектов нет; 46 пунктов подтверждено наблюдением, 4 дефекта minor:
- D-1 (AC-3.9, 7.5, ui-design 6.3): при первом открытии формы сразу видна ошибка у Title с `aria-invalid="true"` до ввода и blur; после «Create another» ошибки нет. В коде ошибка показывается только при `touched[key]` или `submitted` (`CreateSessionDialog.tsx:141-143`), то есть расхождение с ожидаемым поведением, причина не установлена.
- D-2 (AC-7.1, ui-design 8): после «Try again» в списке при ошибке фокус уходит на `BODY`.
- D-3 (AC-7.8): граница полей ввода `#D7DEE0` на белом даёт 1.36:1 при требовании 3:1 для нетекстовых элементов. Цвет задан токеном `border` из `DESIGN_TOKENS.md` («Dividers and control boundaries»).
- D-4 (AC-6.3): суффиксы «minutes» и «places» в форме ломаются по буквам (блоки 43×40 и 35×40).

Не дефекты (по усмотрению): `mailto:` в деталях на 390 высотой 19px; расхождение времени старта в списке и деталях на 1–2 минуты (мок «сейчас» при каждом запросе); `document.title` везде «react-test»; второй `replaceState` с тем же URL через ~5.7 с; Back после поиска уходит к предыдущей записи истории (соответствует решению D-1 архитектуры и AC-1.11).

Не проверено агентом: запасной вариант без `:has()` (другого движка нет); озвучка скринридером (проверены роли, текст и порядок в DOM); safe-area на устройстве; сетевой отказ вместо эмуляции `fetch` для `network` и `malformed`; touch и экранная клавиатура, нативные пикеры date и time, повторные отправки при сетевой ошибке POST, Browser Back при открытой форме.

Решения разработчика (2026-11-09): D-1, D-2, D-4 исправить узкой правкой `/coder`; D-3 — вариант А: токен `border` остаётся для разделителей, граница полей ввода берётся из более тёмного цвета той же палитры (3:1 на белом), решение вне буквы ui-design, записать в `final-report.md`; `document.title` сделать осмысленным; остальные «не дефекты» принять как ограничения.

Коммит после роли: `8ff7cb1` (артефакты browser-verify).

### Роль 22 `/coder` (правки D-1…D-4 и `document.title`)

Промпт (дословно из транскрипта основной сессии, `<command-args>` команды `/coder`; отправлен 2026-11-09T15:15:37.394Z; агент 2026-11-09T15:15:48Z–15:17:33Z = 16:15:48–16:17:33 CET):

```text
Запусти изолированного агента coder через Task/Agent tool, а саму работу роли в основной сессии не делай. Исправь дефекты из browser-verify: D-1, D-2, D-3, D-4 и мелкую правку document.title. Опирайся на tasks/TASK-001/evidence/browser-verification.md (дословный ответ агента с шагами и значениями), скриншоты в tasks/TASK-001/evidence/browser/, requirements.md (версия 3), ui-design.md (разделы про форму, фокус и состояния), frontend-accelerator-assessment/designs/DESIGN_TOKENS.md. Правь только то, что нужно для этих находок. Что исправить:
1. D-1 (AC-3.9, 7.5, ui-design 6.3). При первом открытии формы сразу видна ошибка у Title («Enter a title…», aria-invalid="true") до ввода и blur; после «Create another» ошибки нет. По коду (CreateSessionDialog.tsx около строк 98–143) ошибка показывается только при touched[key] или submitted, поэтому причина не очевидна. Сначала найди причину по коду и по сценарию открытия (например, что делает фокус при showModal, автофокус на Title, blur при открытии диалога, состояние с прошлого открытия, порядок эффектов и сброса), и покажи её в отчёте. Реального браузера у тебя нет: не утверждай, что воспроизвёл дефект в браузере, а честно скажи, что установлено чтением кода и что запуском (например, тестом в jsdom). Если причина однозначна, исправь; если вариантов исправления несколько и документы не выбирают, не принимай решение сам: покажи варианты с рекомендацией и остановись. 2. D-2 (AC-7.1, ui-design 8). После «Try again» в списке при ошибке фокус уходит на BODY. Верни фокус в разумное место по ui-design (если документ не определяет, какое именно, например кнопка или заголовок списка, покажи варианты с рекомендацией). 3. D-3 (AC-7.8), решение разработчика — вариант А: токен --border (#D7DEE0, из DESIGN_TOKENS) остаётся для разделителей, панелей и карточек. Для границ полей ввода (input, select, textarea, радио и чекбоксы, если у них есть своя граница) используй более тёмный цвет из той же палитры токенов, дающий не менее 3:1 на белом (например, --text-muted #5F6B6F, уже есть в index.css). Введи для этого отдельную переменную (например --control-border) и не меняй сами значения токенов. Состояния error и focus не ломай. Не заявляй, что контраст проверен в браузере: расчёт можно привести как расчёт по формуле WCAG. 4. D-4 (AC-6.3). Суффиксы «minutes» и «places» в форме ломаются по буквам (блоки 43×40 и 35×40). Поле ввода должно сжиматься, а суффикс не переноситься и не ломаться по буквам; проверь и на 390 по CSS.
5. document.title: вместо «react-test» сделай осмысленное название приложения по документам (если ui-design не задаёт, предложи «Training sessions» и укажи это в отчёте). Не трогай (приняты как ограничения): ссылка mailto: в деталях высотой 19px на 390, расхождение времени старта в списке и деталях на 1–2 минуты (поведение мока), второй replaceState с тем же URL через ~5.7 с, поведение «Назад» после поиска. Новые тесты пиши только если они нужны для подтверждения D-1 или D-2 в jsdom и стабильны (один сценарный тест максимум на дефект, без реальных пауз); существующие тесты меняй только если исправление этого требует и перечисли такие правки. Зависимости не ставь, конфигурации не меняй, документы в tasks/ и workflow-log.md не трогай, коммиты не делай. Правки делай инструментами Edit и Write, а не скриптами через Bash. Запусти npm run lint, npm run build и npm run test и покажи фактический вывод и код выхода. В конце перечисли изменённые файлы и по каждой находке D-1…D-4 и document.title скажи, что сделано, чем подтверждено (запуск, тест или только чтение кода), и что нужно повторно проверить в браузере.
```

Ответ: [`evidence/responses/22-coder-bv-fixes.md`](evidence/responses/22-coder-bv-fixes.md) (дословно из SubagentHandback).

Проверка (моя): транскрипт агента в `subagents/` (тип `coder`, Edit 20, Write 2, Bash 26, Read 4, SubagentHandback 1). Объём: `index.html`, `index.css`, `App.css`, `CreateSessionDialog.tsx`, `SessionsPage.tsx` и новый `focus-and-blur.test.tsx` (+38/−10 без нового теста); конфигов, зависимостей и существующих тестов нет. Поиск запрещённого пуст. Мои запуски: `lint` — 0, `build` — 0, `test` — 0 (12 файлов, 186 тестов, новых 2). Расчёт контраста мной по формуле WCAG: `#5F6B6F` на `#FFFFFF` — 5.50:1, на `#F5F7F8` — 5.12:1, на `#EEF2F3` — 4.88:1 (для границ полей нужно 3:1). Дифф `CreateSessionDialog.tsx` и `SessionsPage.tsx` прочитан: `markTouched` засчитывает blur только при открытом `dialog`; `handleRetry` переносит фокус на `h1` до повтора.

Решения и действия агента: 1) D-1: причина установлена чтением кода (в dev StrictMode прогоняет эффект, cleanup вызывает `dialog.close()`, фокус уходит с Title, `onBlur` ставит `touched`); поведение `close()` в реальном Chrome — предположение, подтверждено только моделью в jsdom (тест подменяет `close`); 2) D-2: ui-design 8 определяет место («остаётся на кнопке или на h1, если кнопка исчезла»), поэтому на согласование агент не останавливался; 3) D-3 (вариант А): добавлена `--control-border: #5f6b6f`, применена к границам поиска, статуса и полей формы, значения токенов не менялись; 4) побочная правка вне задания: селектор ошибки в `.create-form` заменён на `input/select/textarea[aria-invalid="true"]` с повышенной специфичностью, иначе новая граница перебивала красную границу ошибки; 5) D-4: `.input-suffix > span { flex: 0 0 auto; white-space: nowrap; }`; 6) `document.title` = «Training sessions» (название h1 из ui-design 4.1).

Отклонение: строку `--control-border` в `index.css` агент добавил через `python3` из Bash, а не через Edit, хотя промпт требовал Edit/Write; результат проверен по `git diff` (две добавленные строки соответствуют описанию). Агент утверждает, что два новых теста падают без правок и проходят с ними (проверка через `git stash` двух файлов); мной не повторялась.

Нужно повторно проверить в браузере: D-1 (открытие формы из шапки и из empty без ошибки у Title, ошибка после отправки), D-2 (`?scenario=list-error`, «Try again», фокус на `h1`), D-3 (фактический вид границ, красная граница ошибки, контур фокуса, `date` и `time`), D-4 («minutes» и «places» в одну строку на 1440 и 390), заголовок вкладки.

Коммит после роли: `fd58ebf`.

### Роль 23 `/browser-verify` (повтор по D-1…D-4: PASS)

Промпт (дословно из транскрипта основной сессии, `<command-args>` команды `/browser-verify`; отправлен 2026-11-09T15:26:43Z = 16:26:43 CET; агент 15:26:56Z–15:30:51Z):

```text
Запусти изолированного агента browser-verify через Task/Agent tool, а саму работу роли в основной сессии не делай. Это повторная выборочная проверка после правок дефектов D-1…D-4 и document.title (коммит fd58ebf). Исходная проверка и дефекты описаны в tasks/TASK-001/evidence/browser-verification.md (шаги, значения и скриншоты в tasks/TASK-001/evidence/browser/); сделанные правки описаны в tasks/TASK-001/evidence/responses/22-coder-bv-fixes.md. Проверь только затронутые пункты ниже, остальное повторять не нужно. Код, документы, конфигурации и зависимости не меняй, ничего не ставь, коммиты не делай. Запуск браузера: адаптер игнорирует переменную AGENT_BROWSER_EXECUTABLE_PATH, поэтому во ВСЕХ командах `node toolchain/bin/agent-browser.mjs` указывай `--executable-path /opt/google/chrome/chrome`, включая первую (`open`) и последнюю (`close`). Не используй `--no-sandbox` и другие обходы; если запуск с флагом упадёт, остановись с вердиктом BLOCKED и приведи точный текст ошибки. Порядок работы:
1. Gate: `node toolchain/bin/doctor.mjs --json`. DEGRADED только из-за hooks:codex (PENDING_ACTIVATION) не блокер. Используй только `node toolchain/bin/agent-browser.mjs`, никакого Playwright, global agent-browser и других браузерных инструментов. Первая команда адаптера для твоей сессии: `--session <имя> --executable-path /opt/google/chrome/chrome open <URL>`. Если первый запуск упадёт в песочнице с ошибкой запуска браузера, запроси одобрение запуска вне песочницы и повтори один раз. 2. Приложение: проверь curl, отвечает ли http://localhost:5173. Если да, это dev-сервер разработчика: не запускай второй и не останавливай этот. Если нет, запусти `npm run dev` в фоне и по окончании останови только свой процесс. Сценарии мока через `?scenario=`, названия из src/mocks/scenarios.ts. Закрой свою сессию адаптера по окончании; чужие сессии и браузер пользователя не трогай. Что проверить:
- D-1 (AC-3.9, 7.5, ui-design 6.3): на 1440×900 и 390×844 открой форму создания из шапки и из empty (`?scenario=empty`): сразу после открытия у Title нет текста ошибки и нет aria-invalid="true", ошибки у других полей тоже нет; после ввода и ухода с поля (blur) и после попытки отправки ошибка появляется как раньше. Дополнительно: закрой форму и открой снова, проверь «Create another» на экране успеха. - D-2 (AC-7.1, ui-design 8): `?scenario=list-error`, нажми «Try again»: куда уходит фокус (document.activeElement) сразу после нажатия и после появления результата; ожидается h1 («Training sessions» или текст из copy) с видимым контуром фокуса, а не BODY. - D-3 (AC-7.8): для border полей поиска, статуса и всех полей формы (input, select, textarea, date, time, number) измерь computed border-color и посчитай контраст границы к фону страницы и к белому (формула WCAG), ожидается не менее 3:1 (цель #5F6B6F). Проверь, что в состоянии ошибки (aria-invalid) граница красная (danger), а не контрольная серая, что у поля в фокусе виден контур фокуса, и как выглядят date и time поля. Приложи скриншот формы с ошибкой.
- D-4 (AC-6.3): суффиксы «minutes» и «places» в форме на 1440×900 и 390×844 не ломаются по буквам и лежат в одной строке с полем; измерь размеры блоков (getBoundingClientRect) и приложи скриншоты формы. - document.title: на списке, на деталях и на форме заголовок вкладки «Training sessions» (document.title).
- Регрессия: быстрый обход: заполнение формы и успешное создание (один POST), открытие деталей и закрытие по Esc, список в основном сценарии на 1440 и 390 без горизонтальной прокрутки, консоль и страничные ошибки пусты. Доказательства: для каждого пункта указывай viewport, URL, команды адаптера и наблюдаемый результат (значения activeElement, computed styles, размеры), а не вывод «проверено». Скриншоты сохраняй только в tasks/TASK-001/evidence/browser/ с суффиксом `-after` (например create-form-after-desktop.png), прежние файлы не перезаписывай. Если что-то не удалось проверить, пиши «не проверено» с причиной. Не заявляй результат, которого не наблюдал; часть действий через eval допустима, но отмечай, какие. Найденные дефекты не исправляй, а перечисли с серьёзностью, шагами воспроизведения и ссылкой на AC. В конце: итоговый вердикт PASS, FAIL или BLOCKED, таблица проверок (пункт, viewport, результат, доказательство), список дефектов и список непроверенного с причинами. Запись артефакта сделает разработчик.
```

Ответ: [`evidence/responses/23-browser-verify-recheck.md`](evidence/responses/23-browser-verify-recheck.md) (дословно из SubagentHandback); дополнение артефакта: раздел в [`evidence/browser-verification.md`](evidence/browser-verification.md) (записан мной); скриншоты `*-after-*.png` в `evidence/browser/` (6 новых, прежние не перезаписаны; всего 28 файлов).

Проверка (моя): транскрипт агента в `subagents/` (тип `browser-verify`, Bash 60, Read 6, SubagentHandback 1). 54 вызова адаптера, все с `--executable-path /opt/google/chrome/chrome` (0 без флага), `--no-sandbox` не встречается, сессия закрыта `close`. `git status`: изменений в `src`, `index.html`, `package.json` нет. Сами результаты в браузере мной не перепроверялись.

Вердикт агента: PASS по D-1…D-4 и `document.title`, дефектов нет. Подтверждено наблюдением: D-1 (открытие формы из шапки и из empty на 1440 и 390 реальным кликом: ошибок у Title нет, `aria-invalid` ни у одного поля; ошибка появляется после blur и при отправке; после Cancel и «Create another» чисто); D-2 (после «Try again» фокус на `h1`, с клавиатуры `:focus-visible` истинно, контур solid 2px `#1769E0`); D-3 (граница полей `#5F6B6F`: 5.12:1 к фону страницы и 5.50:1 к белому; красная граница ошибки `rgb(180,35,24)` 6.12:1 и 6.57:1; контур фокуса 4.73:1 и 5.08:1); D-4 («minutes» 53.7×20, «places» 41.4×20 на 1440 и 390, прокрутки нет); `document.title` = «Training sessions» на списке, деталях и при открытой форме; регрессия: один POST (201), детали и Esc, консоль чистая.

Замечания агента (не дефекты):
- N-1 (AC-3.9, 7.5): при открытии формы программным `element.click()` через `eval` (без реального фокуса и указателя) ошибка у Title появляется сразу (3 из 3 прогонов на 390); реальные пути чистые во всех прогонах. Агент связывает это с `showModal()` и StrictMode при несфокусированном триггере. Для пользователя, видимо, недостижимо, но в первой проверке дефект наблюдался при реальном клике, поэтому причина до конца не доказана.
- N-2 (AC-7.1, ui-design 8): после «Try again» мышью фокус на `h1`, но `:focus-visible` ложно и контура нет (обычное поведение Chrome для программного фокуса после мыши); с клавиатуры контур виден.

Не проверено агентом: всё из исходного прогона вне перечня повтора; реальный ввод клавишами в сегменты `date` и `time`; контур фокуса у каждого поля формы (измерены Title, Type и `h1`); раскрытые пикеры; production-сборка (всё в dev со StrictMode).

Решения разработчика по N-1 и N-2: _будут записаны_.

Коммит после роли: _будет записан_.

## Ручные действия вне ролей

| Время (CET) | Действие | Зачем |
| --- | --- | --- |
| 09:52:41 | Запись времени старта в `~/Work/assessment-time.txt` | Старт работы (вне проекта) |
| ~09:52–09:53 | `npm create vite@latest . -- --template react-ts --no-interactive`, `NODE_ENV=development npm install` | Чистый Vite-проект; версии: react 19.3.1, typescript 7.0.2, vite 8.3.6 |
| ~09:52–09:53 | `frontend-accelerator install --yes` (178 файлов, 2 файла хуков), `setup --yes` | Установка акселератора по инструкции |
| ~09:52–09:53 | Копирование `frontend-accelerator-assessment/` из `training/` акселератора без изменений; контрольные суммы в `~/Work/assessment-checksums.sha256` | Доказать неизменность входа |
| ~09:52–09:53 | `npm i -D -E msw@2.14.6`, `npx msw init public --save` | Mock-слой |
| 09:53:19 | Стартовый коммит `c2bc6b7` | Точка отсчёта |
| до 10:06 | Запуск `claude` в проекте, принятие доверия к папке, перезапуск | Активация хуков |
| 10:06:09 | `! node ./toolchain/bin/doctor.mjs | tee doctor-output.txt`; затем `--json > doctor-output.json` | Проверка Doctor |
| 10:07:45 | Коммит `7905cf2` с выводом Doctor | Фиксация результата |
| после 10:07 | `git branch --unset-upstream` | Upstream `origin/main` отсутствовал (пуш не требуется) |
| после чекпоинта `6a0019e` (15:49), до `/coder` (S0 из `implementation-plan.md`, раздел 7) | Вручную: `npm i -D vitest @testing-library/react @testing-library/user-event jsdom`; `npm pkg set scripts.test="vitest run"`; правка `vite.config.ts` (импорт `defineConfig` из `vitest/config`, секция `test`: `environment: jsdom`, `setupFiles: ./src/test/setup.ts`). Первая попытка дала ошибку типов TS «'test' does not exist in type 'UserConfigExport'», потому что секция `test` была добавлена при импорте из `vite`; исправлено заменой импорта на `vitest/config`. Версии: vitest 5.1.0, jsdom 31.0.0, @testing-library/react 16.3.3, @testing-library/user-event 14.6.8. После установки `npm run lint` — код 0, `npm run build` — код 0 (шаблонное приложение, проверено ассистентом по просьбе разработчика) | Нет раннера и DOM-окружения (AC-10.4); AC-9.1/9.3 требуют автотестов через HTTP-границу MSW. Компромисс: четыре dev-зависимости, jsdom не вычисляет layout и может неполно реализовывать `<dialog>.showModal()`, без jest-dom утверждения многословнее; в рантайм приложения не попадают (AC-10.8). Редактор переформатировал `vite.config.ts` (двойные кавычки, точки с запятой) — на поведение не влияет. `npm run test` пока не запускался: `src/test/setup.ts` появится на S5. Коммит: `c921fba` (2026-11-06T16:11:05+01:00, «chore: install test stack (vitest, testing-library, jsdom)») |

Примечание: точные минуты для строк с «~» не зафиксированы отдельно; верхняя граница — время коммита `c2bc6b7` (09:53:19), нижняя — старт 09:52:41.

## Отклонения и наблюдения

1. **Роль 1 выполнена в основной сессии, изолированный агент не запускался.** `.claude/commands/requirements-analyst.md` требует вызвать Task tool с `subagent_type: requirements-analyst` и не выполнять работу в обёртке. В транскрипте `6ad9832a-….jsonl` нет вызовов Task/Agent/Skill, нет записей `isSidechain`, нет папки `subagents/`; использованы только Read, Bash и Write основной сессии (у агента requirements-analyst Bash не разрешён). Скилл был загружен в основную сессию («Base directory for this skill: …/.claude/skills/requirements-analyst»). Причина: агент был доступен (в запросе сессии есть список «Available agent types for the Agent tool» с `requirements-analyst`), но модель не вызвала его и выполнила работу сама; это поведение модели, а не ограничение рантайма. Режим разрешений сессии: `auto` (действия «разрешены системой разрешений», а не одобрены разработчиком отдельно). Решение: роль 1 не перезапускается (иначе появился бы TASK-002 и дубль артефактов); в следующие промпты добавляется явное требование запустить изолированного агента через Task/Agent tool; после каждой роли транскрипт проверяется на вызов агента. `/agents` в этой версии Claude Code удалён, проверка через него невозможна.
2. Промпт разработчика отличался по формулировке от готовых промптов из `assessment-prompts.md` (свободная форма, номер задачи не подставлялся, в тексте есть опечатка «мф с тобой»). Записан как отправлен.
3. Агент в ответе упомянул правило ведения лога из памяти ассистента. Файл `workflow-log.md` роль не создавала.
4. Время старта в `assessment-time.txt` записано командой `date` ассистента по ходу подготовки, а не самим разработчиком; разработчик подтвердил использовать его как фактическое.
5. **Роль 2 выполнена изолированным агентом.** В транскрипте основной сессии есть вызов Agent (`subagent_type: architect`, 10:50:45Z), в `subagents/` лежит транскрипт агента (инструменты: Read, Glob, Write, SubagentHandback; Bash не использовался). Агент запускался в фоне и дважды продолжался через SendMessage. В ходе работы агент вернул ошибку «Invalid tool parameters» (спрашивать пользователя напрямую у агента нет возможности, развилки показывала основная сессия). Запуски агента отмечены как «Allowed by auto mode» (разрешено системой разрешений).
6. Основная сессия пересказала агенту задачу своими словами и добавила указание не создавать `architecture.md` до ответов; мой промпт передан не дословно (см. `02-architect-relayed-by-main-session.md`).
7. Расхождение документов: `architecture.md` включает синхронизацию фильтров с URL, а `requirements.md` пока считает её опциональной. Закрывается отдельным запуском `requirements-analyst` по разделу 9 `architecture.md`.
8. Между первым возвратом агента (10:52:20Z) и моими ответами (11:27:27Z) прошло ~35 минут; перерыв это или время на обдумывание, указывает разработчик.

## Пропущенные контекстные роли

Причины пока не записаны: `brainstorm`, `git-worktrees`, `debugger`, `reflect` — решение за разработчиком, причину добавить здесь.
