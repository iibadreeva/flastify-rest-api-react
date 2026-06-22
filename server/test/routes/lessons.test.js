import { test } from 'node:test'
import assert from 'node:assert'
import { build } from '../helper.js'

test('lessons routes', async (t) => {
  const app = await build(t)

  await t.test('get all lessons', async () => {
    const res = await app.inject({
      url: '/lessons'
    })
    assert.strictEqual(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    assert.ok(Array.isArray(payload))
  })

  await t.test('get lesson by id', async () => {
    const allLessonsRes = await app.inject({
      url: '/lessons'
    })
    const allLessons = JSON.parse(allLessonsRes.payload)
    
    if (allLessons.length > 0) {
      const lessonId = allLessons[0].id
      const res = await app.inject({
        url: `/lessons/${lessonId}`
      })
      assert.strictEqual(res.statusCode, 200)
      const payload = JSON.parse(res.payload)
      assert.strictEqual(payload.id, lessonId)
    }
  })

  await t.test('get non-existent lesson', async () => {
    const res = await app.inject({
      url: '/lessons/999999'
    })
    assert.strictEqual(res.statusCode, 404)
  })
})
