### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## создать миграцию:
### `npx drizzle-kit generate`
Если что-то пойдет не так, в нашем случае, ее можно удалить сгенерировать заново.

## OpenAPI:
`Swagger` (точнее OpenAPI) — это формат описания API,
`TypeSpec` — это язык, из которого можно генерировать такие описания.

Нужен ли он тебе? Нет.
- TypeSpec — это spec-first: сначала проектируешь контракт в .tsp, потом генерируешь спеку/типы/клиентов, а реализацию пишешь отдельно.
- Дублирование источника истины. У тебя схемы уже выполняют двойную работу: валидация запросов в рантайме + генерация документации. TypeSpec добавит третий артефакт (.tsp), который придётся синхронизировать с реальными Fastify-схемами вручную — Fastify не читает TypeSpec. Получишь рассинхрон.
- ypeSpec не заменяет рантайм-валидацию. Fastify валидирует по JSON-схемам через ajv. TypeSpec — это генерация на этапе сборки, он не проверяет входящие запросы. То есть схемы в роутах всё равно нужны.
- Размер проекта. TypeSpec оправдан, когда: большой API с множеством команд, нужен design-first процесс (контракт согласуется до реализации), нужна генерация SDK на нескольких языках, или единый источник для нескольких сервисов. У тебя небольшой REST API на Fastify — overhead не окупается.

Когда TypeSpec был бы уместен
- Если бы фронтенд и бэкенд разрабатывались по заранее утверждённому контракту (design-first).
- Если нужно автогенерить типизированные клиенты для frontend/ из одного описания.
- Если API большой и хочется переиспользуемых моделей/паттернов с проверкой консистентности на этапе компиляции.

## Документация API (Swagger / OpenAPI)

Проект использует [`@fastify/swagger`](https://github.com/fastify/fastify-swagger)
для генерации OpenAPI-спеки и [`@fastify/swagger-ui`](https://github.com/fastify/fastify-swagger-ui)
для визуального интерфейса.

### Где смотреть

После запуска (`npm run dev` или `npm start`):

- **Swagger UI:** [http://localhost:3000/documentation](http://localhost:3000/documentation)
- **OpenAPI JSON:** [http://localhost:3000/documentation/json](http://localhost:3000/documentation/json)
- **OpenAPI YAML:** [http://localhost:3000/documentation/yaml](http://localhost:3000/documentation/yaml)

### Как это устроено
Документация строится автоматически из JSON-схем, которые уже описаны в роутах
(`body`, `params`, `querystring`). Дополнительно у каждого маршрута проставлены:

- **`tags`** — группировка в UI (`courses`, `lessons`, `users`);
- **`security: [{ bearerAuth: [] }]`** — у защищённых маршрутов
  (`POST`/`PATCH`/`DELETE`), чтобы в UI появилась иконка замка и кнопка
  «Authorize».

### Авторизация в Swagger UI

Защищённые маршруты требуют JWT (плагин `@fastify/jwt`, заголовок
`Authorization: Bearer <token>`). Чтобы дёргать их прямо из UI:

1. Получите токен (например, через маршрут выдачи токена).
2. Нажмите кнопку **Authorize** в правом верхнем углу Swagger UI.
3. Вставьте токен в поле `bearerAuth` (только сам токен, без слова `Bearer`).
4. Теперь запросы к защищённым маршрутам пойдут с заголовком авторизации.

### Схема безопасности

Схема `bearerAuth` объявлена в `plugins/swagger.js`:

```js
components: {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        },
    },
}
```

Имя `bearerAuth` должно совпадать с тем, что указано в `security` маршрутов.
