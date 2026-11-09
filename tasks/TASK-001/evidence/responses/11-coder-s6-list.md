### Context Summary
Срез S6 «список и фильтры» реализован поверх foundation S1-S5 (foundation не менял). Загружены rulesets coder (common и framework; project пуст). Проверки lint, build, test зелёные. Браузер и dev-сервер не запускались. Шаблонный демо-код App заменён, git add и коммитов нет.

### Изменённые и созданные файлы
Пути от `/home/user/Work/Current/accelerator/react-test/`.
- Создано: `src/app/App.tsx`
  - маршруты `/sessions` и `/sessions/:id`;
  - `useRedirectUnknown` с replace на `/sessions` и сохранением search;
  - пока путь неизвестен, рендерится null;
  - на `/sessions/:id` в S6 показывается список без диалога;
  - импортирует `../App.css`.
- Создано в `src/features/sessions/`: `filters.ts`, `copy.ts`, `useSessions.ts`, `SessionsPage.tsx`, `SessionRow.tsx`, `StatusBadge.tsx`, `LiveStatus.tsx`.
- Создан тест `src/features/sessions/sessions-list.test.tsx`.
- Изменено: `src/index.css` (токены, `.visually-hidden`, фокус) и `src/App.css` (раскладка списка). Шаблонные стили заменены.
- Изменено: `src/main.tsx`. Правка одна: путь импорта на `./app/App.tsx`. try/catch вокруг мока и динамический import под DEV сохранены.
- Удалён `src/App.tsx` (шаблон). Он перенесён в `src/app/App.tsx`: по плану `App` живёт в `app/`. Один раз выполнил `git mv`, который застейджил переименование, и сразу откатил `git reset -q -- src/App.tsx src/app/App.tsx`. Индекс чист, вся работа остаётся unstaged.
- Assets, конфиги, документы в `tasks/` не тронуты. Изменения `review.md` и `workflow-log.md` в `git status` были до моей работы.

### Что реализовано
- **Фильтры в URL.**
  - Из URL читаются `query` (после trim) и `status`. Невалидный status даёт «все» и на сервер не уходит. Пробельный query тоже не уходит.
  - Запись и сброс трогают только `query` и `status`. `scenario` и посторонние параметры сохраняются.
  - Поле поиска держит локальное значение, в URL оно пишется через `replace` с debounce 300 мс (константа `SEARCH_DEBOUNCE_MS`).
  - Статус пишется через `replace` сразу. Во внутренней навигации `history.state` сохраняется.
  - Внешние изменения URL (Назад, сброс) синхронизируются в поле во время рендера.
- **Clear filters.** Видна только при активных фильтрах. Очищает только `query` и `status`, отменяет отложенный debounce и переносит фокус на поле поиска до исчезновения кнопки. Кнопка есть и в панели, и в состоянии no-match.
- **`useSessions`.**
  - Возвращает idle/loading/success/error, `data`, `error`, `isRefreshing`, `retry`, принимает `reloadKey` для S8.
  - Запрос идёт через AbortController. Устаревшие ответы и `cancelled` игнорируются.
  - Состояние loading выводится при рендере по ключу запроса, setState в эффекте нет. Первая версия с setState в эффекте дала предупреждение oxlint `set-state-in-effect`, я её переписал.
  - При смене фильтров прежние данные остаются (приглушены, `aria-busy`). Первичная загрузка и retry после ошибки показывают скелетон из 5 строк.
- **Состояния списка.**
  - loading (скелетон 5 строк плюс live «Loading sessions…»).
  - populated: счётчик «N session(s)» и строки с полями AC-1.2: title, type, location, дата начала через `shared/lib/datetime`, длительность, coach, `booked / capacity`, StatusBadge. Скрытые подписи для скринридера есть, в том числе «Capacity: 14 of 18».
  - empty: «No sessions yet» и кнопка Create session (без обработчика).
  - no-match: отдельное сообщение, три варианта текста (по query, по статусу, по обоим) и Clear filters.
  - list-error: `role=alert`, три текста по виду ошибки, Try again; фильтры сохраняются.
  - Empty и no-match различаются по наличию активных фильтров.
- **Строка.**
  - `ul/li` на CSS grid.
  - Ссылка `<a href="/sessions/{id}{search}">` с растянутой областью клика.
  - Обычный левый клик идёт через `navigate` с `state {fromList: true}`; модификаторы и средняя кнопка остаются браузеру.
  - На ширине до 720px строка превращается в стек, заголовки колонок скрыты.
- **StatusBadge.** Иконка (SVG, `aria-hidden`) плюс видимый текст.
- **LiveStatus.** Постоянный `role="status"`. Сообщения: loading, «N sessions», «N sessions match your filters», empty/no-match, «Filters cleared. N sessions.».
- **Не делал.** Диалог деталей, форму создания, CapacitySummary, README. Кнопка Create session пока без обработчика (в `SessionsPage` есть необязательный проп `onCreateSession` для S8).

### Тесты (`sessions-list.test.tsx`, 7 тестов, через `renderAt(<App />, url)`, msw/node, Date заморожен)
1. Загрузка и список. Live «Loading sessions…», потом пять строк со всеми полями AC-1.2, href `/sessions/ses_101`, текст бейджей Scheduled/Full/Cancelled/Completed.
2. Поиск и статус. Реальные запросы пойманы через `server.events` `request:start`.
   - `query=shooting`, затем `status=full`.
   - Нет запроса на каждую букву, `history.length` не растёт.
   - Список сужается, Clear filters возвращает 5 строк.
   - URL после сброса `?scenario=demo`, `scenario` ни в одном запросе, фокус на поле поиска.
3. Empty (`resetStore({empty:true})`) и no-match (`?query=zzzz`) с разными сообщениями; после Clear список возвращается. Отдельный тест на текст для статуса и query вместе.
4. list-error через `server.use` (500 `SESSIONS_UNAVAILABLE`). Alert, фильтры в поле и URL сохранены. Восстановление: второй `server.use`, клик Try again, список виден.
5. Тест 7a, три теста.
   - Восстановление `query`, `status` и посторонних параметров из URL, запрос ровно с `query` и `status`.
   - Невалидный status и пробельный query дают запрос без параметров.
   - Редирект неизвестного пути с сохранением search; `/sessions/ses_101` показывает список.

Непроверенное из раздела 7 плана, результат запуска:
- debounce с `userEvent` и реальными таймерами при подмене только Date работает стабильно (`toFake: ["Date"]` из foundation). Три прогона подряд зелёные. Другая стратегия таймеров не потребовалась.
- Полифил `showModal` в S6 не задействован.
- Остальное из раздела 7 (JSON вне `src/` под tsc, состав `dist`, `VITE_MOCK_SCENARIO`, порядок `?scenario=` и редиректа) в S6 не проверялось.

### Результаты проверок (фактические)
- `npm run lint`: предупреждений и ошибок нет, **код выхода 0** (при первой версии хука было предупреждение `react(set-state-in-effect)`, устранено переписыванием кода).
- `npm run build` (`tsc -b && vite build`): `✓ 31 modules transformed`, `✓ built in 105ms`, **код выхода 0**.
- `npm run test`: `Test Files 3 passed (3)`, `Tests 16 passed (16)` (9 существующих плюс 7 новых), **код выхода 0**; три подряд прогона зелёные, флаков нет.

### Критерии S6
Проверено запуском (jsdom, по ролям и тексту):
- AC-1.1, 1.2 (все поля строки).
- AC-1.3-1.6 (запросы с параметрами, сужение списка, no-match).
- AC-1.7 (текст бейджа; иконка `aria-hidden` по коду).
- AC-1.9 (пустой и пробельный query не создают значения).
- AC-1.10, 1.12 (восстановление из URL, поле и select отражают значения).
- AC-1.13, 1.14 (сброс, `scenario` сохраняется).
- AC-1.11 частично: replace, нет записи на символ, `history.length` не растёт; Назад/Вперёд не проверялись.
- AC-4.1, 4.2, 4.3, 4.4, 4.5.
- Live-регионы по роли.
- Редирект неизвестного пути с сохранением search.

Не проверено (нужен browser-verify или другая роль):
- Реальный фокус на поле поиска после Clear (в jsdom проверен `document.activeElement`, в браузере нет).
- Адаптив на 1440×900 и 390×844, отсутствие горизонтальной прокрутки, длинные названия, раскладка стека (CSS не проверялся).
- Контраст бейджей, видимость фокуса, цели 44px, шрифт 16px, `prefers-reduced-motion`.
- Озвучка live-регионов.
- Работа в `npm run dev` с реальным service worker и задержкой 250 мс.
- Назад/Вперёд и reload.
- AC-1.8 (диалог) относится к S7.

### Отклонения от плана
- Мобильный формат даты в строке: в S6 используется общий `formatListDateTime`, а не «Mon, Aug 3 · 18:00 · 90 min» из ui-design 4.3. Для него нужен дополнительный формат в `datetime`, оставлено на S9.
- Заголовки колонок «Session / Start / Coach / Capacity / Status» (`aria-hidden`) в `copy.ts` не вынесены. Это мелкое нарушение решения 3=B.
- Тест 3 использует `resetStore({empty:true})` вместо `server.use`.
- Тест 4: восстановление сделано вторым `server.use`.
- Общего хука `useSessions` с состоянием `idle` на практике нет: начальное состояние loading, `idle` оставлен в типе контракта.
- Скелетон имеет упрощённую форму (одна полоса на строку).

### Оставшиеся риски и найденное
- В foundation дефектов не найдено.
- Видимый счётчик «N sessions» и live-регион дублируют текст. В тестах счётчик ищется по `selector: "p"`. Для скринридера озвучка идёт один раз (счётчик не live).
- Фокус `Create session` в пустом состоянии и шапке: две кнопки с одинаковым именем (по ui-design так задумано).
- Мобильные стили начальные, возможны мелкие проблемы вёрстки до S9.
- Тест 2 завязан на порядок параметров в URL (`?scenario=demo&query=shooting`), он определяется `URLSearchParams` в `updateSearch`.

### Вопросы пользователю
Блокирующих нет. Одно решение отложено, нужно ли выносить заголовки колонок и мобильный формат даты сейчас (S6) или в S9; я оставил на S9.

### Next Step
Основная рекомендация: `/code-reviewer` для среза S6. Альтернативы: `/browser-verify` (фокус после Clear, адаптив 1440/390, контраст, `npm run dev`) или сразу `/coder` для S7 (детали) либо S8 (создание). Запускает пользователь, роли я не запускал.
