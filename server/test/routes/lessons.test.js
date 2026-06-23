import { test } from 'node:test'
import assert from 'node:assert'
import { build } from '../helper.js'

// Тесты маршрутов уроков (на чтение). Аналогичны тестам курсов.
test('lessons routes', async (t) => {
  const app = await build(t)

  await t.test('get all lessons', async () => {
    // GET /lessons → 200, объект { data, meta }.
    const res = await app.inject({
      url: '/lessons'
    })
    assert.strictEqual(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    assert.ok(Array.isArray(payload.data))
    // Метаданные пагинации: текущая страница, размер страницы, всего элементов.
    assert.strictEqual(payload.meta.page, 1)
    assert.strictEqual(typeof payload.meta.perPage, 'number')
    assert.strictEqual(typeof payload.meta.total, 'number')
  })

  await t.test('get lesson by id', async () => {
    // Берём существующий id из списка, чтобы не зависеть от случайных сидов.
    const allLessonsRes = await app.inject({
      url: '/lessons'
    })
    const allLessons = JSON.parse(allLessonsRes.payload).data

    if (allLessons.length > 0) {
      const lessonId = allLessons[0].id
      const res = await app.inject({
        url: `/lessons/${lessonId}`
      })
      assert.strictEqual(res.statusCode, 200)
      const payload = JSON.parse(res.payload)
      // Должен вернуться именно запрошенный урок.
      assert.strictEqual(payload.id, lessonId)
    }
  })

  await t.test('get non-existent lesson', async () => {
    // Несуществующий id → 404.
    const res = await app.inject({
      url: '/lessons/999999'
    })
    assert.strictEqual(res.statusCode, 404)
  })
})
