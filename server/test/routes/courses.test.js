import { test } from 'node:test'
import assert from 'node:assert'
import { build } from '../helper.js'

test('courses routes', async (t) => {
  const app = await build(t)

  await t.test('get all courses', async () => {
    const res = await app.inject({
      url: '/courses'
    })
    assert.strictEqual(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    assert.ok(Array.isArray(payload))
  })

  await t.test('get course by id', async () => {
    // Получаем сначала все курсы, чтобы взять существующий ID
    const allCoursesRes = await app.inject({
      url: '/courses'
    })
    const allCourses = JSON.parse(allCoursesRes.payload)
    
    if (allCourses.length > 0) {
      const courseId = allCourses[0].id
      const res = await app.inject({
        url: `/courses/${courseId}`
      })
      assert.strictEqual(res.statusCode, 200)
      const payload = JSON.parse(res.payload)
      assert.strictEqual(payload.id, courseId)
      assert.ok(Array.isArray(payload.lessons))
    }
  })

  await t.test('get non-existent course', async () => {
    const res = await app.inject({
      url: '/courses/999999'
    })
    assert.strictEqual(res.statusCode, 404)
  })
})
