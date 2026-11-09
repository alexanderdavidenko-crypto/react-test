# Verification — TASK-001

Запись сделана разработчиком и ассистентом основной сессии, не агентом: у роли `verify` нет права записи. Ниже дословный ответ агента (из `SubagentHandback`, файл `responses/24-verify.md`), проверка на HEAD `4edf487`.

Мои повторные запуски (корень репозитория `/home/user/Work/Current/accelerator/react-test`, после отчёта агента):

| Проверка | Команда | Код выхода | Решающий вывод |
| --- | --- | --- | --- |
| Lint | `npm run lint` | 0 | без замечаний |
| Build | `npm run build` | 0 | сборка успешна |
| Тесты | `npm run test` | 0 | 12 файлов, 186 тестов, все прошли |
| Типы app | `npx tsc -p tsconfig.app.json --noEmit` | 0 | вывода нет |
| Типы node | `npx tsc -p tsconfig.node.json --noEmit` | 0 | вывода нет |
| Задание не изменено | `git diff c2bc6b7 -- frontend-accelerator-assessment \| wc -l` | 0 | 0 строк |
| Запрещённое | поиск `new Date`, `toLocale*`, `Intl.` вне `datetime.ts` и тестов; `fetch(` вне клиента | — | пусто |
| Импорты `src/mocks` | поиск по `src` вне `src/mocks` и `*.test.*` | — | только `src/test/setup.ts` (тестовая инфраструктура, допустимое исключение) |

`git status --short` на момент моей проверки: только ` M tasks/TASK-001/workflow-log.md`.

Не подтверждено этой проверкой: воспроизводимость на чистой установке (`rm -rf node_modules`, `npm ci` по заданию не делались); форматирование (в проекте нет инструмента, NOT-APPLICABLE).

---

## Итоговая проверка TASK-001 на HEAD 4edf487

**Общий вердикт: PASS.** Падений и блокировок нет. Две проверки NOT-APPLICABLE: форматирование и отдельный скрипт типов. Две находки носят информационный характер (см. ниже). Все команды запускались из `/home/user/Work/Current/accelerator/react-test`. Ничего не менялось, не устанавливалось и не коммитилось, файлы не записывались.

### Контекст до проверок
- `git status --short` показал только ` M tasks/TASK-001/workflow-log.md`.
- `git log --oneline -8`: 4edf487, fd58ebf, 8ff7cb1, 555e628, 87f8dda, becc0b8, 26e9c37, 3d98cd5. HEAD совпадает с 4edf487.

### Таблица

| # | Проверка | Команда (cwd = корень репозитория) | Код выхода | Решающий вывод | Вердикт |
|---|---|---|---|---|---|
| 2 | Lint | `npm run lint` (oxlint) | 0 | Вывода от oxlint нет, ни предупреждений, ни ошибок | PASS |
| 3 | Build | `npm run build` (`tsc -b && vite build`) | 0 | 43 модуля, `dist/index.html`, css 10.93 kB, js 265.37 kB, "built in 113ms". После сборки `git status --short` без новых строк. `git check-ignore -v dist` дал `.gitignore:11:dist dist`. | PASS |
| 4 | Тесты | `npm run test` (vitest run) | 0 | Test Files 12 passed (12), Tests 186 passed (186), упавших 0, пропущенных 0. `grep -rnE "\.(skip\|todo)\b\|xit\(\|xdescribe\(" src` ничего не нашёл. | PASS |
| 5a | Типы app | `npx tsc -p tsconfig.app.json --noEmit` | 0 | Вывода нет. В package.json отдельного скрипта типов нет, типы проверяются и внутри `tsc -b` в build. | PASS |
| 5b | Типы node | `npx tsc -p tsconfig.node.json --noEmit` | 0 | Вывода нет | PASS |
| 6 | Форматирование | не запускалось | — | В package.json нет скрипта format, а конфигов prettier, oxfmt или biome в корне нет. Есть только `.oxlintrc.json`, это линтер. | NOT-APPLICABLE |
| 7a | `new Date`, `toLocale*`, `Intl` вне `src/shared/lib/datetime.ts` и тестов | `grep -rnE "new Date\|toLocale\|\bIntl\b" src \| grep -v datetime.ts \| grep -vE "\.(test\|spec)\.tsx?:"` | — | Пусто. Вхождения есть только в тестах: `src/shared/lib/datetime.risk.test.ts:28-31` и `src/test/infrastructure.test.ts:7`. | PASS |
| 7b | `fetch(` вне `src/shared/api/client.ts` | `grep -rn "fetch(" src \| grep -v "^src/shared/api/client.ts" \| grep -vE "\.(test\|spec)\.tsx?:"` | — | Пусто | PASS |
| 7c | Импорты из `src/mocks` вне `main.tsx`, `mocks/` и тестов | `grep -rnE "from ['\"].*mocks\|import\(.*mocks" src \| grep -vE "^src/(main.tsx\|mocks/)" \| grep -vE "\.(test\|spec)\.tsx?:"` | — | Только `src/test/setup.ts:3-5`: импорты `../mocks/handlers.ts`, `../mocks/node.ts`, `../mocks/store.ts`. Это тестовая обвязка vitest в каталоге `src/test/`, а не прикладной код. | PASS с замечанием |
| 7d | http(s) URL в коде | `grep -rnE "https?://" src \| grep -vE "\.(test\|spec)\.tsx?:"` | — | Совпадения только в `src/assets/react.svg` и `src/assets/vite.svg`, и это `xmlns="http://www.w3.org/2000/svg"`. Обращений к бэкенду нет. В тестах URL нет. | PASS |
| 8 | Задание не изменено | `git diff c2bc6b7 -- frontend-accelerator-assessment \| wc -l`, `git ls-files frontend-accelerator-assessment`, `git ls-tree -r --name-only c2bc6b7 frontend-accelerator-assessment`, `diff` двух списков | 0 | Дифф пустой (0 строк). В обоих списках по 17 файлов, `diff` выдал SAME_LIST. `git status --short frontend-accelerator-assessment` пуст. | PASS |
| 9 | Чистота дерева | `git status --short` после всех команд | 0 | Только ` M tasks/TASK-001/workflow-log.md`, неотслеживаемых файлов нет | PASS |
| 10 | Воспроизводимость | `git stash list \| wc -l`, `git status --ignored --short \| head -20` | 0 | Stash пуст (0). Игнорируются: `.claude/settings.local.json`, `.history/`, `dist/`, `node_modules/`. | PASS |
| 1 | Diff после проверок | `git diff --stat HEAD` | 0 | `tasks/TASK-001/workflow-log.md \| 4 ++--`, 1 файл, 2 вставки и 2 удаления. Других отслеживаемых файлов нет. | PASS |

### Замечания, не влияющие на вердикт
- `src/test/setup.ts` импортирует из `src/mocks`. Это не `*.test.ts`, но лежит в каталоге тестовой инфраструктуры. Если правило проекта читается строго как «только `main.tsx`, `mocks/` и файлы `*.test.*`», разработчику стоит явно записать `src/test/` как допустимое исключение.
- vitest предупредил, что jsdom создаётся 12 раз (8.00s суммарно), и предложил оптимизацию. Это подсказка по производительности, а не ошибка.
- `workflow-log.md` изменён относительно HEAD (+2/-2), содержимое диффа я не читал. Это единственное отличие рабочего дерева.

### Пропущенные, неприменимые, заблокированные
- NOT-APPLICABLE: форматирование (в проекте нет prettier, oxfmt или biome, ни скрипта, ни конфига).
- Отдельного скрипта типов в package.json нет. Типы проверены напрямую через `tsc -p ... --noEmit` для обоих tsconfig, что допускалось заданием.
- Пропущено по заданию: установка зависимостей с нуля (`rm -rf node_modules`, `npm ci`) не выполнялась.
- BLOCKED: ничего, все команды выполнились.

### Итоговый scope
- `git status --short`: ` M tasks/TASK-001/workflow-log.md`.
- `git diff --stat HEAD`: только этот файл.
- Сборка и тесты артефактов в отслеживаемые файлы не добавили, `dist/` игнорируется.

STOP. Следующую роль не запускал. Файл `verification.md` остаётся за разработчиком.

---

## Дополнение: проверка в чистом клоне (ассистент основной сессии, не роль `verify`)

Закрывает пробел «воспроизводимость на чистой установке не подтверждена» из ответа агента выше. Клон HEAD `929de29` во временный каталог, рабочее дерево чистое, Node 24.20.0, npm 11.19.0.

| Команда | Код выхода | Решающий вывод |
| --- | --- | --- |
| `git clone` + `git status --short` | 0 | 0 изменённых файлов |
| `npm ci` | 0 | `added 139 packages, audited 140`, 0 vulnerabilities; предупреждение: скрипт `postinstall` `msw@2.14.6` не выполнен (политика скриптов), `public/mockServiceWorker.js` присутствует в репозитории |
| `npm run lint` | 0 | без замечаний |
| `npm run build` | 0 | `built in 117ms`, js 265.37 kB, css 10.93 kB |
| `npm run test` | 0 | 12 файлов, 186 тестов, все прошли |
| `git diff c2bc6b7 -- frontend-accelerator-assessment` | 0 | 0 строк |
