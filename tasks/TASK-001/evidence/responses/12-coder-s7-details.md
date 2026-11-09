## Context Summary
Срез S7 «детали» реализован. Rulesets coder (common/framework) прочитаны. Foundation и S6 использованы как есть, кроме перечисленных ниже минимальных правок. Конфиги, зависимости, документы tasks/ и git не трогал. `npm run lint`, `npm run build`, `npm run test` проходят.

## Созданные файлы (S7)
- `src/features/sessions/useSessionDetails.ts`: AbortController. Статусы idle/loading/success/error/not-found, `retry`. Без `id` запроса нет (idle). Данные другого `id` не показываются: состояние loading выводится по несовпадению ключа результата, без setState в эффекте. `SESSION_NOT_FOUND` даёт `not-found`.
- `src/features/sessions/SessionDetailsDialog.tsx`: нативный `<dialog>`, `showModal`, `aria-labelledby`. Состав по ui-design 5, состояния loading/error/404, фокус и закрытие (подробности ниже).
- `src/features/sessions/CapacitySummary.tsx`: Q-4. «N booked of M place(s)». «K place(s) left» для scheduled. «No places left» для full и для K≤0. Для cancelled/completed строки «left» нет. Полоса `aria-hidden`, ширина ограничена 0–100%, цвет primary/warning/muted.
- `src/features/sessions/session-details.test.tsx`: тест 7b, два теста.

## Правки существующего кода
**S6:**
- `src/features/sessions/SessionRow.tsx`: ссылке добавлен `data-session-id`, он нужен для возврата фокуса. `navigate` теперь передаёт `FROM_LIST_STATE` (раньше литерал `{fromList:true}`). Поведение прежнее.
- `src/features/sessions/SessionsPage.tsx`: у `h1` добавлен `tabIndex={-1}`, это fallback фокуса.
- `src/features/sessions/sessions-list.test.tsx`: хелпер `rowLinks` теперь фильтрует ссылки по `href`, начинающемуся с `/sessions/`. Иначе тест 7a (deep link) падал: в диалоге появилась ссылка mailto, и ссылок стало 3 вместо 2. Это единственная правка проверок S6, ожидания не менялись.
- `src/features/sessions/copy.ts`: добавлены секция `details`, `VISIBILITY_LABELS`, склонения.
- `src/App.css`: стили диалога, полосы вместимости, мобильный полный экран на ширине до 640px, `body:has(dialog[open]) { overflow: hidden }`. Остальные стили S6 не менялись.

**Foundation:**
- `src/shared/router/index.ts`: добавлены `FROM_LIST_STATE`, `cameFromList()` (читает `history.state.fromList`), `goBack()`. Существующий API не менялся.
- `src/app/App.tsx`: маршрут `/sessions/:id`. `SessionsPage` смонтирован всегда, диалог выводится из URL и получает `key={id}`.
- `src/test/setup.ts` не менялся.

## Реализовано
- **Закрытие** всегда идёт через навигацию. Кнопка Close, «×», «Back to sessions» и backdrop (клик по самому `dialog`) вызывают общий `close()`. Esc: перехват `cancel`, `preventDefault`, тот же `close()`. Назад браузера просто меняет URL, и диалог размонтируется.
- **Пришли из списка:** `history.back()`. **Прямой заход или признак утрачен:** `navigate('/sessions' + search, {replace:true})`, то есть query и `scenario` сохраняются (A-11). Защита от двойного закрытия: ref `closing`, иначе двойной клик дал бы два `history.back()`.
- **showModal и URL:** `showModal()` в эффекте при монтировании, `close()` в cleanup.
- **Фокус:** начальный на `h2` с `preventScroll`. При размонтировании возврат на ссылку строки по `id`, иначе на `h1`. После `retry` фокус возвращается на `h2`, если он ушёл на body или dialog.
- **Тексты:** вынесены в `copy.ts`. Даты: `formatDetailsDateTime` для расписания, `formatTimestamp` для Created/Updated/Cancelled. Новых форматов не добавлял.

## Тесты 7b
1. Клик по строке: URL `/sessions/ses_101?query=shooting&scenario=normal`, `role=dialog` с именем и `h2`, список остаётся под диалогом. Закрытие кнопкой «×» возвращает на прежний URL списка.
2. Deep link `/sessions/ses_104?status=cancelled&scenario=normal`: диалог (с блоком Cancelled) поверх списка, отфильтрованного по status. Закрытие Close ведёт на `/sessions?status=cancelled&scenario=normal`.

Risk-тесты (details-error, 404, null) не писал.

## Проверки (фактический вывод)
- `npm run lint`: `oxlint`, предупреждений и ошибок нет, **EXIT=0**.
- `npm run build`: `tsc -b && vite build`, `✓ built in 106ms`, **EXIT=0**.
- `npm run test`: `Test Files 4 passed (4)`, `Tests 18 passed (18)`, **EXIT=0**. Первый прогон дал 1 падение (S6 7a из-за mailto-ссылки), исправлено правкой хелпера, указанной выше.

## Раздел 7 плана: проверено запуском
- Полифила `showModal`/`close` из `setup.ts` **достаточно**. Отдельным пробным тестом (удалён) проверено: закрытый `<dialog>` в jsdom скрыт для `getByRole`. Роли `dialog` и `heading` внутри не находятся без `{hidden:true}`, а с атрибутом `open` находятся. Полифил ставит `open`, поэтому `getByRole('dialog', {name})` работает. Закрытие (`close()` в cleanup) проверено размонтированием: `queryByRole('dialog')` пуст.
- **scenario и редирект:** `/sessions/:id` входит в `KNOWN_ROUTES`, редиректа нет. `?scenario=` в `/sessions/:id?...` сохраняется при открытии и закрытии (оба теста, `scenario=normal`). Мок в браузере читает `window.location.search` до рендера (`src/mocks/browser.ts:7`). Реальный dev-сервер не запускался.

## Проверено запуском и не проверено
- **Проверено (тестами):**
  - AC-1.8: query сохраняется при открытии, возврат на прежний URL (кнопка «×», history back).
  - AC-2.5: deep link поверх отфильтрованного списка.
  - AC-2.4: прямой заход, закрытие ведёт на `/sessions` с query и scenario.
  - AC-2.1: часть полей (имя тренера, заголовок, блок Cancelled).
- **Не проверено, нужен browser-verify:**
  - реальный `showModal`, фокус (`h2`, возврат на строку или `h1`), inert фона, прокрутка в теле;
  - Esc и перехват `cancel`, кнопка Назад браузера, клик по backdrop;
  - сохранение `fromList` при reload и в новой вкладке;
  - мобильный вид (полный экран, safe-area, цели 44px), контраст;
  - loading, error и 404 диалога, `details-error`, null-значения (AC-4.6, AC-2.2, AC-2.3) и склонения.
  Логика для них написана, но без risk-тестов не исполнялась.

## Отклонения и допущения
- Дата расписания по существующему `formatDetailsDateTime`: «Aug 3, 2026, 18:00 GMT+2». Пример из ui-design «Monday, Aug 3 at 18:00 (GMT+3)» (с днём недели) не реализован, чтобы не вводить новый формат. Это UI-вопрос (ниже).
- Метка «Session details» над `h2` реализована обычным текстом, заглавными её делает CSS. В состояниях loading и error текст метки совпадает с `h2`.
- В блоке cancellation строка «Reason» опускается, если `reason` равен `null` или пустой. В документах это не описано.
- `Dialog` в `shared/ui` не выделял: пока единственный потребитель. S8 может вынести общее.
- В диалоге loading используется отдельный `role=status` (скрыт визуально). Одновременно существует `status` списка (`LiveStatus`). Для скринридеров фон inert, но в jsdom-тестах `getByRole('status')` теперь неоднозначен, пока диалог открыт.

## Риски
- Возврат фокуса в cleanup срабатывает и на симулированном размонтировании StrictMode. Сразу после него эффект снова ставит фокус на `h2`, но проверить это можно только в браузере.
- При открытии `showModal` фокусирует первый фокусируемый элемент, потом мы переносим его на `h2`. Возможно кратковременное мигание фокуса.
- Фиксированная ширина `560px` с `min()` и `height: 100dvh` на мобильном — начальные стили, доводка в S9.

## Вопросы пользователю
1. Показывать ли в деталях день недели («Monday, Aug 3 at 18:00 (GMT+3)») по ui-design? Рекомендую добавить небольшой формат в `shared/lib/datetime` или оставить как есть в рамках S9.
2. Нужна ли строка «Reason» при `reason: null` (например, «No reason provided.») или оставить без неё? Рекомендую оставить как сейчас.

## Next Step
Основная рекомендация: `/browser-verify` для S7 по пунктам «не проверено», с матрицей `details-error` и 404. Альтернативы: `/test-generator` для risk-тестов раздела 8 (details-error, 404, null), `/code-reviewer`. Следующую роль не запускал.
