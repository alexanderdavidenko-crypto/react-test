# Agent prompt (2026-11-06T15:21:54.041Z)

Ты роль code-reviewer. Работай по своему skill (.claude/skills/code-reviewer/SKILL.md), загрузи rulesets code-reviewer (common/framework/project) если есть. Ответ на русском.

ПОВЕРХНОСТЬ РЕВЬЮ (только она): диапазон коммитов c921fba..a53becc (git diff c921fba..a53becc; git log c921fba..a53becc). Это коммит "feat: foundation (datetime, api client, router, msw mocks, test infra)": src/shared/lib/datetime.ts, src/shared/api/{types,errors,mappers,client}.ts, src/shared/router/index.ts, src/mocks/{clock,store,handlers,scenarios,browser,node}.ts, src/test/{setup,constants,render,infrastructure.test}.ts(x), правка src/main.tsx. Файлы в tasks/ в диапазоне это артефакты процесса, их содержимое по существу не ревьюй. Весь репозиторий НЕ ревьюй; читай окружающий код только в минимально нужном объёме.

ОПОРА: tasks/TASK-001/implementation-plan.md (шаги S1-S5), requirements.md (v3), architecture.md, api-integration.md (особенно раздел 4 разбор ответов, раздел про моки и сценарии), ui-design.md только если нужно, frontend-accelerator-assessment/API_CONTRACT.md, MOCKING_GUIDE.md, fixtures/ (json).

ОСОБОЕ ВНИМАНИЕ:
- соответствие клиента контракту и разбору ответов (api-integration раздел 4);
- корректность отмены запросов и результата отмены ({ok:false,cancelled:true}); отсутствие signal у createSession (решение 10=A);
- хрупкость строгих мапперов (неизвестный enum = malformed, даты, null-поля, лишние поля);
- поведение мока по шести сценариям (normal, empty, list-error, details-error, coaches-error, create-error), статичность ошибок, тексты из mock-scenarios.json, details-error только для ses_101;
- выбор сценария ?scenario= затем VITE_MOCK_SCENARIO затем normal, невалидное имя -> warn и откат;
- сдвиг дат по fixture clock (все timestampFields, включая cancellation.cancelledAt, вложенность);
- правила работы с датами (только через shared/lib/datetime; прямые new Date/toLocale* вне него), несуществующее локальное время (DST), невалидные даты;
- слой роутера: сохранение чужих параметров (в т.ч. scenario), replace/push, редирект неизвестного пути с сохранением search, подписка и утечки слушателей;
- мок и фикстуры не попадают в прод-бандл (import.meta.env.DEV, динамический import), ожидание готовности worker до рендера, bypass ассетов;
- надёжность тестовой инфраструктуры: подмена только Date, полифил showModal, сброс store, перехват msw/node, onUnhandledRequest;
- отсутствие прямого импорта фикстур в код приложения вне src/mocks; отсутствие бэкенда; соблюдение tsconfig (erasableSyntaxOnly, verbatimModuleSyntax, noUnusedLocals).
Также оцени: stateful create (id, порядок, trim, null для пустых), серверная валидация мока vs клиентские правила, 400 INVALID_FILTER, поиск по location.name+address, meta.total.

ОГРАНИЧЕНИЯ: ты read-only. Ничего не правь: ни код, ни тесты, ни документы, ни конфиги. Команды только разрешённые роли (git diff*, git log*), всё остальное (запуск тестов, lint, build, браузер) помечай как НЕПРОВЕРЕНО. Следующую роль не запускай.

ФОРМАТ ОТЧЁТА: (1) находки по убыванию серьёзности (blocking / should-fix / nit); у каждой точная ссылка file:line, суть дефекта и КОНКРЕТНЫЙ сценарий сбоя (входные данные/состояние -> неверный результат); различай нарушение правил репозитория/требований/плана и личные предпочтения; не придумывай находки без доказательства; (2) отдельно: что проверено и соответствует; (3) вердикт PASS или NEEDS-CHANGES; (4) что не проверено запуском; (5) рекомендуемая ограниченная роль для доработки (без запуска). STOP.
