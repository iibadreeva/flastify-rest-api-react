import path from 'node:path'
import { fileURLToPath } from 'node:url'

import AutoLoad from '@fastify/autoload'
import ajvFormats from 'ajv-formats'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Опции, передаваемые в `fastify` со стороны fastify-cli.
// Подключаем ajv-formats, чтобы в схемах работали форматы (email, date-time и т.д.).
export const options = {
    ajv: {
        plugins: [ajvFormats],
    },
}

export default async function (fastify, opts) {
    // Автозагрузка плагинов из каталога `plugins` (БД, cors, sensible и т.д.).
    fastify.register(AutoLoad, {
        dir: path.join(__dirname, 'plugins'),
        options: { ...opts },
    })

    // Автозагрузка маршрутов из каталога `routes`.
    // Имя подкаталога становится префиксом маршрута (routes/courses -> /courses).
    fastify.register(AutoLoad, {
        dir: path.join(__dirname, 'routes'),
        options: { ...opts },
    })
}
