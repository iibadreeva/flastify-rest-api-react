import { test } from 'node:test'
import assert from 'node:assert'
import { build } from '../helper.js'

// Тесты маршрутов курсов (на чтение). Приложение поднимается один раз,
// БД in-memory заполнена сидами при старте.
test('courses routes', async (t) => {
  const app = await build(t)

  await t.test('get all courses', async () => {
    // GET /courses → 200, объект { data, meta }.
    const res = await app.inject({
      url: '/courses'
    })
    assert.strictEqual(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    assert.ok(Array.isArray(payload.data))
    // Метаданные пагинации: текущая страница, размер страницы, всего элементов.
    assert.strictEqual(payload.meta.page, 1)
    assert.strictEqual(typeof payload.meta.perPage, 'number')
    assert.strictEqual(typeof payload.meta.total, 'number')
  })

  await t.test('get course by id', async () => {
    // Сначала берём список, чтобы взять реально существующий id
    // (не хардкодим, т.к. сиды генерируются случайно).
    const allCoursesRes = await app.inject({
      url: '/courses'
    })
    const allCourses = JSON.parse(allCoursesRes.payload).data

    // Проверяем детальный маршрут только если есть хотя бы один курс.
    if (allCourses.length > 0) {
      const courseId = allCourses[0].id
      const res = await app.inject({
        url: `/courses/${courseId}`
      })
      assert.strictEqual(res.statusCode, 200)
      const payload = JSON.parse(res.payload)
      // Вернулся именно запрошенный курс…
      assert.strictEqual(payload.id, courseId)
      // …и вложенный массив уроков (GET /courses/:id отдаёт курс + lessons).
      assert.ok(Array.isArray(payload.lessons))
    }
  })

  await t.test('get non-existent course', async () => {
    // Заведомо отсутствующий id → 404 (fastify.assert в маршруте).
    const res = await app.inject({
      url: '/courses/999999'
    })
    assert.strictEqual(res.statusCode, 404)
  })
})
