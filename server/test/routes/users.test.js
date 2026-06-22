import { test } from 'node:test'
import assert from 'node:assert'
import { build } from '../helper.js'

import { users, courses } from '../../db/schema.js'

test('users routes CRUD', async (t) => {
  const app = await build(t)

  let userId

  await t.test('create user', async () => {
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
    assert.ok(payload.id)
    userId = payload.id
  })

  await t.test('update user', async () => {
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
    const res = await app.inject({
      method: 'DELETE',
      url: `/users/${userId}`
    })
    assert.strictEqual(res.statusCode, 204)
  })

  await t.test('get deleted user returns 404', async () => {
    const res = await app.inject({
      url: `/users/${userId}`
    })
    assert.strictEqual(res.statusCode, 404)
  })

  await t.test('delete user with courses (foreign key test)', async () => {
    // 1. Создаем пользователя
    const userRes = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        fullName: 'Course Creator',
        email: 'creator@example.com'
      }
    })
    const user = JSON.parse(userRes.payload)

    // 2. Добавляем курс напрямую в БД, так как нет роута POST /courses
    await app.db.insert(courses).values({
      name: 'Test Course',
      creatorId: user.id,
      description: 'Test Description'
    })

    // 3. Пытаемся удалить пользователя
    const delRes = await app.inject({
      method: 'DELETE',
      url: `/users/${user.id}`
    })

    // Если foreign keys включены, это должно упасть или вернуть ошибку, если не обработано
    // Если не включены, удалится успешно (но останется "битая" ссылка в courses)
    assert.strictEqual(delRes.statusCode, 400, `Should return 400 for foreign key constraint, got ${delRes.statusCode}`)
  })
  await t.test('update user with invalid data (extra fields) ignores them', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/users/${userId}`,
      payload: {
        nonExistentField: 'some value',
        fullName: 'Valid Name'
      }
    })
    assert.strictEqual(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    assert.strictEqual(payload.fullName, 'Valid Name')
    assert.strictEqual(payload.nonExistentField, undefined)
  })
})
