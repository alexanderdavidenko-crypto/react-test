# Browser verification — TASK-001

Запись сделана разработчиком и ассистентом основной сессии, не агентом: у роли `browser-verify` нет права записи. Ниже дословный ответ агента (из `SubagentHandback`, файл `responses/21-browser-verify.md`). Скриншоты: `evidence/browser/`.

Заметки записавшего (по транскрипту агента и моим проверкам, не из ответа агента):
- Все 6 вызовов адаптера в транскрипте шли с `--executable-path /opt/google/chrome/chrome` (через shell-функцию-обёртку), `--no-sandbox` не применялся.
- Сессия адаптера `bv-t001-1`, закрыта командой `close` с тем же флагом.
- Dev-сервер `http://localhost:5173` принадлежит разработчику, агент его не запускал и не останавливал.
- Часть кликов и чтений стилей агент делал через `eval`; сценарии `network` и `malformed` воспроизведены подменой `window.fetch` в странице (MSW перехватывает запросы раньше, `network route` и `set offline` на них не влияли); это эмуляция, а не сетевой отказ.
- Расчёт контраста выполнен агентом по формуле WCAG из computed styles, отдельного измерительного инструмента нет.

---

## Вердикт: FAIL (дефекты minor, критичных и мажорных нет)

Все сценарии выполнены. Запуск с `--executable-path /opt/google/chrome/chrome` сработал, `No usable sandbox!` не повторилась. `--no-sandbox` и обходы не использовались.

### Контекст
- Gate `node toolchain/bin/doctor.mjs --json`: DEGRADED только из-за `hooks:codex` (PENDING_ACTIVATION). `capability:browser` (agent-browser@0.32.3) PASS, Node 24.20.0 PASS, `hooks:claude` ACTIVE.
- Сервер: http://localhost:5173 уже отвечал 200. Это процесс разработчика, я его не запускал и не останавливал.
- Сессия адаптера: `bv-t001-1`, закрыта (`close --executable-path ...`, «Browser closed»). Чужие сессии не трогал.
- Пояс браузера: Europe/Warsaw, GMT+1 (ноябрь).
- Записал только скриншоты в `/home/user/Work/Current/accelerator/react-test/tasks/TASK-001/evidence/browser/`. Код, конфиги и зависимости не менял, коммитов нет. `git status`: изменён только `tasks/TASK-001/workflow-log.md` (до меня) и новая папка `evidence/browser/`.
- Скриншоты: `populated-desktop.png` (1440×900), `populated-mobile.png` (390×844), а также `details-desktop.png`, `details-mobile.png`, `details-error-desktop.png`, `empty-desktop.png`, `no-match-desktop.png`, `no-match-mobile.png`, `list-error-desktop.png`, `network-error-desktop.png`, `malformed-error-desktop.png`, `create-form-desktop.png`, `create-form-mobile.png`, `create-validation-desktop.png`, `create-discard-confirm-desktop.png`, `create-success-desktop.png`, `create-error-desktop.png`, `coaches-error-desktop.png`, `row-focus-desktop.png`, `empty-create-success-mobile.png`, `long-content-details-mobile.png`, `long-content-list-mobile.png`.
- Команды везде: `node toolchain/bin/agent-browser.mjs --session bv-t001-1 --executable-path /opt/google/chrome/chrome <cmd>`. Использовались `open`, `set viewport`, `snapshot -i`, `click @ref`, `fill`, `select`, `press`, `keyboard type`, `eval`, `network requests`, `console`, `errors`, `set media ... reduced-motion`, `screenshot`, `close`.
- Часть шагов делалась через `eval` (клики, чтение computed styles и DOM). Они обходят реальное нажатие мышью, но событие `click` настоящее.

### Таблица проверок
В колонке «Результат» OK означает наблюдённое соответствие требованию.

| № | Пункт (AC) | Viewport | Результат | Доказательство |
|---|---|---|---|---|
| 1 | Список: колонки, нет горизонтальной прокрутки (1.1, 1.2, 6.1, 6.3) | 1440 | OK | `/sessions`. `scrollWidth=1440=clientWidth`. Пять строк, колонки SESSION/START/COACH/CAPACITY/STATUS (`populated-desktop.png`). Видны название, тип, статус, старт, длительность, тренер, локация, вместимость, записано. |
| 2 | Список: стек строк (6.2, 6.3) | 390 | OK | `scrollWidth=390`. Строка: бейдж слева, «14 / 18» справа, название, «Training · North Court», «Mon, Nov 16 · 19:49 · 90 min», тренер (`populated-mobile.png`). Весь ряд кликабелен: `elementFromPoint` внутри строки даёт `a.session-link`. |
| 3 | Loading | 1440 | OK | Сразу после `open`: `role=status` «Loading sessions…» и 14 `.skeleton-line`. |
| 4 | Success, поиск без учёта регистра (1.3, 4.2) | 1440 | OK | Ввод «MAYA»: `GET /api/sessions?query=MAYA`, 2 строки, live «2 sessions match your filters». |
| 5 | Empty (4.3) | 1440 | OK | `?scenario=empty`: «No sessions yet», текст, кнопка «Create session», live «No sessions yet» (`empty-desktop.png`). |
| 6 | No-match (4.4) | 1440, 390 | OK | «No sessions match your filters», «Nothing found for “MAYA” with status Full…», «Clear filters». Отличается от empty. |
| 7 | list-error и «Try again» (4.5) | 1440 | OK, замечание D-2 | `?scenario=list-error&query=ab&status=full`: `role=alert` «Sessions couldn't be loaded / Your filters are kept…». Поле «ab» и статус сохранены. Повтор шлёт новый GET. |
| 8 | network-ошибка (4.5) | 1440 | OK, эмуляция | `network route --abort` и `set offline on` не помогли: MSW service worker отвечает локально (запрос 200). Подменил `window.fetch` через `eval`: alert «Check your connection and try again.». Не воспроизведено средствами сети, только подменой fetch. |
| 9 | malformed-ответ (4.5) | 1440 | OK, эмуляция | Подмена fetch (200, `{unexpected:true}`): alert «The server sent an unexpected response. Try again in a moment.». |
| 10 | Фильтры в URL, пустые значения (1.9, 1.5, 1.14) | 1440 | OK | Поиск даёт `?foo=bar&query=MAYA`, статус `&status=full`. Постороннее `foo` сохранено и в запрос не уходит (`GET /api/sessions?query=MAYA`). `?status=bogus`: select пустой, в API без `status`. |
| 11 | Reload и deep link с фильтрами (1.10) | 1440 | OK | `/sessions?query=zzz&status=full`: поле «zzz», select Full, запрос с обоими параметрами. |
| 12 | Debounce 300 мс (1.11) | 1440 | OK | Ввод «e», «et», «eth» через 0/200/400 мс: один `replaceState` на 701 мс, то есть ~301 мс после последнего ввода. Через `keyboard type "ma"` одна запись `?query=ma`. |
| 13 | Назад/Вперёд (1.11) | 1440 | OK по дизайну | Фильтры пишутся через `replace` (architecture D-1). Назад уводит к предыдущей записи. Поле, select и список всегда соответствуют URL. Пример: Назад даёт `url=""`, поле пустое, 5 строк, live «5 sessions»; Вперёд возвращает «MAYA»/full и пустой no-match. |
| 14 | «Clear filters» (1.6, 1.13) | 1440 | OK | `?query=zzz&status=full&scenario=normal` даёт `?scenario=normal`, 5 строк, live «Filters cleared. 5 sessions.», фокус на поле поиска. `scenario` сохранён. |
| 15 | M-2: Clear, затем Назад/Вперёд, live | 1440 | OK | Список `?status=full`, строка (push), Esc, «Clear filters». Вперёд даёт `/sessions/ses_102?status=full` с live «1 session matches your filters» (устаревшего «Filters cleared» нет). Назад дал live «5 sessions». |
| 16 | M-3: поиск и «Назад»/«Вперёд» в окне 300 мс | 1440 | OK, эмуляция ввода | На списке `?status=full` программный ввод «ma» (input-событие через `eval`) и `history.forward()` через 50 мс. Через 1.2 с URL остался `/sessions/ses_102?status=full`, `query=ma` не дописан, поле пустое. Ввод был синтетическим, не клавишами. |
| 17 | M-4: перезапрос без скачка высоты | 1440 | OK | Замер по кадрам `requestAnimationFrame`. `main.height=344`, `scrollHeight=900` без изменений через `aria-busy true/false`. Проверено в empty (ввод «x») и в no-match (ввод «y», «q»). |
| 18 | Детали: открытие, фокус, `dialog` (1.8, 2.1, 2.5) | 1440 | OK | Клик по строке даёт `/sessions/ses_102?status=full`, `dialog` `:modal=true`, фокус на `H2 Varsity Defense Intensive`, `aria-labelledby=details-title`, `body overflow:hidden`. Список под диалогом сохранён. Все поля 2.1 присутствуют. |
| 19 | Формат даты деталей | 1440 | OK | «Tuesday, Nov 17 at 17:20 (GMT+1)». Пояс совпадает с поясом браузера Europe/Warsaw. Список: «Nov 17, 17:19» (см. наблюдение N-1). |
| 20 | Мобильный формат даты строки | 390 | OK | «Mon, Nov 16 · 19:49 · 90 min». |
| 21 | Инертность фона и фокус-ловушка | 1440 | OK | 6 Tab: Close×, email, Close, BODY (адресная строка), Close×, email. Фокус вне `dialog` не уходит. |
| 22 | Esc, быстрый двойной Esc, «×», Close, backdrop, Назад/Вперёд (2.3, 2.4) | 1440 | OK | Esc: `/sessions?status=full`, фокус на ссылке строки «Varsity Defense Intensive». Два параллельных Esc: индекс истории и URL те же, что при одном (одна навигация назад). Назад: `/sessions?query=a`, фокус на ссылке. Вперёд снова открывает диалог. Клик по backdrop закрывает. |
| 23 | null-значения (2.2) | 1440 | OK | `ses_103`: «TRAINER NOTES / No trainer notes.», слова «null» нет. Созданная сессия: «No description provided.». |
| 24 | Прямой заход на деталь (2.5) | 1440 | OK | `/sessions/ses_103?query=priv`: диалог с фокусом на H2, список отфильтрован «priv» (1 строка). Esc ведёт на `/sessions?query=priv`, поле «priv». |
| 25 | Отмена в деталях | 1440, 390 | OK | `ses_104`: блок «✕ CANCELLED / Reason: The gym is unavailable. / Cancelled on …». |
| 26 | 404 (4.6, M-5) | 1440 | OK | `/sessions/ses_999?status=full`: `role=alert` «Session not found / It may have been removed…», кнопка «Back to sessions», «Try again» нет. Фокус на H2 «Session details». «Back to sessions» ведёт на `/sessions?status=full`, фокус на `h1`. |
| 27 | details-error ses_101, «Try again» (4.6) | 1440 | OK | `?scenario=details-error`: H2 «Session details», `role=alert` «Session details couldn't be loaded / Try again, or close…», кнопки «Try again», «Close». Фокус на H2. Повтор шлёт ещё один GET `/api/sessions/ses_101` (500). |
| 28 | Детали на мобильном | 390 | OK | Диалог `[0,0,390,844]` (full screen), `scrollWidth=390`, Close× 44×44, Close 71×44. Длинный 80-символьный заголовок, локация и адрес (120 символов) переносятся, без горизонтальной прокрутки (`long-content-*-mobile.png`). |
| 29 | Форма: открытие, значения по умолчанию, фокус | 1440 | OK, замечание D-1 | Из шапки: фокус на Title. Из empty-состояния и после «Create another» открывается так же. По умолчанию Type=training, Visibility=public, остальные пустые. Нативные `type=date`, `type=time`, `type=number` (Duration, Capacity). Radiogroup для Visibility. Подсказки связаны через `aria-describedby`. |
| 30 | Валидация (3.1–3.9) | 1440 | OK | Пустая отправка: 8 ошибок у полей, фокус на Title, live «8 fields need attention», POST нет. У каждого поля `aria-invalid=true` и `aria-describedby` на `*-hint` и `*-error`. Границы: duration 29/241/30.5 ошибка, 30/240 нормально. Capacity 0/101 ошибка, 1/100 нормально. Title `"  ab  "` ошибка, 3 и 80 нормально, 81 ошибка. Location name 1/81 ошибка, 2 нормально. Address 2/121 ошибка, 3 нормально. Notes 500 нормально, 501 ошибка. Прошлая дата: «Choose a date and start time in the future.» |
| 31 | Подтверждение закрытия грязной формы | 1440 | OK | Title заполнен, Esc: «Discard this session? Your entries will be lost.», «Keep editing», «Discard». Диалог не закрылся. Enter на «Keep editing» оставляет значения и возвращает фокус на Title. Чистая форма закрывается Esc, фокус на «Create session». Пункт Discard и backdrop отдельно не нажимал. |
| 32 | Pending, один POST (3.10) | 1440 | OK | Два `click()` подряд: ровно один `POST /api/sessions` 201 и один GET списка. В pending: «Creating session…», `aria-disabled=true`, `aria-busy=true`, «×» и «Cancel» disabled. |
| 33 | Успех, «Open session» (3.12, 3.13) | 1440 | OK | Экран «Session created» (`role=status`), «“BV Evening Drills” is scheduled for Fri, Nov 20 at 10:00.», фокус на H2. «Open session» даёт `/sessions/ses_106`, фокус на H2 деталей. |
| 34 | Активные фильтры и «Clear filters» (3.13) | 1440 | OK | Фильтр `status=cancelled`: подсказка «Filters are active, so the new session may not appear in the list.» и кнопка «Clear filters». Результат: URL `?scenario=normal`, «Filters cleared.» в status. «Create another» даёт чистую форму (фокус на Title). |
| 35 | Empty + POST | 390 | OK | `?scenario=empty&status=bogus`: форма из empty-состояния, создана сессия. Список показывает 1 строку, live «1 session». |
| 36 | create-error (4.8, 3.11) | 1440 | OK | `?scenario=create-error`: `role=alert` «The session couldn't be created. Your entries are kept. Try again.», фокус на блок, значения сохранены, кнопка «Create session» снова активна. |
| 37 | 400 VALIDATION_FAILED | 1440 | OK, эмуляция | Подмена fetch: у Title «! Title already used on server.», `aria-invalid=true`, фокус на Title. Ключ `foo` без поля попал в блок формы («Unknown thing»), значения сохранены. |
| 38 | coaches-error (3.14, 4.7) | 1440 | OK | `role=alert` «Coaches couldn't be loaded.» и «Try loading coaches again». Отправка с остальными валидными полями: «! Select a coach.», фокус на кнопке повтора, POST нет. Повтор (Enter) повторяет 500, фокус остаётся на кнопке. |
| 39 | Клавиатура: список, форма (7.1) | 1440 | OK | Tab: Create session, поиск, статус, ссылки строк. Форма: Title, Type, Date (3 сегмента + пикер), Time (3 + пикер), Duration, Capacity, Coach, Location name, Location address, Visibility (радио), Description, Notes, Cancel. ArrowRight на radio переключает на invite-only. |
| 40 | Видимый фокус и рамка строки, M-1 (7.2) | 1440 | OK | Контролы: outline `solid 2px rgb(23,105,224)` (#1769E0), offset 2px. Строка при фокусе ссылки: `li` outline `solid 2px rgb(23,105,224)`, ссылка подчёркнута, у ссылки `outline:none`. Работает через `:has()` в Chrome (`row-focus-desktop.png`). Запасной вариант вне `:has()` не проверен (D-6). |
| 41 | prefers-reduced-motion (7.9) | 1440 | OK | Без эмуляции: `animation dialog-in/0.15s`. С `set media light reduced-motion`: `animation none/0s`. В CSS есть `@media (prefers-reduced-motion: reduce)` и для `.skeleton-line`. |
| 42 | Цели касания и шрифт, 390 | 390 | OK, с исключением | Create session, поиск, select, «Clear filters» 44px. В форме поля 44px с 16px, textarea 16px. Кнопки Cancel/Create 44px, «×» 44×44. Метки радио Public/Invite only 69×44 и 98×44. Исключение: см. D-4. |
| 43 | Safe-area / viewport-fit | 390 | Частично | `viewport` meta: `width=device-width, initial-scale=1.0, viewport-fit=cover`, `user-scalable` нет. В CSS присутствует правило с `safe-area-inset` в мобильном `@media (max-width:640px)`. Реальное значение inset в десктопном Chrome равно 0, визуально не проверено. |
| 44 | Консоль, page errors, сеть | оба | OK | `errors`: пусто. В буфере консоли записей `error`/`warning` нет, только `debug/info/log` от Vite, React DevTools и MSW (`[mock] scenario: normal (source: default)`). Сеть: только `http://localhost:5173/api/...` плюс модули Vite и `data:` SVG. Прямых обращений к бэкенду нет, «preview» 0. Неожиданной навигации нет. |
| 45 | Мок: все шесть сценариев по URL (5.2) | оба | OK | `normal`, `empty`, `list-error`, `details-error`, `coaches-error`, `create-error` воспроизведены по `?scenario=`. Сценарии network и malformed в моке нет, воспроизведены подменой `fetch`. |
| 46 | Заголовки и семантика (7.3, 7.4) | оба | OK | `h1` «Training sessions», `h2` в диалогах, `h3` секций деталей. `title` страницы «react-test» (см. N-2). |

### Контраст по computed styles (eval, 1440, фон складывался из предков)

| Пара | Результат (отношение) |
|---|---|
| Основной текст `rgb(23,33,36)` на белом | 16.41 |
| Основной текст на фоне страницы `rgb(245,247,248)` | 15.27 |
| Приглушённый текст `rgb(95,107,111)` на белом | 5.50 |
| Заголовки колонок 11/700 на фоне страницы | 5.12 |
| Бейдж Scheduled `rgb(33,122,60)` на `rgb(221,241,228)` | 4.54 |
| Бейдж Full `rgb(154,98,0)` на `rgb(255,240,207)` | 4.52 |
| Бейдж Cancelled `rgb(180,35,24)` на `rgb(251,228,226)` | 5.42 |
| Бейдж Completed `rgb(95,107,111)` на `rgb(238,242,243)` | 4.88 |
| Белый на кнопке primary `rgb(8,127,114)` | 4.90 |
| Цвет фокуса `rgb(23,105,224)` на белом | 5.08 |
| Граница input `rgb(215,222,224)` относительно фона | 1.36 (нетекстовый контраст, см. D-3) |

Текстовые пары проходят AA 4.5:1, scheduled (4.54) и full (4.52) на самой границе. Расчёты ui-design 4.4 подтверждены измерением. Измерение сделал я по формуле WCAG из computed styles, которые отдал адаптер. Отдельного инструмента контраста нет.

### Дефекты

**D-1. Premature validation: поле Title в ошибке сразу при открытии формы.**
- Серьёзность: minor (AC-3.9, AC-7.5, ui-design 6.3).
- Шаги: открыть `/sessions` (1440 или 390), нажать «Create session» в шапке.
- Наблюдение: до любого ввода и blur виден `! Enter a title of 3–80 characters.`, Title имеет `aria-invalid="true"`, `aria-describedby="cs-title-hint cs-title-error"`. Воспроизведено при первом и при повторном открытии из шапки и в `create-form-desktop.png`, `create-form-mobile.png`. После «Create another» ошибки нет (0).
- Ожидаемо: ошибка у поля после blur или отправки. Скринридер при открытии услышит «invalid».

**D-2. После «Try again» в списке фокус теряется на BODY.**
- Серьёзность: minor (AC-7.1, ui-design раздел 8).
- Шаги: `?scenario=list-error`, Tab до «Try again», Enter.
- Наблюдение: `document.activeElement` становится BODY сразу после Enter и остаётся BODY после завершения повтора. Дизайн: остаётся на кнопке либо переходит на `h1`, если кнопка исчезла. Проверено на статичной ошибке; на успешном повторе механика та же (кнопка размонтируется), но успешный повтор в моке не воспроизводим.

**D-3. Граница полей ввода с контрастом 1.36:1.**
- Серьёзность: minor (AC-7.8, нетекстовый контраст WCAG 1.4.11 требует 3:1 для границ контролов).
- Наблюдение: `input` и аналогичные контролы имеют `border-top-color rgb(215,222,224)` на белом (1.36:1). Границы полей и select почти не видны. Подписи и текст внутри в норме.

**D-4. Суффиксы «minutes» и «places» ломаются по буквам в форме.**
- Серьёзность: minor, визуальный (AC-6.3 и общая читаемость).
- Шаги: открыть форму на 1440 и на 390.
- Наблюдение: `#cs-duration-unit` 43×40, `#cs-capacity-unit` 35×40, `white-space: normal`. Текст рендерится как «minut / es» и «place / s» (`create-form-desktop.png`, `create-form-mobile.png`).

**Менее значимое (не дефекты по AC, на усмотрение разработчика):**
- Ссылка `mailto:` в деталях на 390 имеет высоту 19px (цель менее 44px).
- Кнопки Show date picker и Show time picker в нативных полях показали `outlineStyle: none` в computed style. Нативный фокус внутри shadow DOM адаптер не измерил.

### Наблюдения (не дефекты)
- N-1. Время старта в списке и в деталях расходится на минуту-две («Nov 17, 17:19» в списке, «17:20» в деталях; ses_103: 20:49 и 20:51). Причина: мок сдвигает фикстуры на разницу «сейчас» при каждом запросе (AC-5.5), а не на фиксированный момент. На продакшн-данных это не проявится. Статус: в рамках мока, на проверку архитектору.
- N-2. `document.title` на всех экранах «react-test» (AC-7.4 это не требует, но осмысленный заголовок вкладки был бы полезен).
- N-3. Второй `replaceState` с тем же URL около 5.7 с после ввода (запись в моём перехвате). История не растёт, эффект не определён (возможно, повторное чтение/нормализация адреса). Влияния на UI не обнаружено.
- N-4. Назад/Вперёд устроены как «каждое изменение фильтра — replace» (architecture D-1). Кнопка Назад после поиска уходит к предыдущей записи истории, а не к предыдущему значению фильтра. Это соответствует документу, но не «пошаговой» истории фильтров. Требование AC-1.11 («список, поле и select соответствуют URL, поиск не засоряет историю по символу») выполнено.

### Не проверено (причины)
- Запасной вариант рамки фокуса строки без `:has()` (M-1, часть «в движках без `:has()`»): в Chrome `:has()` работает, другой движок недоступен.
- Реальная озвучка live-регионов и `role=alert` (M-5): скринридера нет. Проверено только наличие ролей, текст и порядок в DOM/snapshot.
- Safe-area с ненулевым inset: в десктопном Chrome inset 0. Подтверждено только наличие правила в CSS и `viewport-fit=cover`.
- Реальные сетевые сценарии network и malformed средствами адаптера: `network route --abort` и `set offline on` не влияют на запросы, перехваченные MSW service worker. Заменено подменой `window.fetch` в странице.
- Реальные ввод поиска клавишами в окне 300 мс для M-3: ввод и навигация выполнены программно (синтетическое input-событие и `history.forward()` через 50 мс).
- Экранная клавиатура и нативные пикеры date/time на touch: эмуляции нет (`pointer:coarse` у профиля = false, поэтому поведение «фокус на h2 формы на touch» не проверено).
- Повтор «Try loading coaches again» с успехом, повтор «Try again» списка и деталей с успешным ответом (в моке сценарии статичны, это покрыто автотестами через `server.use`).
- Кнопки «Discard» и «Cancel/×» на грязной форме, закрытие формы после неоднозначной ошибки POST с refetch (сеть/malformed POST в моке не воспроизводится).
- Browser Back при открытой форме (принято в развилке 1=A).
- Нативный фокус кнопок пикеров date/time (вне доступа `getComputedStyle`).

### Адрес и владелец сервера
http://localhost:5173 (Vite dev, MSW в режиме `normal` по умолчанию), процесс разработчика. Я его не запускал и не останавливал.

### Закрытая сессия адаптера
`bv-t001-1` (закрыта командой `close --executable-path /opt/google/chrome/chrome`: «Browser closed»).

### Next Step
Рекомендую вернуть дефекты D-1…D-4 на исправление в `/coder` (все minor). После правок повторить только затронутые проверки: открытие формы без premature-ошибки, фокус после «Try again», контраст границы поля и перенос суффиксов. Запись артефакта сделает разработчик. Следующую роль не запускаю. STOP.


---

# Повторная проверка после правок D-1…D-4 (коммит `fd58ebf`)

Запись сделана разработчиком и ассистентом основной сессии, не агентом (у роли нет права записи). Дословный ответ агента из `SubagentHandback`, файл `responses/23-browser-verify-recheck.md`; новые скриншоты с суффиксом `-after` в `evidence/browser/`. Первая проверка выше не изменена.

Заметки записавшего (по транскрипту агента и моим проверкам):
- Все 54 вызова адаптера в транскрипте шли с `--executable-path /opt/google/chrome/chrome` (0 без флага), `--no-sandbox` не применялся, в конце `close`; dev-сервер разработчика не трогали.
- Действия через `eval` (чтение DOM и computed styles, синтетические клики и `fill`) отмечены самим агентом в отчёте.
- Контраст посчитан агентом по формуле WCAG из измеренных computed-цветов, отдельного измерительного инструмента нет.
- Всё проверено в dev со StrictMode; production-сборку с моком проверить нельзя (мок включается только в dev).

---

## Вердикт: PASS с двумя замечаниями (не дефекты, нужна оценка разработчика)

Затронутые правки D-1, D-2, D-3, D-4 и document.title подтверждены в реальном браузере. Критичных, мажорных и минорных дефектов не найдено.

## Контекст
- Gate `node toolchain/bin/doctor.mjs --json`: DEGRADED только из-за hooks:codex (PENDING_ACTIVATION). capability:browser PASS, hooks:claude ACTIVE.
- Сервер: http://localhost:5173 уже отвечал 200 (curl -I). Это dev-сервер разработчика, я его не запускал и не останавливал.
- Сессия адаптера: `bv-recheck-1`. Все команды шли как `node toolchain/bin/agent-browser.mjs --session bv-recheck-1 --executable-path /opt/google/chrome/chrome <cmd>`, включая `open` и `close`. Запуск браузера прошёл без ошибок, `--no-sandbox` не применялся. Сессия закрыта ("Browser closed").
- Код, документы, конфиги, зависимости, git не менялись. Единственный новый след: 6 скриншотов в `tasks/TASK-001/evidence/browser/` (в `git status` они untracked, прежние файлы не тронуты).
- Действия через `eval` (отмечены): чтение DOM и computed styles, `document.querySelector(...).click()` для кнопки submit, ссылки строки и для проверки на синтетическом клике. `fill` на date/time в формате `2026-12-15` и `09:00` (ввод клавишами через `keyboard type` в сегменты date/time не сработал, значения оставались пустыми). Остальное шло через `click @ref`, `press`, `select`, `fill`.
- Пояс браузера GMT+1.

## Таблица проверок

| Пункт | Viewport | Результат | Доказательство |
|---|---|---|---|
| D-1: открытие из шапки (реальный `click @e3`) | 1440 | OK | `/sessions`, сразу через 1 с: activeElement=`INPUT#cs-title`, `aria-invalid="true"` нет ни у одного поля, элементов `*-error` нет. |
| D-1: открытие из шапки, 3 прогона реальным click, 2 прогона Tab+Enter | 390 | OK | Те же значения во всех прогонах: active=`INPUT#cs-title`, invalid=[], errs=[]. Enter с клавиатуры на 1440 и 390 тоже чисто. |
| D-1: открытие из empty (`?scenario=empty`, вторая кнопка «Create session») | 1440, 390 | OK | active=`INPUT#cs-title`, invalid=[], errs=[]. |
| D-1: blur после Tab с пустого Title | 1440, 390 | OK | active=`SELECT#cs-type`, invalid=[`cs-title`], текст «! Enter a title of 3–80 characters.». |
| D-1: ввод «ab» и уход с поля | 1440 | OK | invalid=[`cs-title`], та же ошибка. |
| D-1: попытка отправки пустой формы | 1440, 390 | OK | invalid: title, date, time, duration, capacity, coach, location-name, location-address (8 полей), у каждого свой текст ошибки; фокус вернулся на `cs-title`. |
| D-1: закрыть (Cancel) и открыть снова | 1440 | OK | После Cancel dialog закрыт, повторное открытие: invalid=[], errs=[]. |
| D-1: «Create another» | 1440, 390 | OK | После успеха: active=`H2#create-title` («Session created»). После «Create another» active=`INPUT#cs-title`, invalid=[], значения полей пустые (`\|training\|...\|public\|invite-only`). Дальше Tab с Title даёт ошибку, как раньше. |
| D-2: «Try again» после `?scenario=list-error` (реальный click) | 1440 | OK по фокусу, см. замечание N-2 | Сразу после клика и после повторного alert: activeElement=`H1 Training sessions`, не BODY. Скриншот `list-error-retry-focus-after-desktop.png`. |
| D-2: «Try again» с клавиатуры (focus на кнопку, `press Enter`) | 1440 | OK | activeElement=`H1`, `:focus-visible`=true, outline `solid 2px rgb(23,105,224)`. Скриншот `list-error-retry-focus-keyboard-after-desktop.png`. |
| D-3: границы полей | 1440, 390 | OK | Фон страницы `html` rgb(245,247,248). Search, status, type, description, notes: border `rgb(95,107,111)` (#5F6B6F) 1px; контраст к фону страницы 5.12:1, к белому 5.50:1 (расчёт по WCAG в node из измеренных цветов). Ошибка: input/select/date/time/number с `aria-invalid="true"` имеют border `rgb(180,35,24)` (danger), а не серый; контраст 6.12:1 к фону, 6.57:1 к белому. Те же значения на 390. Фокус: `outline solid 2px rgb(23,105,224)`, offset 2px, `:focus-visible`=true (title на 1440, type на 390); контраст синего 4.73:1 к фону и 5.08:1 к белому. Радио: нативные, border-width 0. Date и time по виду как остальные поля, с иконкой календаря и часов, красная рамка при ошибке (`create-error-after-desktop.png`, `create-suffix-after-mobile.png`). |
| D-3: скриншот формы с ошибкой | 1440, 390 | OK | `create-error-after-desktop.png`, `create-error-after-mobile.png`. |
| D-4: суффиксы | 1440 | OK | Duration: wrap [417,466,295×40], input 233.3×40, span «minutes» [658,476,53.7×20], white-space nowrap, одна строка (высота span = одна line-height), центры по вертикали совпадают (sameRow=true). Capacity: input 245.6×40, span «places» 41.4×20, одна строка. |
| D-4: суффиксы | 390 | OK | Duration: wrap [16,555,358×44], input 296.3×44, span «minutes» 53.7×20. Capacity: wrap [16,681,358×44], input 308.6×44, span «places» 41.4×20. Одна строка, sameRow=true. Горизонтальной прокрутки нет (documentElement и dialog scrollWidth=390). Скриншот `create-suffix-after-mobile.png`. |
| document.title | 1440, 390 | OK | «Training sessions» на списке `/sessions`, на деталях `/sessions/ses_101` и при открытой форме создания. |
| Регрессия: заполнение и создание (один POST) | 1440 (main), 390 (empty) | OK | 1440: после `network requests --clear` и submit — 1 `POST /api/sessions` (201) и затем GET списка (200); экран «Session created», «Recheck Session» scheduled for Tue, Dec 15 at 09:00. 390: 1 POST, «Mobile Check» scheduled for Wed, Dec 16 at 10:30; скриншот `create-success-after-mobile.png`. |
| Регрессия: детали, Esc | 1440, 390 | OK | Открытие строки: `/sessions/ses_101`, dialog `:modal`=true, фокус на `H2`. Esc: dialog закрыт, на 1440 фокус на ссылке строки (`A`), URL `/sessions`. |
| Регрессия: список без горизонтальной прокрутки | 1440, 390 | OK | scrollWidth=1440=innerWidth, и 390=390; 5 строк. |
| Регрессия: консоль и ошибки | оба | OK, оговорка | `errors`: пусто. В `console` записей уровня error/warn нет, только debug/info/log (Vite, MSW, React DevTools). Оговорка: буфер консоли относится к последним загрузкам страницы сессии, не ко всей сессии. |

## Дефекты
Дефектов нет. Замечания для решения разработчика:

- N-1 (наблюдение, низкая важность; AC-3.9, 7.5): ошибка у Title появляется сразу после открытия формы, если открыть её программным `element.click()` через `eval` без реального фокуса и указателя (3 из 3 прогонов на 390: invalid=[`cs-title`], текст «! Enter a title of 3–80 characters.», active=`INPUT#cs-title`). Реальные пути (настоящий `click @ref`, Tab+Enter) давали чистую форму во всех прогонах на 1440 и 390, поэтому дефектом это не считаю. Возможно, остаточный путь blur при `showModal()` и StrictMode, когда триггер не был сфокусирован. Воспроизведение: `open http://localhost:5173/sessions`, затем `eval "document.querySelector('[data-create-trigger]').click()"`, затем читать `[aria-invalid]` в dialog.
- N-2 (наблюдение, низкая важность; AC-7.1, ui-design 8): фокус после «Try again» стоит на `H1`, но после клика мышью `h1.matches(':focus-visible')`=false и `outline-style: none`, то есть контура на скриншоте нет (`list-error-retry-focus-after-desktop.png`). После активации с клавиатуры контур виден (`:focus-visible`=true, solid 2px #1769e0). Это штатное поведение Chrome для программного фокуса после мыши, но если нужен контур и для мыши, правило `:focus-visible` из `src/index.css` этого не даст. Решение за разработчиком.

## Не проверено
- Шаги исходного прогона вне перечня (поиск, debounce, 404, malformed, network и др.) не перепроверялись, как и было указано.
- Ввод даты и времени клавишами через сегменты (`keyboard type`) не сработал в адаптере; значения задавались через `fill` ("2026-12-15", "09:00"). Реальная клавиатурная работа с date/time не проверена.
- Контуры фокуса у каждого отдельного поля формы не измерялись: проверены title, type (общее правило `:focus-visible`) и h1.
- Вид date/time пикера в раскрытом состоянии не проверялся.
- Проверка в режиме production-сборки не выполнялась: всё в dev-режиме StrictMode.

## Сервер и сессия
- Сервер: http://localhost:5173, владелец разработчик (уже был запущен до проверки), не запускался и не останавливался.
- Закрытая сессия адаптера: `bv-recheck-1`.

## Скриншоты (все в /home/user/Work/Current/accelerator/react-test/tasks/TASK-001/evidence/browser/)
- create-error-after-desktop.png
- create-error-after-mobile.png
- create-suffix-after-mobile.png
- create-success-after-mobile.png
- list-error-retry-focus-after-desktop.png
- list-error-retry-focus-keyboard-after-desktop.png

Скриншот суффиксов на 1440 отдельно не снимался: суффиксы видны на `create-error-after-desktop.png`, размеры измерены через getBoundingClientRect (таблица выше).

## Следующий шаг
Основная рекомендация: записать результат разработчиком в `tasks/TASK-001/evidence/` и перейти к `/review` или фиксации. Альтернатива: если N-1 или N-2 нужно закрыть, вернуться к кодеру. Решение за вами; следующую роль я не запускал. STOP.
