// Единый источник пути к файлу БД для приложения, миграций и сидов.
// Можно переопределить через переменную окружения DATABASE_URL.
export const DB_FILE = process.env.DATABASE_URL ?? './sqlite.db'
