import fp from 'fastify-plugin'

import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
// Начальные данные для базы
import seed from '../db/seed.js'

// Описание схемы базы данных
import * as schemas from '../db/schema.js'

export default fp(async function (fastify) {
    const sqlite = new Database(':memory:')
    const db = drizzle(sqlite, { schema: schemas })
    // Автоматическое выполнение миграций
    migrate(db, { migrationsFolder: 'drizzle' })
    // Заполнение базы данных данными
    await seed(db)

    if (!fastify.db) {
        fastify.decorate('db', db)
        fastify.addHook('onClose', () => {
            sqlite.close()
        })
    }
})