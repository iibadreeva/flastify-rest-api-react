// node:test — встроенный тест-раннер Node.js (без сторонних зависимостей).
import { test } from 'node:test'
// node:assert — встроенная библиотека проверок.
import * as assert from 'node:assert'
import { build } from '../helper.js'

// Проверяем корневой маршрут GET / — он должен отдавать { root: true }.
test('default root route', async (t) => {
  // Поднимаем приложение (закроется автоматически после теста).
  const app = await build(t)

  // app.inject выполняет HTTP-запрос «в памяти», без реального сетевого порта —
  // это быстро и не требует слушать порт.
  const res = await app.inject({
    url: '/'
  })

  // Тело ответа — строка; парсим JSON и сравниваем с ожидаемым объектом.
  assert.deepStrictEqual(JSON.parse(res.payload), { root: true })
})
