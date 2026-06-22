import { DB_FILE } from './db/config.js'

export default {
    dialect: 'sqlite',
    schema: './db/schema.js',
    out: './drizzle',
    dbCredentials: {
        url: DB_FILE,
    },
}