// Общий хелпер для тестов: собирает экземпляр приложения и корректно его
// останавливает после каждого теста. Переиспользуется во всех *.test.js,
// чтобы не дублировать логику запуска.

import helper from 'fastify-cli/helper.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// В ESM нет __dirname — восстанавливаем его из import.meta.url,
// чтобы построить абсолютный путь до app.js независимо от текущей папки.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const AppPath = path.join(__dirname, '..', 'app.js')

// Конфиг, с которым приложение поднимается именно в тестах.
function config () {
  return {
    // skipOverride: true заставляет fastify-plugin НЕ инкапсулировать плагины,
    // поэтому декораторы (например, fastify.db) видны снаружи — это нужно,
    // чтобы в тестах можно было обращаться к app.db напрямую.
    skipOverride: true
  }
}

// Поднимает приложение через хелпер fastify-cli и регистрирует автоматическую
// остановку. Принимает t (контекст теста node:test) для хука очистки.
async function build (t) {
  // helper.build принимает argv в том же формате, что и CLI-команда
  // `fastify start`. Передаём только путь до приложения.
  const argv = [AppPath]

  // Собираем инстанс Fastify (плагины + маршруты загружаются автозагрузкой).
  const app = await helper.build(argv, config())

  // t.after выполнится по завершении теста — закрываем сервер,
  // чтобы освободить ресурсы (соединение с БД и т.д.).
  t.after(() => app.close())

  return app
}

export {
  config,
  build
}
