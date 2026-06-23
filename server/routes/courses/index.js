import { asc, eq, count } from 'drizzle-orm'

import { courses, courseLessons } from '../../db/schema.js'

const perPage = 3

// Допустимые поля курса (используются в схемах create/update).
// creatorId здесь не указываем: автор проставляется автоматически из токена
// текущего пользователя и не может быть передан/изменён через тело запроса.
const courseProperties = {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
}

const listQuerystring = {
    type: 'object',
    properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
    },
}

const idParams = {
    type: 'object',
    required: ['id'],
    properties: {
        id: { type: 'integer' },
    },
}

const createBody = {
    type: 'object',
    required: ['name', 'description'],
    additionalProperties: false,
    properties: courseProperties,
}

const updateBody = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: courseProperties,
}

export default async function (fastify) {
    // GET /courses?page=2 — список с пагинацией
    fastify.get(
        '/',
        { schema: { tags: ['courses'], querystring: listQuerystring } },
        async (request) => {
            const { page } = request.query

            // Сами элементы текущей страницы (limit/offset = пагинация).
            const data = await fastify.db.query.courses.findMany({
                orderBy: asc(courses.id),
                limit: perPage,
                offset: (page - 1) * perPage,
            })

            // Общее количество записей в таблице — для метаданных пагинации.
            const [{ total }] = await fastify.db
                .select({ total: count() })
                .from(courses)

            // meta: текущая страница, размер страницы и всего элементов.
            return { data, meta: { page, perPage, total } }
        },
    )

    // GET /courses/:id — курс вместе с уроками
    fastify.get(
        '/:id',
        { schema: { tags: ['courses'], params: idParams } },
        async (request) => {
            const { id } = request.params

            const course = await fastify.db.query.courses.findFirst({
                where: eq(courses.id, id),
            })

            fastify.assert(course, 404, 'Курс не найден')

            const lessons = fastify.db
                .select()
                .from(courseLessons)
                .where(eq(courseLessons.courseId, id))
                .all()

            return { ...course, lessons }
        },
    )

    // GET /courses/:id/lessons — уроки конкретного курса (вложенный ресурс).
    // Уроки существуют только в контексте курса, поэтому доступны по
    // вложенному URL. Формат ответа такой же, как у остальных списков.
    fastify.get(
        '/:id/lessons',
        { schema: { tags: ['courses'], params: idParams, querystring: listQuerystring } },
        async (request) => {
            const { id } = request.params
            const { page } = request.query

            // Родительский курс должен существовать — иначе вложенный
            // ресурс не имеет смысла (404).
            const course = await fastify.db.query.courses.findFirst({
                where: eq(courses.id, id),
            })
            fastify.assert(course, 404, 'Курс не найден')

            // Уроки текущей страницы, принадлежащие этому курсу.
            const data = await fastify.db.query.courseLessons.findMany({
                where: eq(courseLessons.courseId, id),
                orderBy: asc(courseLessons.id),
                limit: perPage,
                offset: (page - 1) * perPage,
            })

            // Всего уроков у курса — для метаданных пагинации.
            const [{ total }] = await fastify.db
                .select({ total: count() })
                .from(courseLessons)
                .where(eq(courseLessons.courseId, id))

            return { data, meta: { page, perPage, total } }
        },
    )

    // POST /courses — создание (только для авторизованных)
    fastify.post(
        '/',
        {
            schema: { tags: ['courses'], body: createBody, security: [{ bearerAuth: [] }] },
            onRequest: [fastify.authenticate],
        },
        async (request, reply) => {
            // Автором курса становится текущий авторизованный пользователь.
            const [course] = await fastify.db.insert(courses)
                .values({ ...request.body, creatorId: request.user.id })
                .returning()

            return reply.code(201).send(course)
        },
    )

    // PATCH /courses/:id — обновление (только для авторизованных)
    fastify.patch(
        '/:id',
        {
            schema: { tags: ['courses'], params: idParams, body: updateBody, security: [{ bearerAuth: [] }] },
            onRequest: [fastify.authenticate],
        },
        async (request) => {
            const { id } = request.params

            const course = await fastify.db.query.courses.findFirst({
                where: eq(courses.id, id),
            })
            fastify.assert(course, 404, 'Курс не найден')
            // Редактировать курс может только его автор.
            fastify.assert(course.creatorId === request.user.id, 403, 'Недостаточно прав')

            const [updated] = await fastify.db.update(courses)
                .set(request.body)
                .where(eq(courses.id, id))
                .returning()

            return updated
        },
    )

    // DELETE /courses/:id — удаление (только для авторизованных)
    fastify.delete(
        '/:id',
        {
            schema: { tags: ['courses'], params: idParams, security: [{ bearerAuth: [] }] },
            onRequest: [fastify.authenticate],
        },
        async (request, reply) => {
            const { id } = request.params

            const course = await fastify.db.query.courses.findFirst({
                where: eq(courses.id, id),
            })
            fastify.assert(course, 404, 'Курс не найден')
            // Удалять курс может только его автор.
            fastify.assert(course.creatorId === request.user.id, 403, 'Недостаточно прав')

            await fastify.db.delete(courses).where(eq(courses.id, id))

            return reply.code(204).send()
        },
    )
}
