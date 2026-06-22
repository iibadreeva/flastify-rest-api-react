import { test } from 'node:test'
import assert from 'node:assert'
import { build } from '../helper.js'

// Схему импортируем, чтобы в тесте можно было писать в БД напрямую
// (минуя HTTP-маршруты) — например, подготовить связанные данные.
import { courses } from '../../db/schema.js'

// Один общий тест с набором подтестов (t.test), проверяющий весь CRUD users.
// Приложение поднимается один раз; БД in-memory, поэтому состояние сохраняется
// между подтестами в пределах этого test().
test('users routes CRUD', async (t) => {
  const app = await build(t)

  // id пользователя, созданного в первом подтесте, переиспользуется в
  // последующих (update/delete) — поэтому порядок подтестов важен.
  let userId

  await t.test('create user', async () => {
    // POST /users с валидным телом → 201 и созданный объект с id.
    const res = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        fullName: 'Test User',
        email: 'test@example.com'
      }
    })
    assert.strictEqual(res.statusCode, 201)
    const payload = JSON.parse(res.payload)
    // id должен присвоиться автоматически (autoincrement).
    assert.ok(payload.id)
    userId = payload.id
  })

  await t.test('update user', async () => {
    // PATCH /users/:id меняет только переданные поля и возвращает 200 + объект.
    const res = await app.inject({
      method: 'PATCH',
      url: `/users/${userId}`,
      payload: {
        fullName: 'Updated Name'
      }
    })
    assert.strictEqual(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    assert.strictEqual(payload.fullName, 'Updated Name')
  })

  await t.test('delete user', async () => {
    // DELETE /users/:id → 204 No Content (тело пустое).
    const res = await app.inject({
      method: 'DELETE',
      url: `/users/${userId}`
    })
    assert.strictEqual(res.statusCode, 204)
  })

  await t.test('get deleted user returns 404', async () => {
    // После удаления тот же id больше не находится → 404.
    const res = await app.inject({
      url: `/users/${userId}`
    })
    assert.strictEqual(res.statusCode, 404)
  })

  await t.test('delete user with courses cascades (foreign key)', async () => {
    // Проверяем поведение внешних ключей с ON DELETE CASCADE:
    // при удалении пользователя его курсы должны удалиться автоматически.

    // 1. Создаём пользователя через API.
    const userRes = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        fullName: 'Course Creator',
        email: 'creator@example.com'
      }
    })
    const user = JSON.parse(userRes.payload)

    // 2. Создаём курс этого пользователя напрямую в БД и забираем его id
    //    (.returning() возвращает вставленную строку).
    const [course] = await app.db.insert(courses).values({
      name: 'Test Course',
      creatorId: user.id,
      description: 'Test Description'
    }).returning()

    // 3. Удаляем пользователя — благодаря каскаду это должно пройти успешно (204),
    //    а не упасть с ошибкой внешнего ключа.
    const delRes = await app.inject({
      method: 'DELETE',
      url: `/users/${user.id}`
    })
    assert.strictEqual(delRes.statusCode, 204)

    // 4. Курс должен исчезнуть вместе с пользователем (каскад) → 404.
    const courseRes = await app.inject({
      url: `/courses/${course.id}`
    })
    assert.strictEqual(courseRes.statusCode, 404)
  })

  await t.test('update ignores extra (non-schema) fields', async () => {
    // Создаём отдельного пользователя, чтобы тест не зависел от уже удалённых id.
    const createRes = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { fullName: 'Strict User', email: 'strict@example.com' }
    })
    const created = JSON.parse(createRes.payload)

    // Схема тела имеет additionalProperties: false, а Fastify по умолчанию
    // удаляет неописанные поля (removeAdditional). Поэтому лишнее поле просто
    // отбрасывается, а валидное обновление проходит → 200.
    const res = await app.inject({
      method: 'PATCH',
      url: `/users/${created.id}`,
      payload: {
        nonExistentField: 'some value',
        fullName: 'Valid Name'
      }
    })
    assert.strictEqual(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    assert.strictEqual(payload.fullName, 'Valid Name')
    // Лишнее поле не должно сохраниться/вернуться.
    assert.strictEqual(payload.nonExistentField, undefined)
  })
})
