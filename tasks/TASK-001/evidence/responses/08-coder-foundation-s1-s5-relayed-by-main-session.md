# Agent prompt (2026-11-06T15:12:56.958Z)

Ты роль coder для TASK-001. Работай по своему skill (.claude/skills/coder/SKILL.md), загрузи rulesets coder (common/framework/project) и следуй им. Ответ на русском.

ЗАДАЧА: реализовать ТОЛЬКО шаги S1-S5 из tasks/TASK-001/implementation-plan.md:
- S1 src/shared/lib/datetime
- S2 src/shared/api (types, errors, mappers, client)
- S3 src/shared/router
- S4 src/mocks (clock, store, handlers, scenarios, browser, node) и подключение мока в dev через src/main.tsx (динамический import под import.meta.env.DEV, ожидание готовности worker до рендера)
- S5 src/test/setup.ts и src/test/render.tsx + ровно один минимальный инфраструктурный тест: раннер находит тесты, msw/node перехватывает /api, store сбрасывается между тестами, время заморожено.
Срезы S6-S9 (список, детали, форма, адаптив, README) НЕ делай. Приложение может оставаться шаблонным Vite (App.tsx, стили не трогай).

ВХОДЫ: прочитай tasks/TASK-001/implementation-plan.md (основной), requirements.md (v3), architecture.md, api-integration.md, ui-design.md (только там, где план ссылается), frontend-accelerator-assessment/API_CONTRACT.md, MOCKING_GUIDE.md, fixtures/ (json), package.json, vite.config.ts, tsconfig*.json, src/, public/.

ЖЁСТКИЕ ПРАВИЛА:
- Фикстуры не импортируй в код приложения (src/shared, src/features, src/app). Импорт JSON допустим ТОЛЬКО внутри src/mocks. Бэкенд не пиши. Контракт не меняй, эндпоинты не выдумывай.
- Зависимости НЕ ставь (vitest, @testing-library/react, @testing-library/user-event, jsdom уже поставлены пользователем вручную; проверь по package.json и node_modules; msw 2.14.6 уже есть). Конфигурационные файлы (package.json, vite.config.ts, tsconfig*.json, .oxlintrc.json) НЕ меняй без согласования. Если для работы нужна правка конфига (например, секция test в vite.config.ts, скрипт test в package.json, resolveJsonModule/types в tsconfig), сначала проверь, не внёс ли её пользователь уже. Если не внесена и без неё нельзя продолжить, ОСТАНОВИСЬ, ничего не меняй в конфиге и верни пользователю варианты с последствиями и рекомендацией. Спорные решения сам не принимай.
- Документы в tasks/ и workflow-log.md НЕ трогай. specs/ не создавай. git-коммиты НЕ делай, git add не делай.
- Не пиши тесты поведения S6-S8 и risk-тесты из раздела 8 плана.
- Реализуй строго по решениям архитектуры/API: результат клиента {ok:true,data}|{ok:false,error} с ApiError/NetworkError/ResponseShapeError и отдельным признаком отмены; строгая проверка формы и неизвестный enum = malformed; startsAt без миллисекунд, входящие даты с миллисекундами и без принимаются; создание не отменяется, GET отменяются; выбор сценария ?scenario= затем VITE_MOCK_SCENARIO затем normal, шесть обязательных имён, неверное имя -> console.warn и откат; мок только в dev; empty = стартовое состояние хранилища, POST добавляет, create-error любой POST -> 500; новые сессии в конец списка, без усечения; fixture clock сдвиг только в mocks; unhandled request -> error в браузерном моке с bypass для ассетов; erasableSyntaxOnly (без enum и parameter properties), verbatimModuleSyntax, noUnusedLocals.
- Непроверенное из раздела 7 плана ПРОВЕРЯЙ ЗАПУСКОМ и записывай честный результат в отчёт: resolveJsonModule/импорт JSON вне src под текущим tsc, поведение showModal в jsdom, фейковые таймеры с MSW (рекомендуется подменять только Date), состав dist после npm run build (попал ли мок-код и фикстуры в прод-бандл), подхват VITE_MOCK_SCENARIO, порядок чтения scenario. Если проверка требует запуска dev-сервера, запусти и обязательно останови только то, что сам запустил. Что невозможно проверить, помечай как непроверенное.

ПРОВЕРКИ: в конце запусти npm run lint, npm run build, npm run test (скрипт test может отсутствовать: тогда не придумывай, а сообщи и покажи, какой минимум нужен). Покажи ФАКТИЧЕСКИЙ вывод (ключевые строки) и КОД ВЫХОДА каждой команды. Если команда падает, не подгоняй проверки, объясни причину; чини только свой код.

ОТЧЁТ: изменённые/созданные файлы, что реализовано по шагам S1-S5, тесты, результаты проверок с кодами выхода, результаты проверок непроверенного (раздел 7), оставшиеся риски, неразрешённые вопросы к пользователю, расхождения плана с реальностью. STOP после выполнения или при блокирующем вопросе. Следующую роль не запускай.
